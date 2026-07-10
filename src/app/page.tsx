import { Suspense } from "react";
import { getPopular, getByGenre, GENRE_MAP } from "@/lib/tmdb";
import { ContentGrid } from "@/components/content/content-grid";
import { SkeletonGrid } from "@/components/content/skeleton-grid";
import { GenreFilter } from "@/components/content/genre-filter";
import { HeroBackdrops } from "@/components/content/hero-backdrops";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

interface Props {
  searchParams: Promise<{ genre?: string }>;
}

async function PopularMovies({ genreId, title }: { genreId?: number; title: string }) {
  const movies = genreId
    ? await getByGenre("movie", genreId)
    : await getPopular("movie");
  return (
    <ContentGrid
      title={title}
      items={movies}
      href="/search?type=movie"
    />
  );
}

async function PopularSeries({ genreId, title }: { genreId?: number; title: string }) {
  const series = genreId
    ? await getByGenre("tv", genreId)
    : await getPopular("tv");
  return (
    <ContentGrid
      title={title}
      items={series}
      href="/search?type=tv"
    />
  );
}

export default async function HomePage({ searchParams }: Props) {
  const { genre } = await searchParams;
  const genreId = genre ? GENRE_MAP[genre] : undefined;
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  const popular = await getPopular("movie", 1);
  const backdrops = popular
    .map((m) => m.backdropUrl)
    .filter((u): u is string => u !== null)
    .slice(0, 5);

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-8">
      <HeroBackdrops backdrops={backdrops}>
        <h1 className="font-display text-5xl font-black uppercase tracking-tight text-white md:text-7xl">
          {dict["home.title"]}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          {dict["home.subtitle"]}
        </p>
      </HeroBackdrops>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold uppercase text-white">
          {dict["home.filterByGenre"]}
        </h2>
        <GenreFilter />
      </section>

      <Suspense
        key={`movies-${genreId ?? "all"}`}
        fallback={<SkeletonGrid title={dict["home.popularMovies"]} />}
      >
        <PopularMovies genreId={genreId} title={dict["home.popularMovies"]} />
      </Suspense>

      <Suspense
        key={`series-${genreId ?? "all"}`}
        fallback={<SkeletonGrid title={dict["home.popularSeries"]} />}
      >
        <PopularSeries genreId={genreId} title={dict["home.popularSeries"]} />
      </Suspense>
    </main>
  );
}
