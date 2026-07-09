import { getPopular } from "@/lib/tmdb";
import { ContentGrid } from "@/components/content/content-grid";

export default async function HomePage() {
  const [popularMovies, popularSeries] = await Promise.all([
    getPopular("movie"),
    getPopular("tv"),
  ]);

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

      <ContentGrid title="Películas Populares" items={popularMovies} />
      <ContentGrid title="Series Populares" items={popularSeries} />
    </main>
  );
}