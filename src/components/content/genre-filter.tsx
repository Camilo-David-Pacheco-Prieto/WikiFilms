"use client";

import Link from "next/link";
import { GENRE_ORDER_ES, GENRE_ORDER_EN, genreNameToSlug } from "@/lib/tmdb";
import { useLanguage } from "@/i18n/language-provider";

export function GenreFilter() {
  const { locale } = useLanguage();
  const genreNames = locale === "en" ? GENRE_ORDER_EN : GENRE_ORDER_ES;

  return (
    <div className="flex flex-wrap gap-2">
      {genreNames.map((name) => (
        <Link
          key={name}
          href={`/genre/${genreNameToSlug(name)}`}
          className="rounded-md border border-border-subtle px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent-brand hover:text-accent-brand text-text-secondary"
        >
          {name}
        </Link>
      ))}
    </div>
  );
}
