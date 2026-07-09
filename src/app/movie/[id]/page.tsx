import type { Metadata } from "next";
import { headers } from "next/headers";
import { getMovieDetail, getPopular, getWatchProviders } from "@/lib/tmdb";
import { DetailHero } from "@/components/content/detail-hero";
import { ContentGrid } from "@/components/content/content-grid";
import { FavoriteButton } from "@/components/content/favorite-button";
import { WatchProviders } from "@/components/content/watch-providers";
import { notFound } from "next/navigation";
import type { TMDBWatchProvidersResponse } from "@/types/tmdb";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const movie = await getMovieDetail(Number(id));
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
    return { title: "Película no encontrada — WikiFilms" };
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

  let movie;
  let popular;
  let watchProviders: TMDBWatchProvidersResponse | null = null;

  try {
    [movie, popular, watchProviders] = await Promise.all([
      getMovieDetail(Number(id)),
      getPopular("movie"),
      getWatchProviders("movie", Number(id)).catch(() => null),
    ]);
  } catch {
    notFound();
  }

  return (
    <main>
      <DetailHero content={movie} />

      {watchProviders && (
        <WatchProviders providers={watchProviders} detectedRegion={region} />
      )}

      <section className="mx-auto max-w-7xl px-4 py-8">
        <FavoriteButton
          contentId={movie.id}
          title={movie.title}
          posterUrl={movie.posterUrl}
          type="movie"
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <ContentGrid title="Más películas populares" items={popular} />
      </section>
    </main>
  );
}