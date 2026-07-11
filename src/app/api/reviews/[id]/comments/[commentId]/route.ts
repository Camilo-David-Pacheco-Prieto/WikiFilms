import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;
    const { comment } = await req.json();

    if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    if (comment.length > 2000) {
      return NextResponse.json({ error: "Comment too long" }, { status: 400 });
    }

    const existing = await prisma.reviewComment.findUnique({
      where: { id: commentId },
      select: { userId: true, deletedAt: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.deletedAt) {
      return NextResponse.json({ error: "Cannot edit deleted comment" }, { status: 400 });
    }

    const updated = await prisma.reviewComment.update({
      where: { id: commentId },
      data: { comment: comment.trim(), editedAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH comment error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;

    const existing = await prisma.reviewComment.findUnique({
      where: { id: commentId },
      include: { _count: { select: { replies: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.deletedAt) {
      return NextResponse.json({ error: "Already deleted" }, { status: 400 });
    }

    if (existing._count.replies > 0) {
      await prisma.reviewComment.update({
        where: { id: commentId },
        data: { deletedAt: new Date(), comment: "[eliminado]" },
      });
    } else {
      await prisma.reviewComment.delete({ where: { id: commentId } });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE comment error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
