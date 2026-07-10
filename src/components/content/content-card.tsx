"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useTranslate } from "@/i18n/language-provider";
import type { ContentResult } from "@/types/tmdb";

interface ContentCardProps {
  content: ContentResult;
}

export function ContentCard({ content }: ContentCardProps) {
  const t = useTranslate();
  const href =
    content.type === "movie"
      ? `/movie/${content.id}`
      : content.type === "tv"
        ? `/tv/${content.id}`
        : "#";

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-lg transition-transform duration-300 hover:scale-[1.03]"
    >
      <div className="relative aspect-[2/3] w-full">
        {content.posterUrl ? (
          <Image
            src={content.posterUrl}
            alt={content.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface text-text-secondary text-sm">
            {t("content.noImage")}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 md:opacity-0 transition-opacity duration-300 md:group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-0 md:translate-y-full transition-transform duration-300 md:group-hover:translate-y-0">
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