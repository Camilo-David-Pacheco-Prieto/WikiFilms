import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getByGenre, GENRE_MAP, genreSlugToName } from "@/lib/tmdb";
import { ContentGrid } from "@/components/content/content-grid";
import { SkeletonGrid } from "@/components/content/skeleton-grid";
import { Pagination } from "@/components/content/pagination";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string; page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const genreName = genreSlugToName(slug);
  if (!genreName) return { title: "Género no encontrado" };
  return { title: genreName };
}

async function GenreContent({
  genreId,
  type,
  page,
  locale,
}: {
  genreId: number;
  type: "movie" | "tv";
  page: number;
  locale: string;
}) {
  const items = await getByGenre(type, genreId, page, locale);
  return <ContentGrid items={items} />;
}

export default async function GenrePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { type: rawType, page: rawPage } = await searchParams;
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  const genreName = genreSlugToName(slug);
  if (!genreName) notFound();

  const genreId = GENRE_MAP[genreName];
  if (!genreId) notFound();

  const activeType = rawType === "tv" ? "tv" : "movie";
  const currentPage = Math.max(1, Number(rawPage) || 1);

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-16">
      <div className="space-y-4">
        <h1 className="font-display text-4xl font-black uppercase text-text-primary">
          {genreName}
        </h1>

        <div className="flex gap-2 border-b border-border-subtle">
          <Link
            href={`/genre/${slug}`}
            data-active={activeType === "movie"}
            className="px-4 py-2 text-sm font-medium transition-colors data-[active=true]:border-b-2 data-[active=true]:border-accent-brand data-[active=true]:text-accent-brand text-text-secondary hover:text-text-primary"
          >
            {dict["genre.movies"]}
          </Link>
          <Link
            href={`/genre/${slug}?type=tv`}
            data-active={activeType === "tv"}
            className="px-4 py-2 text-sm font-medium transition-colors data-[active=true]:border-b-2 data-[active=true]:border-accent-brand data-[active=true]:text-accent-brand text-text-secondary hover:text-text-primary"
          >
            {dict["genre.series"]}
          </Link>
        </div>
      </div>

      <Suspense
        key={`${slug}-${activeType}-${currentPage}`}
        fallback={<SkeletonGrid title="" />}
      >
        <GenreContent
          genreId={genreId}
          type={activeType}
          page={currentPage}
          locale={locale}
        />
      </Suspense>

      <Pagination currentPage={currentPage} totalPages={10} />
    </main>
  );
}
