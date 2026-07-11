"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useTranslate } from "@/i18n/language-provider";
import type { ContentResult } from "@/types/tmdb";

interface HeroSliderProps {
  items: ContentResult[];
}

export function HeroSlider({ items }: HeroSliderProps) {
  const t = useTranslate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = items.slice(0, 6);
  const current = slides[currentIndex];

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = useCallback((index: number) => setCurrentIndex(index), []);
  const prev = useCallback(
    () => setCurrentIndex((p) => (p - 1 + slides.length) % slides.length),
    [slides.length],
  );
  const next = useCallback(
    () => setCurrentIndex((p) => (p + 1) % slides.length),
    [slides.length],
  );

  if (!current) return null;

  return (
    <section className="relative h-[180px] overflow-hidden rounded-2xl md:h-[500px] md:rounded-2xl md:shadow-[0_20px_60px_rgba(0,0,0,0.45)] lg:h-[460px] lg:rounded-3xl">
      {slides.map((item, i) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === currentIndex ? 1 : 0 }}
        >
          {item.backdropUrl ? (
            <Image
              src={item.backdropUrl}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          ) : (
            <div className="h-full w-full bg-surface" />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,.88) 0%, rgba(0,0,0,.72) 45%, rgba(0,0,0,.35) 70%, rgba(0,0,0,0) 100%)" }} />
        </div>
      ))}

      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto flex w-full max-w-7xl px-2 md:px-12">
          <div className="w-full px-3 py-5 md:max-w-[560px] md:p-14 lg:max-w-[560px] lg:p-16">
            <span className="inline-block w-fit rounded-[4px] bg-accent-brand/20 px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-wider text-accent-brand md:rounded-[10px] md:px-3.5 md:py-2 md:text-sm">
              #{currentIndex + 1} · {t("hero.trending")}
            </span>

            <h2 className="mt-2 font-display text-[12px] font-black uppercase leading-[1] tracking-[-0.03em] text-white line-clamp-1 md:mt-6 md:text-[48px] md:line-clamp-2"
                style={{ textShadow: "0 0 6px rgba(0,0,0,0.25)" }}>
              {current.title}
            </h2>

            {current.genres.length > 0 && (
              <p className="mt-2 text-[6px] text-white/60 md:mt-4 md:text-sm"
                 style={{ textShadow: "0 0 6px rgba(0,0,0,0.25)" }}>
                {current.genres.join(" · ")}
              </p>
            )}

            {current.overview && (
              <p className="mt-2.5 text-[6px] leading-snug text-gray-200 line-clamp-2 md:mt-4 md:text-lg md:leading-[1.7] md:text-white lg:text-lg lg:leading-[1.7] lg:text-white lg:line-clamp-3">
                {current.overview}
              </p>
            )}

            <Link
              href={`/${current.type}/${current.id}`}
              className="mt-3 inline-flex h-4 items-center gap-1 rounded-[5px] bg-gradient-to-r from-accent-brand to-accent-hover px-2 text-[7px] font-bold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent-brand/30 md:mt-5 md:h-10 md:gap-2 md:rounded-[12px] md:px-5 md:text-sm"
            >
              <Play className="h-2 w-2 fill-current md:h-4 md:w-4" />
              {t("hero.viewInfo")}
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0.5 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/40 md:left-6 md:h-[60px] md:w-[60px] md:bg-black/55 md:backdrop-blur-md md:hover:bg-black/70"
            aria-label="Previous"
          >
            <ChevronLeft className="h-3 w-3 md:h-7 md:w-7" />
          </button>
          <button
            onClick={next}
            className="absolute right-0.5 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/40 md:right-6 md:h-[60px] md:w-[60px] md:bg-black/55 md:backdrop-blur-md md:hover:bg-black/70"
            aria-label="Next"
          >
            <ChevronRight className="h-3 w-3 md:h-7 md:w-7" />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-1 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 md:bottom-6 md:gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                height: "4px",
                width: i === currentIndex ? "12px" : "4px",
                backgroundColor:
                  i === currentIndex
                    ? "var(--color-accent-brand, #e11d48)"
                    : "rgba(255,255,255,0.35)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
