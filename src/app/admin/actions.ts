import { prisma } from "@/lib/prisma";
import { cachedFetch } from "@/lib/cache";

export interface AdminStats {
  totalUsers: number;
  newUsers30d: number;
  totalReviews: number;
  totalFavorites: number;
  avgRating: number | null;
  topContent: { contentId: number; title: string; type: string; posterUrl: string | null; count: number }[];
  activeUsers: { id: string; name: string; username: string; avatarUrl: string | null; reviewCount: number }[];
  reviewsByMonth: { month: string; count: number }[];
  contentTypeDist: { type: string; count: number }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  return cachedFetch("admin:stats", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [
      totalUsers,
      newUsers30d,
      totalReviews,
      totalFavorites,
      avgRatingResult,
      topContent,
      reviewGroup,
      recentReviews,
      contentTypeDist,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.review.count(),
      prisma.favorite.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),
      prisma.favorite.groupBy({
        by: ["contentId", "title", "type", "posterUrl"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.review.groupBy({
        by: ["userId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.review.findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.review.groupBy({
        by: ["contentType"],
        _count: { id: true },
      }),
    ]);

    const userIds = reviewGroup.map((r) => r.userId);
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, username: true, avatarUrl: true },
        })
      : [];

    const userMap = new Map(users.map((u) => [u.id, u]));
    const activeUsers = reviewGroup.map((r) => {
      const u = userMap.get(r.userId);
      return {
        id: r.userId,
        name: u?.name ?? "Unknown",
        username: u?.username ?? "unknown",
        avatarUrl: u?.avatarUrl ? `/api/blob?pathname=${encodeURIComponent(u.avatarUrl)}` : null,
        reviewCount: r._count.id,
      };
    });

    const monthCounts: Record<string, number> = {};
    for (const review of recentReviews) {
      const key = `${review.createdAt.getFullYear()}-${String(review.createdAt.getMonth() + 1).padStart(2, "0")}`;
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    }
    const reviewsByMonth = Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    return {
      totalUsers,
      newUsers30d,
      totalReviews,
      totalFavorites,
      avgRating: avgRatingResult._avg.rating,
      topContent: topContent.map((t) => ({
        contentId: t.contentId,
        title: t.title,
        type: t.type,
        posterUrl: t.posterUrl,
        count: t._count.id,
      })),
      activeUsers,
      reviewsByMonth,
      contentTypeDist: contentTypeDist.map((c) => ({
        type: c.contentType,
        count: c._count.id,
      })),
    };
  }, 300);
}
