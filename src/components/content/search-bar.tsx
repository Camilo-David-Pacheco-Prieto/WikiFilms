"use client";

import { useState, FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslate } from "@/i18n/language-provider";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslate();

  const isGamesSection = pathname.startsWith("/games") || pathname.startsWith("/game");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) {
      const params = new URLSearchParams();
      params.set("q", trimmed);
      if (isGamesSection) params.set("type", "game");
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t(isGamesSection ? "nav.searchGamesPlaceholder" : "nav.searchPlaceholder")}
          className="bg-muted/50 pl-10 text-sm"
        />
      </div>
    </form>
  );
}
