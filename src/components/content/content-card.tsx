"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useTranslate } from "@/i18n/language-provider";
import type { ContentResult } from "@/types/tmdb";

interface ContentCardProps {
  content: ContentResult;
}

export function ContentCard({ content }: ContentCardProps) {
  const t = useTranslate();
  const [imgError, setImgError] = useState(false);
  const href =
    content.type === "movie"
      ? `/movie/${content.id}`
      : content.type === "tv"
        ? `/tv/${content.id}`
        : content.type === "game"
          ? `/game/${content.id}`
          : "#";

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-lg transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
    >
      <div className="relative aspect-[2/3] w-full">
        {content.posterUrl && !imgError ? (
          <img
            src={content.posterUrl}
            alt={content.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface text-text-secondary text-sm">
            {t("content.noImage")}
          </div>
        )}

        <Badge
          variant="secondary"
          className="absolute right-1.5 top-1.5 z-10 bg-black/60 text-[10px] text-white border-0 md:hidden"
        >
          {content.rating.toFixed(1)}
        </Badge>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 md:from-black/80 via-transparent to-transparent opacity-100 md:opacity-0 transition-opacity duration-300 md:group-hover:opacity-100" />

        <div className="absolute bottom-0 left-0 right-0 p-2 md:hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="font-display text-xs font-bold uppercase leading-tight text-white drop-shadow-lg line-clamp-1">
            {content.title}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 hidden md:block md:translate-y-full transition-transform duration-300 md:group-hover:translate-y-0">
          <p className="font-display text-lg font-bold uppercase leading-tight text-white">
            {content.title}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-text-secondary">{content.year}</span>
            <Badge
              variant="secondary"
              className="bg-accent/20 text-xs text-accent-brand"
            >
              {content.rating.toFixed(1)}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}