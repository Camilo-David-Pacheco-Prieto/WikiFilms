import { prisma } from "@/lib/prisma";
import { cachedFetch } from "@/lib/cache";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  role: "USER" | "ADMIN";
  avatarUrl: string | null;
  createdAt: Date;
  reviewCount: number;
  favoriteCount: number;
  commentCount: number;
  score: number;
  recentReviews: {
    id: string;
    contentId: number;
    contentType: string;
    title: string;
    posterUrl: string | null;
    rating: number;
    comment: string | null;
    createdAt: Date;
  }[];
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  return cachedFetch(`user:profile:${id}`, async () => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    const [reviewCount, favoriteCount, commentCount, recentReviews, reviewGroup, reactionData, commentReactionData] =
      await Promise.all([
        prisma.review.count({ where: { userId: id } }),
        prisma.favorite.count({ where: { userId: id } }),
        prisma.reviewComment.count({ where: { userId: id } }),
        prisma.review.findMany({
          where: { userId: id },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            contentId: true,
            contentType: true,
            title: true,
            posterUrl: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        }),
        prisma.review.groupBy({
          by: ["userId"],
          _count: { id: true },
          where: { userId: id },
        }),
        prisma.reviewReaction.findMany({
          where: { review: { userId: id } },
          select: { id: true },
        }),
        prisma.commentReaction.findMany({
          where: { comment: { userId: id } },
          select: { id: true },
        }),
      ]);

    const reviewCountForScore = reviewGroup[0]?._count.id ?? 0;
    const score =
      reviewCountForScore * 10 +
      favoriteCount * 5 +
      commentCount * 3 +
      reactionData.length * 2 +
      commentReactionData.length;

    return {
      ...user,
      avatarUrl: user.avatarUrl
        ? `/api/blob?pathname=${encodeURIComponent(user.avatarUrl)}`
        : null,
      reviewCount,
      favoriteCount,
      commentCount,
      score,
      recentReviews,
    };
  }, 300);
}
