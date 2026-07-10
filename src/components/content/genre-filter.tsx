"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GENRE_ORDER_ES, GENRE_ORDER_EN } from "@/lib/tmdb";
import { useLanguage } from "@/i18n/language-provider";

export function GenreFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const activeGenre = searchParams.get("genre") || "";
  const genreNames = locale === "en" ? GENRE_ORDER_EN : GENRE_ORDER_ES;

  function handleGenre(genreName: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeGenre === genreName) {
      params.delete("genre");
    } else {
      params.set("genre", genreName);
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <div className="flex flex-wrap gap-2">
      {genreNames.map((name) => (
        <button
          key={name}
          onClick={() => handleGenre(name)}
          data-active={activeGenre === name}
          className="rounded-md border border-border-subtle px-3 py-1.5 text-xs font-medium transition-colors data-[active=true]:border-accent-brand data-[active=true]:bg-accent-brand/10 data-[active=true]:text-accent-brand text-text-secondary hover:border-zinc-600"
        >
          {name}
        </button>
      ))}
    </div>
  );
}
