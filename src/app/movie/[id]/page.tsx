import type { Metadata } from "next";
import { headers } from "next/headers";
import { getMovieDetail, getPopular, getRecommendations, getWatchProviders } from "@/lib/tmdb";
import { DetailHero } from "@/components/content/detail-hero";
import { ContentGrid } from "@/components/content/content-grid";
import { FavoriteButton } from "@/components/content/favorite-button";
import { WatchlistButton } from "@/components/content/watchlist-button";
import { ReviewSection } from "@/components/content/review-section";
import { WatchProviders } from "@/components/content/watch-providers";
import { notFound } from "next/navigation";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import type { TMDBWatchProvidersResponse } from "@/types/tmdb";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const locale = await getServerLocale();
    const movie = await getMovieDetail(Number(id), locale);
    return {
      title: `${movie.title} (${movie.year}) — WikiFilms`,
      description: movie.overview.slice(0, 160),
      openGraph: {
        title: movie.title,
        description: movie.overview.slice(0, 160),
        images: movie.posterUrl ? [{ url: movie.posterUrl }] : [],
      },
    };
  } catch {
    const locale = await getServerLocale();
    const dict = await getDictionary(locale);
    return { title: dict["content.notFoundMovie"] };
  }
}

function extractRegion(al: string): string {
  const match = al.match(/-([A-Z]{2})/);
  return match?.[1] ?? "US";
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const h = await headers();
  const region = extractRegion(h.get("accept-language") ?? "");
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  let movie;
  let recommendations;
  let watchProviders: TMDBWatchProvidersResponse | null = null;

  try {
    [movie, recommendations, watchProviders] = await Promise.all([
      getMovieDetail(Number(id), locale),
      getRecommendations("movie", Number(id), locale),
      getWatchProviders("movie", Number(id), locale).catch(() => null),
    ]);
  } catch {
    notFound();
  }

  if (recommendations.length === 0) {
    recommendations = await getPopular("movie", 1, locale);
  }

  return (
    <main>
      <DetailHero content={movie} />

      {watchProviders && (
        <WatchProviders providers={watchProviders} detectedRegion={region} />
      )}

      <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-wrap gap-3">
          <FavoriteButton
            contentId={movie.id}
            title={movie.title}
            posterUrl={movie.posterUrl}
            type="movie"
          />
          <WatchlistButton
            contentId={movie.id}
            title={movie.title}
            posterUrl={movie.posterUrl}
            type="movie"
          />
        </div>
      </section>

      <ReviewSection contentId={movie.id} contentType="movie" contentTitle={movie.title} />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <ContentGrid title={dict["content.recommendations"]} items={recommendations} />
      </section>
    </main>
  );
}