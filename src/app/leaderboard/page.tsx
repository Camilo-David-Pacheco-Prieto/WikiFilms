import { getLeaderboard, getContentLeaderboard } from "./actions";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import Link from "next/link";
import { SafeAvatar } from "@/components/ui/safe-avatar";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  return { title: dict["leaderboard.title"] };
}

export default async function LeaderboardPage() {
  const [entries, contentEntries, locale] = await Promise.all([
    getLeaderboard(),
    getContentLeaderboard(),
    getServerLocale(),
  ]);
  const dict = await getDictionary(locale);

  const typeLabels: Record<string, string> = {
    movie: dict["search.filterMovies"],
    tv: dict["search.filterSeries"],
    game: dict["search.filterGames"],
  };

  const contentTypeLink = (type: string, id: number) => {
    const map: Record<string, string> = {
      movie: `/movie/${id}`,
      tv: `/tv/${id}`,
      game: `/game/${id}`,
    };
    return map[type] ?? "#";
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold uppercase text-white">
        {dict["leaderboard.heading"]}
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        {dict["leaderboard.description"]}
      </p>

      <div className="mt-8 space-y-2">
        {entries.length === 0 && (
          <p className="text-sm text-text-secondary">{dict["leaderboard.noData"]}</p>
        )}
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface px-4 py-3 transition-colors hover:bg-muted/50"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-text-secondary">
              {i + 1}
            </span>

            <Link href={`/user/${entry.id}`} className="flex items-center gap-3 min-w-0 flex-1">
              <SafeAvatar src={entry.avatarUrl} name={entry.name} />

              <div className="min-w-0">
                <p className="truncate font-medium text-white transition-colors hover:text-accent-brand">
                  {entry.name}
                </p>
                <p className="truncate text-xs text-text-secondary">
                  @{entry.username}
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-4 text-xs text-text-secondary sm:flex">
              <span title={dict["leaderboard.reviews"]}>
                {entry.reviewCount}r
              </span>
              <span title={dict["leaderboard.favorites"]}>
                {entry.favoriteCount}f
              </span>
              <span title={dict["leaderboard.comments"]}>
                {entry.commentCount}c
              </span>
            </div>

            <span className="shrink-0 text-sm font-bold text-accent-brand">
              {entry.score.toLocaleString()} pt
            </span>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-12 font-display text-2xl font-bold uppercase text-white">
        {dict["leaderboard.contentHeading"] ?? "Contenido más popular"}
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        {dict["leaderboard.contentDescription"] ?? "Los títulos más favoritados por la comunidad"}
      </p>

      <div className="space-y-2">
        {contentEntries.length === 0 && (
          <p className="text-sm text-text-secondary">{dict["admin.noData"]}</p>
        )}
        {contentEntries.map((item, i) => (
          <Link
            key={`${item.contentId}-${item.type}`}
            href={contentTypeLink(item.type, item.contentId)}
            className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface px-4 py-3 transition-colors hover:bg-muted/50"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-text-secondary">
              {i + 1}
            </span>

            {item.posterUrl && (
              <div className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="h-12 w-9 rounded object-cover"
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white transition-colors hover:text-accent-brand">
                {item.title}
              </p>
              <p className="text-xs text-text-secondary">
                {typeLabels[item.type] ?? item.type}
              </p>
            </div>

            <span className="shrink-0 text-sm font-medium text-accent-brand">
              {item.count}x
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
