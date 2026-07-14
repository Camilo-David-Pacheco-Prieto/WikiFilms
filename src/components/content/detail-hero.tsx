"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { TrailerModal } from "@/components/content/trailer-modal";
import { useTranslate } from "@/i18n/language-provider";
import type { ContentDetail } from "@/types/tmdb";

interface DetailHeroProps {
  content: ContentDetail;
}

export function DetailHero({ content }: DetailHeroProps) {
  const t = useTranslate();
  const [showTrailer, setShowTrailer] = useState(false);

  return (
    <section className="relative overflow-hidden">
      {content.backdropUrl && (
        <div className="absolute inset-0">
          <Image
            src={content.backdropUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />

          {content.trailerKey && (
            <div className="absolute inset-0 overflow-hidden hidden md:block">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${content.trailerKey}?autoplay=1&mute=1&loop=1&playlist=${content.trailerKey}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
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

          <div
            className={`absolute inset-0 transition-all duration-500 ${
              content.trailerKey
                ? "bg-black/50"
                : "bg-surface-glass backdrop-blur-xl"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-base via-base/50 to-transparent" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:py-20">
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          <div className="shrink-0">
            <div className="relative mx-auto aspect-[2/3] w-56 overflow-hidden rounded-lg md:w-72">
              {content.posterUrl ? (
                <Image
                  src={content.posterUrl}
                  alt={content.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 224px, 288px"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-surface text-text-secondary text-sm">
                  {t("content.noImage")}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-start space-y-6">
            <div>
              <h1 className="font-display text-2xl font-black uppercase leading-tight text-white md:text-5xl">
                {content.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
                <span className="transition-colors hover:text-white">{content.year}</span>
                <span className="text-border-subtle">|</span>
                {content.genres.map((genre) => (
                  <span
                    key={genre}
                    className="transition-colors hover:text-accent-brand"
                  >
                    {genre}
                  </span>
                ))}
                <span className="text-border-subtle">|</span>
                <Badge
                  variant="secondary"
                  className="bg-accent-brand/20 text-accent-brand font-bold transition-all hover:scale-110 hover:shadow-lg hover:shadow-accent-brand/20"
                >
                  ★ {content.rating.toFixed(1)}
                </Badge>
                {content.seasons && (
                  <>
                    <span className="text-border-subtle">|</span>
                    <span className="transition-colors hover:text-white">{t("content.seasons")?.replace("{count}", String(content.seasons))}</span>
                  </>
                )}
              </div>
            </div>

            {content.director && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  {t("content.director")}
                </p>
                <p className="mt-1 font-display text-lg font-bold text-white transition-transform hover:translate-x-1">
                  {content.director}
                </p>
              </div>
            )}

            {content.overview && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  {t("content.synopsis")}
                </p>
                <p className="mt-1 leading-relaxed text-text-secondary">
                  {content.overview}
                </p>
              </div>
            )}

            {content.cast.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  {t("content.cast")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {content.cast.map((actor) => (
                    <span
                      key={actor}
                      className="rounded-md bg-surface px-3 py-1 text-sm text-text-secondary transition-all hover:scale-105 hover:bg-accent-brand/20 hover:text-accent-brand"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {content.trailerKey && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowTrailer(true)}
                  className="group flex items-center gap-2 rounded-md bg-accent-brand/20 px-4 py-2 text-sm font-medium text-accent-brand transition-all hover:scale-105 hover:bg-accent-brand hover:text-white hover:shadow-lg hover:shadow-accent-brand/30"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4 transition-transform group-hover:scale-110"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {t("content.watchTrailer")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showTrailer && content.trailerKey && (
        <TrailerModal
          videoKey={content.trailerKey}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </section>
  );
}