"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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

  return (
    <section className="relative overflow-hidden rounded-xl">
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
          <div className="absolute inset-0 bg-gradient-to-r from-base via-base/70 to-transparent" />
        </div>
      ))}

      <div className="relative z-10 flex min-h-[400px] items-center md:min-h-[500px]">
        <div className="mx-auto flex w-full max-w-7xl px-6 md:px-12">
          <div className="max-w-xl space-y-4">
            <span className="inline-block w-fit rounded bg-accent-brand/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-brand">
              {t("hero.trending")}
            </span>

            <h2 className="font-display text-3xl font-black uppercase leading-tight text-white md:text-5xl">
              {current?.title}
            </h2>

            {current?.genres.length > 0 && (
              <p className="text-sm text-text-secondary">
                {current.genres.join(" · ")}
              </p>
            )}

            {current?.overview && (
              <p className="line-clamp-3 leading-relaxed text-text-secondary md:text-base">
                {current.overview}
              </p>
            )}

            {current && (
              <Link
                href={`/${current.type}/${current.id}`}
                className="inline-block rounded-md bg-accent-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                {t("hero.watchNow")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex
                  ? "w-6 bg-accent-brand"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
