import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminStats } from "./actions";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import { StatsChart } from "@/components/admin/stats-chart";
import { SafeAvatar } from "@/components/ui/safe-avatar";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  return { title: dict["admin.title"] };
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  const [stats, locale] = await Promise.all([
    getAdminStats(),
    getServerLocale(),
  ]);
  const dict = await getDictionary(locale);

  const typeLabels: Record<string, string> = {
    movie: dict["search.filterMovies"],
    tv: dict["search.filterSeries"],
    game: dict["search.filterGames"],
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={dict["admin.totalUsers"]} value={stats.totalUsers} />
        <StatCard label={dict["admin.newUsers"]} value={stats.newUsers30d} />
        <StatCard
          label={dict["admin.totalReviews"]}
          value={stats.totalReviews}
        />
        <StatCard
          label={dict["admin.totalFavorites"]}
          value={stats.totalFavorites}
        />
      </div>

      <div className="mt-8">
        <StatsChart
          reviewsByMonth={stats.reviewsByMonth}
          contentTypeDist={stats.contentTypeDist}
        />
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-bold text-white">
            {dict["admin.topContent"]}
          </h2>
          <div className="space-y-2">
            {stats.topContent.map((item, i) => (
              <div
                key={`${item.contentId}-${item.type}`}
                className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 text-sm font-bold text-text-secondary">
                    #{i + 1}
                  </span>
                  {item.posterUrl && (
                    <div className="shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="h-10 w-7 rounded object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {typeLabels[item.type] ?? item.type}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium text-accent-brand">
                  {item.count}x
                </span>
              </div>
            ))}
            {stats.topContent.length === 0 && (
              <p className="text-sm text-text-secondary">{dict["admin.noData"]}</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-white">
            {dict["admin.activeUsers"]}
          </h2>
          <div className="space-y-2">
            {stats.activeUsers.map((user, i) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 text-sm font-bold text-text-secondary">
                    #{i + 1}
                  </span>
                  <SafeAvatar src={user.avatarUrl} name={user.name} className="size-8" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium text-accent-brand">
                  {user.reviewCount}r
                </span>
              </div>
            ))}
            {stats.activeUsers.length === 0 && (
              <p className="text-sm text-text-secondary">{dict["admin.noData"]}</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface px-4 py-5">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}
