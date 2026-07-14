import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get("contentId");
    const contentType = searchParams.get("contentType");

    if (!contentId || !contentType) {
      return NextResponse.json({ error: "Missing contentId or contentType" }, { status: 400 });
    }

    const numId = Number(contentId);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "Invalid contentId" }, { status: 400 });
    }

    const session = await auth();

    const reviews = await prisma.review.findMany({
      where: { contentId: numId, contentType },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { comments: true, reactions: true } },
        reactions: session?.user?.id
          ? { where: { userId: session.user.id }, select: { type: true } }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });

    const reviewIds = reviews.map((r) => r.id);

    const [likeCounts, dislikeCounts] = await Promise.all([
      prisma.reviewReaction.groupBy({
        by: ["reviewId"],
        where: { reviewId: { in: reviewIds }, type: "LIKE" },
        _count: true,
      }),
      prisma.reviewReaction.groupBy({
        by: ["reviewId"],
        where: { reviewId: { in: reviewIds }, type: "DISLIKE" },
        _count: true,
      }),
    ]);

    const likeMap = new Map(likeCounts.map((l) => [l.reviewId, l._count]));
    const dislikeMap = new Map(dislikeCounts.map((d) => [d.reviewId, d._count]));

    const result = reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      contentId: r.contentId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: r.user,
      likes: likeMap.get(r.id) ?? 0,
      dislikes: dislikeMap.get(r.id) ?? 0,
      commentCount: r._count.comments,
      myReaction: r.reactions && r.reactions.length > 0 ? r.reactions[0].type : null,
    }));

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("GET reviews error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentId, contentType, rating, comment } = await req.json();

    if (!contentId || typeof contentId !== "number" || !contentType || !rating || rating < 1 || rating > 10) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    if (comment && comment.length > 500) {
      return NextResponse.json({ error: "Comment too long" }, { status: 400 });
    }

    const review = await prisma.review.upsert({
      where: {
        userId_contentId_contentType: { userId: session.user.id, contentId, contentType },
      },
      update: { rating, comment },
      create: { userId: session.user.id, contentId, contentType, rating, comment },
    });

    return NextResponse.json(review);
  } catch (e) {
    console.error("POST review error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
