"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GENRE_MAP } from "@/lib/tmdb";

export function GenreFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeGenre = searchParams.get("genre") || "";

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
      {Object.keys(GENRE_MAP).map((name) => (
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
