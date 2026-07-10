import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get("contentId");

  if (!contentId) {
    return NextResponse.json({ error: "Missing contentId" }, { status: 400 });
  }

  const session = await auth();

  const reviews = await prisma.review.findMany({
    where: { contentId: Number(contentId) },
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

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentId, rating, comment } = await req.json();

  if (!contentId || !rating || rating < 1 || rating > 10) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  if (comment && comment.length > 500) {
    return NextResponse.json({ error: "Comment too long" }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: {
      userId_contentId: { userId: session.user.id, contentId },
    },
    update: { rating, comment },
    create: { userId: session.user.id, contentId, rating, comment },
  });

  return NextResponse.json(review);
}
