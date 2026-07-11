import { Suspense } from "react";
import { getPopular, getByGenre, getTrending, GENRE_MAP } from "@/lib/tmdb";
import { ContentGrid } from "@/components/content/content-grid";
import { SkeletonGrid } from "@/components/content/skeleton-grid";
import { GenreFilter } from "@/components/content/genre-filter";
import { HeroSlider } from "@/components/content/hero-slider";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

interface Props {
  searchParams: Promise<{ genre?: string }>;
}

async function PopularMovies({ genreId, title, locale }: { genreId?: number; title: string; locale?: string }) {
  const movies = genreId
    ? await getByGenre("movie", genreId, 1, locale)
    : await getPopular("movie", 1, locale);
  return (
    <ContentGrid
      title={title}
      items={movies}
      href="/search?type=movie"
    />
  );
}

async function PopularSeries({ genreId, title, locale }: { genreId?: number; title: string; locale?: string }) {
  const series = genreId
    ? await getByGenre("tv", genreId, 1, locale)
    : await getPopular("tv", 1, locale);
  return (
    <ContentGrid
      title={title}
      items={series}
      href="/search?type=tv"
    />
  );
}

async function HeroSection({ locale }: { locale: string }) {
  const trending = await getTrending("all", 1, locale);
  const shuffled = [...trending].sort(() => Math.random() - 0.5);

  return <HeroSlider items={shuffled} />;
}

export default async function HomePage({ searchParams }: Props) {
  const { genre } = await searchParams;
  const genreId = genre ? GENRE_MAP[genre] : undefined;
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-8">
      <Suspense fallback={<div className="min-h-[400px] rounded-xl bg-surface md:min-h-[500px]" />}>
        <HeroSection locale={locale} />
      </Suspense>

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
        <PopularMovies genreId={genreId} title={dict["home.popularMovies"]} locale={locale} />
      </Suspense>

      <Suspense
        key={`series-${genreId ?? "all"}`}
        fallback={<SkeletonGrid title={dict["home.popularSeries"]} />}
      >
        <PopularSeries genreId={genreId} title={dict["home.popularSeries"]} locale={locale} />
      </Suspense>
    </main>
  );
}
