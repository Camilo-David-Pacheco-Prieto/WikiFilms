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
    <section className="relative h-[360px] overflow-hidden rounded-none md:h-[500px] md:rounded-2xl md:shadow-[0_20px_60px_rgba(0,0,0,0.45)] lg:h-[460px] lg:rounded-3xl">
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/90 to-transparent" />
        </div>
      ))}

      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto flex w-full max-w-7xl px-6 md:px-12">
          <div className="w-full space-y-4 p-7 md:max-w-[600px] md:p-14 lg:max-w-[700px] lg:p-16">
            <span className="inline-block w-fit rounded-[10px] bg-accent-brand/20 px-3.5 py-2 text-sm font-bold uppercase tracking-wider text-accent-brand">
              {t("hero.trending")}
            </span>

            <h2 className="font-display text-[34px] font-black uppercase leading-[0.95] tracking-[-0.03em] text-white line-clamp-2 md:text-[48px]">
              {current.title}
            </h2>

            {current.genres.length > 0 && (
              <p className="text-xs text-white/60 md:text-sm">
                {current.genres.join(" · ")}
              </p>
            )}

            {current.overview && (
              <p className="text-[15px] leading-relaxed text-white line-clamp-3 md:text-base lg:text-[18px] lg:leading-[1.7]">
                {current.overview}
              </p>
            )}

            <Link
              href={`/${current.type}/${current.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-gradient-to-r from-accent-brand to-accent-hover px-5 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent-brand/30"
            >
              <Play className="h-4 w-4 fill-current" />
              {t("hero.viewInfo")}
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all hover:bg-black/70 md:left-6 md:flex md:h-[60px] md:w-[60px]"
            style={{ border: "1px solid rgba(255,255,255,0.12)" }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5 md:h-7 md:w-7" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all hover:bg-black/70 md:right-6 md:flex md:h-[60px] md:w-[60px]"
            style={{ border: "1px solid rgba(255,255,255,0.12)" }}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5 md:h-7 md:w-7" />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:bottom-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                height: "8px",
                width: i === currentIndex ? "28px" : "8px",
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
