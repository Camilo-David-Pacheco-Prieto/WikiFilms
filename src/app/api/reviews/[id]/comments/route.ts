import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: reviewId } = await params;

    const comments = await prisma.reviewComment.findMany({
      where: { reviewId },
      include: {
        user: { select: { id: true, name: true } },
        parent: { select: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "asc" },
    });

    const mapped = comments.map((c) => ({
      id: c.id,
      comment: c.comment,
      createdAt: c.createdAt,
      parentId: c.parentId,
      userId: c.userId,
      reviewId: c.reviewId,
      user: c.user,
      parentUser: c.parent?.user?.name ?? null,
    }));

    return NextResponse.json(mapped);
  } catch (e) {
    console.error("GET comments error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reviewId } = await params;

    const { comment, contentType, parentId } = await req.json();
    if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    if (comment.length > 500) {
      return NextResponse.json({ error: "Comment too long" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const created = await prisma.reviewComment.create({
      data: { reviewId, userId: session.user.id, comment: comment.trim(), parentId: parentId || null },
    });

    const contentId = review.contentId;
    const notifContentType = contentType ?? null;

    async function createNotif(data: Parameters<typeof prisma.notification.create>[0]["data"], retries = 1) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          await prisma.notification.create({ data });
          return;
        } catch (e) {
          if (attempt < retries) continue;
          console.error("Failed to create notification:", e);
        }
      }
    }

    if (review.userId !== session.user.id) {
      await createNotif({
        userId: review.userId,
        actorId: session.user.id,
        type: "COMMENT",
        reviewId: review.id,
        contentId,
        contentType: notifContentType,
      });
    }

    if (parentId) {
      const parentComment = await prisma.reviewComment.findUnique({
        where: { id: parentId },
        select: { userId: true },
      });
      if (parentComment && parentComment.userId !== session.user.id && parentComment.userId !== review.userId) {
        await createNotif({
          userId: parentComment.userId,
          actorId: session.user.id,
          type: "REPLY",
          reviewId: review.id,
          contentId,
          contentType: notifContentType,
        });
      }
    }

    return NextResponse.json({
      ...created,
      user: { id: session.user.id, name: session.user.name },
      parentUser: null,
    });
  } catch (e) {
    console.error("POST comment error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
