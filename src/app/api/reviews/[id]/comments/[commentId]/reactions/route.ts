import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;
    const { type, contentType } = await req.json();
    if (type !== "LIKE" && type !== "DISLIKE") {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    const comment = await prisma.reviewComment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, comment: true, deletedAt: true, reviewId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.deletedAt) {
      return NextResponse.json({ error: "Comment deleted" }, { status: 400 });
    }

    const existing = await prisma.commentReaction.findUnique({
      where: { commentId_userId: { commentId, userId: session.user.id } },
    });

    let action: string;

    if (existing) {
      if (existing.type === type) {
        await prisma.commentReaction.delete({ where: { id: existing.id } });
        return NextResponse.json({ action: "removed", type });
      }
      await prisma.commentReaction.update({
        where: { id: existing.id },
        data: { type },
      });
      action = "updated";
    } else {
      await prisma.commentReaction.create({
        data: { commentId, userId: session.user.id, type },
      });
      action = "created";
    }

    if (comment.userId !== session.user.id) {
      const parentReview = await prisma.review.findUnique({
        where: { id: comment.reviewId },
        select: { contentId: true },
      });
      const msg = comment.comment.length > 80 ? comment.comment.slice(0, 80) + "..." : comment.comment;
      for (let attempt = 0; attempt <= 1; attempt++) {
        try {
          await prisma.notification.create({
            data: {
              userId: comment.userId,
              actorId: session.user.id,
              type: type === "LIKE" ? "COMMENT_LIKE" : "COMMENT_DISLIKE",
              reviewId: comment.reviewId,
              commentId: comment.id,
              contentId: parentReview?.contentId ?? null,
              contentType: contentType ?? null,
              message: msg,
            },
          });
          break;
        } catch (e) {
          if (attempt < 1) continue;
          console.error("Failed to create comment reaction notification:", e);
        }
      }
    }

    return NextResponse.json({ action, type });
  } catch (e) {
    console.error("POST comment reaction error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
