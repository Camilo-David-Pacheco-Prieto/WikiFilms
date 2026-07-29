import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserProfile } from "./actions";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import { SafeAvatar } from "@/components/ui/safe-avatar";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  const profile = await getUserProfile(id);
  if (!profile) return { title: dict["user.notFound"] };
  return { title: `${profile.name} — WikiFilms` };
}

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, profile, locale] = await Promise.all([
    auth(),
    getUserProfile(id),
    getServerLocale(),
  ]);
  const dict = await getDictionary(locale);

  if (!profile) notFound();

  const isOwn = session?.user?.id === id;

  const contentTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      movie: dict["search.filterMovies"],
      tv: dict["search.filterSeries"],
      game: dict["search.filterGames"],
    };
    return map[type] ?? type;
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <div className="flex items-center gap-5">
          <SafeAvatar src={profile.avatarUrl} name={profile.name} className="size-16" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="truncate text-xl font-bold text-white">
                {profile.name}
              </h1>
              {profile.role === "ADMIN" && (
                <span className="shrink-0 rounded-md bg-accent-brand/10 px-2 py-0.5 text-xs font-medium text-accent-brand">
                  ADMIN
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-text-secondary">
              @{profile.username}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              {dict["user.memberSince"]}{" "}
              {new Date(profile.createdAt).toLocaleDateString(
                locale === "en" ? "en-US" : "es-ES",
                { year: "numeric", month: "long" },
              )}
            </p>
          </div>

          {isOwn && (
            <Link
              href="/settings"
              className="shrink-0 rounded-md bg-accent-brand px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              {dict["user.settings"]}
            </Link>
          )}
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4 border-t border-border-subtle pt-6">
          <StatBox label={dict["leaderboard.reviews"]} value={profile.reviewCount} />
          <StatBox label={dict["leaderboard.favorites"]} value={profile.favoriteCount} />
          <StatBox label={dict["leaderboard.comments"]} value={profile.commentCount} />
          <StatBox label="Score" value={profile.score} />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-white">
          {dict["user.recentReviews"]}
        </h2>
        {profile.recentReviews.length === 0 && (
          <p className="text-sm text-text-secondary">{dict["user.noReviews"]}</p>
        )}
        <div className="space-y-3">
          {profile.recentReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-border-subtle bg-surface px-5 py-4"
            >
              <div className="flex items-start gap-3">
                {review.posterUrl && (
                  <div className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={review.posterUrl}
                      alt={review.title}
                      className="h-16 w-11 rounded object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-white">
                      {review.title}
                    </p>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-sm font-bold text-yellow-400">
                        {review.rating}
                      </span>
                      <span className="text-xs text-yellow-400/60">/10</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {contentTypeLabel(review.contentType)}
                  </p>
                  {review.comment && (
                    <p className="mt-2 text-sm leading-relaxed text-text-primary line-clamp-3">
                      {review.comment}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-text-secondary">
                    {new Date(review.createdAt).toLocaleDateString(
                      locale === "en" ? "en-US" : "es-ES",
                      { year: "numeric", month: "short", day: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </div>
  );
}
