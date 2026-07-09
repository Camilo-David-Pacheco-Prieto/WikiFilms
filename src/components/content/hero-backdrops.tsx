"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";

interface HeroBackdropsProps {
  backdrops: string[];
  children: ReactNode;
}

export function HeroBackdrops({ backdrops, children }: HeroBackdropsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (backdrops.length < 2) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % backdrops.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [backdrops.length]);

  return (
    <section className="relative overflow-hidden rounded-xl">
      {backdrops.length > 0 && (
        <>
          {backdrops.map((url, i) => (
            <div
              key={url}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                backgroundImage: `url(${url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: i === index ? 1 : 0,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        </>
      )}
      <div className="relative z-10 px-6 py-16 md:px-8 md:py-24">
        {children}
      </div>
    </section>
  );
}
