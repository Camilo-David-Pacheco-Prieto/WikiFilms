import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, contentType } = await req.json();
    if (type !== "LIKE" && type !== "DISLIKE") {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    const { id: reviewId } = await params;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const existing = await prisma.reviewReaction.findUnique({
      where: { reviewId_userId: { reviewId, userId: session.user.id } },
    });

    let action: string;

    if (existing) {
      if (existing.type === type) {
        await prisma.reviewReaction.delete({ where: { id: existing.id } });
        return NextResponse.json({ action: "removed", type });
      }
      await prisma.reviewReaction.update({
        where: { id: existing.id },
        data: { type },
      });
      action = "updated";
    } else {
      await prisma.reviewReaction.create({
        data: { reviewId, userId: session.user.id, type },
      });
      action = "created";
    }

    if (review.userId !== session.user.id) {
      prisma.notification.create({
        data: {
          userId: review.userId,
          actorId: session.user.id,
          type,
          reviewId: review.id,
          contentId: review.contentId,
          contentType: contentType ?? null,
        },
      }).catch((e) => console.error("Failed to create notification:", e));
    }

    return NextResponse.json({ action, type });
  } catch (e) {
    console.error("POST reaction error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
