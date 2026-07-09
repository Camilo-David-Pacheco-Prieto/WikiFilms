import type { Metadata } from "next";
import { getSeriesDetail, getPopular } from "@/lib/tmdb";
import { DetailHero } from "@/components/content/detail-hero";
import { ContentGrid } from "@/components/content/content-grid";
import { notFound } from "next/navigation";

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

export default async function SeriesPage({ params }: Props) {
  const { id } = await params;
  let series;
  let popular;

  try {
    series = await getSeriesDetail(Number(id));
    popular = await getPopular("tv");
  } catch {
    notFound();
  }

  return (
    <main>
      <DetailHero content={series} />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <ContentGrid title="Más series populares" items={popular} />
      </section>
    </main>
  );
}