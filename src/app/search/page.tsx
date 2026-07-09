import { searchContent, getPopular } from "@/lib/tmdb";
import { ContentGrid } from "@/components/content/content-grid";
import { SearchForm } from "./search-form";
import type { MediaType } from "@/types/tmdb";

interface Props {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, type } = await searchParams;
  const mediaType = type === "tv" ? "tv" : type === "movie" ? "movie" : undefined;

  let results;

  if (q) {
    const trimmed = q.trim();
    if (trimmed) {
      results = await searchContent(trimmed, mediaType as MediaType);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <SearchForm initialQuery={q ?? ""} initialType={mediaType ?? ""} />

      {q && results ? (
        results.length > 0 ? (
          <ContentGrid
            title={`Resultados para "${q}"`}
            items={results}
          />
        ) : (
          <div className="mt-16 text-center">
            <p className="text-lg text-text-secondary">
              No encontramos resultados para{" "}
              <span className="font-bold text-white">&quot;{q}&quot;</span>
            </p>
          </div>
        )
      ) : (
        <div className="mt-16 text-center">
          <p className="text-lg text-text-secondary">
            Busca tu película o serie favorita
          </p>
        </div>
      )}
    </main>
  );
}