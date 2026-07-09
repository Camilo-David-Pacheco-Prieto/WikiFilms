import type { Metadata } from "next";
import { getMovieDetail, getPopular } from "@/lib/tmdb";
import { DetailHero } from "@/components/content/detail-hero";
import { ContentGrid } from "@/components/content/content-grid";
import { FavoriteButton } from "@/components/content/favorite-button";
import { notFound } from "next/navigation";

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

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  let movie;
  let popular;

  try {
    movie = await getMovieDetail(Number(id));
    popular = await getPopular("movie");
  } catch {
    notFound();
  }

  return (
    <main>
      <DetailHero content={movie} />

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