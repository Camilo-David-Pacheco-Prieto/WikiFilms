import { prisma } from "@/lib/prisma";
import { cachedFetch } from "@/lib/cache";

export interface LeaderboardEntry {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  score: number;
  reviewCount: number;
  favoriteCount: number;
  commentCount: number;
  reviewReactionsReceived: number;
  commentReactionsReceived: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return cachedFetch("leaderboard", async () => {
    const [
      reviewCounts,
      favoriteCounts,
      commentCounts,
      reviewReactions,
      commentReactions,
    ] = await Promise.all([
      prisma.review.groupBy({ by: ["userId"], _count: { id: true } }),
      prisma.favorite.groupBy({ by: ["userId"], _count: { id: true } }),
      prisma.reviewComment.groupBy({ by: ["userId"], _count: { id: true } }),
      prisma.reviewReaction.findMany({
        select: { review: { select: { userId: true } } },
      }),
      prisma.commentReaction.findMany({
        select: { comment: { select: { userId: true } } },
      }),
    ]);

    const reactionMap: Record<string, number> = {};
    for (const r of reviewReactions) {
      const uid = r.review.userId;
      reactionMap[uid] = (reactionMap[uid] || 0) + 1;
    }
    const commentReactionMap: Record<string, number> = {};
    for (const c of commentReactions) {
      const uid = c.comment.userId;
      commentReactionMap[uid] = (commentReactionMap[uid] || 0) + 1;
    }

    const reviewMap = new Map(reviewCounts.map((r) => [r.userId, r._count.id]));
    const favoriteMap = new Map(favoriteCounts.map((r) => [r.userId, r._count.id]));
    const commentMap = new Map(commentCounts.map((r) => [r.userId, r._count.id]));

    const allUserIds = new Set([
      ...reviewMap.keys(),
      ...favoriteMap.keys(),
      ...commentMap.keys(),
      ...Object.keys(reactionMap),
      ...Object.keys(commentReactionMap),
    ]);

    if (allUserIds.size === 0) return [];

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(allUserIds) } },
      select: { id: true, name: true, username: true, avatarUrl: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const entries: LeaderboardEntry[] = Array.from(allUserIds)
      .map((id) => {
        const reviewCount = reviewMap.get(id) ?? 0;
        const favoriteCount = favoriteMap.get(id) ?? 0;
        const commentCount = commentMap.get(id) ?? 0;
        const reviewReactionsReceived = reactionMap[id] ?? 0;
        const commentReactionsReceived = commentReactionMap[id] ?? 0;
        const score =
          reviewCount * 10 +
          favoriteCount * 5 +
          commentCount * 3 +
          reviewReactionsReceived * 2 +
          commentReactionsReceived;
        const u = userMap.get(id);
        return {
          id,
          name: u?.name ?? "Unknown",
          username: u?.username ?? "unknown",
          avatarUrl: u?.avatarUrl ?? null,
          score,
          reviewCount,
          favoriteCount,
          commentCount,
          reviewReactionsReceived,
          commentReactionsReceived,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    return entries;
  }, 300);
}
