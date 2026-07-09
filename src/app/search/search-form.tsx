"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

interface SearchFormProps {
  initialQuery?: string;
  initialType?: string;
}

export function SearchForm({
  initialQuery,
  initialType,
}: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [type, setType] = useState(initialType ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const params = new URLSearchParams();
    params.set("q", trimmed);
    if (type) params.set("type", type);

    router.push(`/search?${params.toString()}`);
  }

  function handleTypeChange(newType: string) {
    const nextType = type === newType ? "" : newType;
    setType(nextType);

    const trimmed = query.trim();
    if (!trimmed) return;

    const params = new URLSearchParams();
    params.set("q", trimmed);
    if (nextType) params.set("type", nextType);

    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
      <div className="relative mx-auto max-w-2xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar películas o series..."
          className="w-full rounded-lg border border-border-subtle bg-surface py-3 pl-12 pr-4 text-white placeholder-text-secondary outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand"
        />
      </div>

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => handleTypeChange("movie")}
          data-active={type === "movie"}
          className="rounded-md border border-border-subtle px-4 py-1.5 text-sm font-medium transition-colors data-[active=true]:border-accent-brand data-[active=true]:bg-accent-brand/10 data-[active=true]:text-accent-brand text-text-secondary hover:border-zinc-600"
        >
          Películas
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("tv")}
          data-active={type === "tv"}
          className="rounded-md border border-border-subtle px-4 py-1.5 text-sm font-medium transition-colors data-[active=true]:border-accent-brand data-[active=true]:bg-accent-brand/10 data-[active=true]:text-accent-brand text-text-secondary hover:border-zinc-600"
        >
          Series
        </button>
      </div>
    </form>
  );
}