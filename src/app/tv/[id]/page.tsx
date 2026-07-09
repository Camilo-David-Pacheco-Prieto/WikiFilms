import type { Metadata } from "next";
import { headers } from "next/headers";
import { getSeriesDetail, getPopular, getWatchProviders } from "@/lib/tmdb";
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
    const series = await getSeriesDetail(Number(id));
    return {
      title: `${series.title} (${series.year}) — WikiFilms`,
      description: series.overview.slice(0, 160),
      openGraph: {
        title: series.title,
        description: series.overview.slice(0, 160),
        images: series.posterUrl ? [{ url: series.posterUrl }] : [],
      },
    };
  } catch {
    return { title: "Serie no encontrada — WikiFilms" };
  }
}

function extractRegion(al: string): string {
  const match = al.match(/-([A-Z]{2})/);
  return match?.[1] ?? "US";
}

export default async function SeriesPage({ params }: Props) {
  const { id } = await params;
  const h = await headers();
  const region = extractRegion(h.get("accept-language") ?? "");

  let series;
  let popular;
  let watchProviders: TMDBWatchProvidersResponse | null = null;

  try {
    [series, popular, watchProviders] = await Promise.all([
      getSeriesDetail(Number(id)),
      getPopular("tv"),
      getWatchProviders("tv", Number(id)).catch(() => null),
    ]);
  } catch {
    notFound();
  }

  return (
    <main>
      <DetailHero content={series} />

      {watchProviders && (
        <WatchProviders providers={watchProviders} detectedRegion={region} />
      )}

      <section className="mx-auto max-w-7xl px-4 py-8">
        <FavoriteButton
          contentId={series.id}
          title={series.title}
          posterUrl={series.posterUrl}
          type="tv"
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <ContentGrid title="Más series populares" items={popular} />
      </section>
    </main>
  );
}