"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslate } from "@/i18n/language-provider";

export function SearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const t = useTranslate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("nav.searchPlaceholder")}
          className="w-full rounded-md bg-surface py-2 pl-10 pr-4 text-sm text-white placeholder-text-secondary outline-none focus:ring-2 focus:ring-accent-brand"
        />
      </div>
    </form>
  );
}
