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
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
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

    const { comment, contentType } = await req.json();
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
      data: { reviewId, userId: session.user.id, comment: comment.trim() },
      include: { user: { select: { id: true, name: true } } },
    });

    if (review.userId !== session.user.id) {
      prisma.notification.create({
        data: {
          userId: review.userId,
          actorId: session.user.id,
          type: "COMMENT",
          reviewId: review.id,
          contentId: review.contentId,
          contentType: contentType ?? null,
        },
      }).catch((e) => console.error("Failed to create notification:", e));
    }

    return NextResponse.json(created);
  } catch (e) {
    console.error("POST comment error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
