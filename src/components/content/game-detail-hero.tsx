"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useTranslate } from "@/i18n/language-provider";
import type { IGDBGameDetail } from "@/types/igdb";
import { IGDB_IMAGE_BASE, IGDB_COVER_SIZE, IGDB_SCREENSHOT_SIZE } from "@/types/igdb";
import { Play } from "lucide-react";

interface GameDetailHeroProps {
  game: IGDBGameDetail;
}

function igdbUrl(size: string, imageId: string) {
  return `${IGDB_IMAGE_BASE}/t_${size}/${imageId}.jpg`;
}

export function GameDetailHero({ game }: GameDetailHeroProps) {
  const t = useTranslate();
  const [showTrailer, setShowTrailer] = useState(false);
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  const backdropUrl = game.screenshots?.[0]
    ? igdbUrl(IGDB_SCREENSHOT_SIZE, game.screenshots[0].image_id)
    : null;

  const posterUrl = game.cover?.image_id
    ? igdbUrl(IGDB_COVER_SIZE, game.cover.image_id)
    : null;

  const video = game.videos?.[0];
  const rating =
    game.aggregated_rating !== undefined
      ? Math.round(game.aggregated_rating / 10)
      : game.total_rating !== undefined
        ? Math.round(game.total_rating / 10)
        : game.rating !== undefined
          ? Math.round(game.rating / 10)
          : null;

  const developers =
    game.involved_companies
      ?.filter((c) => c.developer)
      .map((c) => c.company.name) ?? [];
  const publishers =
    game.involved_companies
      ?.filter((c) => c.publisher)
      .map((c) => c.company.name) ?? [];

  return (
    <>
      <section className="relative overflow-hidden">
        {backdropUrl && !backdropError && (
          <div className="absolute inset-0">
            <img
              src={backdropUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setBackdropError(true)}
            />
          </div>
        )}

        {video && (
          <div className="absolute inset-0 overflow-hidden hidden md:block">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.video_id}?autoplay=1&mute=1&loop=1&playlist=${video.video_id}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: "177.78vh",
                height: "56.25vw",
                minWidth: "100%",
                minHeight: "100%",
              }}
              allow="autoplay"
              title=""
            />
          </div>
        )}

        {video && <div className="absolute inset-0 bg-black/50" />}

        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:items-end md:gap-10 md:py-14 lg:px-12">
          {posterUrl && !posterError && (
            <div className="relative mx-auto aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-xl shadow-2xl md:mx-0 md:w-56 lg:w-64">
              <img
                src={posterUrl}
                alt={game.name}
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setPosterError(true)}
              />
            </div>
          )}

          <div className="flex flex-col gap-3 text-center md:text-left">
            <h1 lang="en" className="font-display text-3xl font-black uppercase tracking-tight text-white md:text-[42px] lg:text-[52px]">
              {game.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              {rating !== null && (
                <Badge variant="secondary" className="bg-accent/20 text-accent-brand text-sm">
                  ⭐ {rating}
                </Badge>
              )}
              {game.first_release_date && (
                <span className="text-sm text-text-secondary">
                  {new Date(game.first_release_date * 1000).getFullYear()}
                </span>
              )}
              {game.platforms && game.platforms.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {game.platforms.map((p) => (
                    <span
                      key={p.id}
                      lang="en"
                      className="rounded-md border border-border-subtle bg-surface/60 px-2 py-0.5 text-xs text-text-secondary"
                    >
                      {p.abbreviation || p.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {game.genres && game.genres.length > 0 && (
              <p lang="en" className="text-sm text-white/60">
                {game.genres.map((g) => g.name).join(" · ")}
              </p>
            )}

            {developers.length > 0 && (
              <p className="text-xs text-text-secondary">
                {t("game.developedBy")} <span lang="en" className="text-white">{developers.join(", ")}</span>
              </p>
            )}

            {publishers.length > 0 && (
              <p className="text-xs text-text-secondary">
                {t("game.publishedBy")} <span lang="en" className="text-white">{publishers.join(", ")}</span>
              </p>
            )}

            {video && (
              <div className="mt-2 flex justify-center md:justify-start">
                <button
                  onClick={() => setShowTrailer(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-gradient-to-r from-accent-brand to-accent-hover px-5 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent-brand/30"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {t("content.watchTrailer")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {showTrailer && video && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.video_id}?autoplay=1`}
              title={video.name}
              className="h-full w-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
