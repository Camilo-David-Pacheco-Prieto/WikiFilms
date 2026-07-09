import { Suspense } from "react";
import { getPopular, getByGenre, GENRE_MAP } from "@/lib/tmdb";
import { ContentGrid } from "@/components/content/content-grid";
import { SkeletonGrid } from "@/components/content/skeleton-grid";
import { GenreFilter } from "@/components/content/genre-filter";

interface Props {
  searchParams: Promise<{ genre?: string }>;
}

async function PopularMovies({ genreId }: { genreId?: number }) {
  const movies = genreId ? await getByGenre("movie", genreId) : await getPopular("movie");
  return <ContentGrid title="Películas Populares" items={movies} />;
}

async function PopularSeries({ genreId }: { genreId?: number }) {
  const series = genreId ? await getByGenre("tv", genreId) : await getPopular("tv");
  return <ContentGrid title="Series Populares" items={series} />;
}

export default async function HomePage({ searchParams }: Props) {
  const { genre } = await searchParams;
  const genreId = genre ? GENRE_MAP[genre] : undefined;

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-8">
      <section className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-brand/20 to-transparent" />
        <div className="relative z-10 px-6 py-16 md:px-8 md:py-24">
          <h1 className="font-display text-5xl font-black uppercase tracking-tight text-white md:text-7xl">
            WikiFilms
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Tu enciclopedia cinematográfica personal. Explora las películas y
            series más populares, descubre detalles y encuentra tu próxima
            historia favorita.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold uppercase text-white">
          Filtrar por género
        </h2>
        <GenreFilter />
      </section>

      <Suspense
        key={`movies-${genreId ?? "all"}`}
        fallback={<SkeletonGrid title="Películas Populares" />}
      >
        <PopularMovies genreId={genreId} />
      </Suspense>

      <Suspense
        key={`series-${genreId ?? "all"}`}
        fallback={<SkeletonGrid title="Series Populares" />}
      >
        <PopularSeries genreId={genreId} />
      </Suspense>
    </main>
  );
}
