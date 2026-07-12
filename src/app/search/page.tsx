import { searchContent } from "@/lib/tmdb";
import { searchGames } from "@/lib/igdb";
import { ContentGrid } from "@/components/content/content-grid";
import { Pagination } from "@/components/content/pagination";
import { SearchForm } from "./search-form";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import type { MediaType } from "@/types/tmdb";

interface Props {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, type, page } = await searchParams;
  const mediaType = type === "tv" ? "tv" : type === "movie" ? "movie" : undefined;
  const isGameSearch = type === "game";
  const currentPage = Math.max(1, Number(page) || 1);
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  let results;
  let totalPages = 0;

  if (q) {
    const trimmed = q.trim();
    if (trimmed) {
      if (isGameSearch) {
        results = await searchGames(trimmed);
      } else {
        const data = await searchContent(trimmed, mediaType as MediaType, currentPage, locale);
        results = data.results;
        totalPages = data.totalPages;
      }
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <SearchForm initialQuery={q ?? ""} initialType={type ?? ""} />

      {q && results ? (
        results.length > 0 ? (
          <>
            <ContentGrid
              title={dict["search.resultsFor"]?.replace("{q}", q)}
              items={results}
            />
            {!isGameSearch && <Pagination currentPage={currentPage} totalPages={totalPages} />}
          </>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-lg text-text-secondary">
              {dict["search.noResults"]}
              <span className="font-bold text-white">&quot;{q}&quot;</span>
            </p>
          </div>
        )
      ) : (
        <div className="mt-16 text-center">
          <p className="text-lg text-text-secondary">
            {dict["search.emptyPrompt"]}
          </p>
        </div>
      )}
    </main>
  );
}
