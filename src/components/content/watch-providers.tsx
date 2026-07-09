"use client";

import { useState } from "react";
import Image from "next/image";
import type { TMDBWatchProvidersResponse } from "@/types/tmdb";

const LOGO_BASE_URL = "https://image.tmdb.org/t/p/w92";

const REGIONS = [
  { code: "CO", name: "Colombia" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Peru" },
  { code: "EC", name: "Ecuador" },
  { code: "US", name: "Estados Unidos" },
  { code: "ES", name: "Espana" },
];

interface WatchProvidersProps {
  providers: TMDBWatchProvidersResponse;
  detectedRegion: string;
}

export function WatchProviders({ providers, detectedRegion }: WatchProvidersProps) {
  const [region, setRegion] = useState<string>(
    detectedRegion && providers.results[detectedRegion] ? detectedRegion : "US",
  );

  const regionData = providers.results[region];
  if (!regionData) return null;

  const sections: { key: "flatrate" | "rent" | "buy"; label: string }[] = [
    { key: "flatrate", label: "Streaming" },
    { key: "rent", label: "Alquiler" },
    { key: "buy", label: "Compra" },
  ];

  const hasAny = sections.some((s) => (regionData[s.key]?.length ?? 0) > 0);
  if (!hasAny) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="rounded-lg border border-border-subtle bg-surface p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-bold uppercase text-white md:text-xl">
            Donde ver
          </h2>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-fit rounded-md border border-border-subtle bg-base px-2 py-1 text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent-brand md:text-sm"
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 space-y-4">
          {sections.map(({ key, label }) => {
            const items = regionData[key];
            if (!items || items.length === 0) return null;
            return (
              <div key={key}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-secondary md:text-xs">
                  {label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((p) => (
                    <a
                      key={p.provider_id}
                      href={regionData.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 rounded-md bg-base px-3 py-2 transition-all hover:bg-accent-brand/10 hover:ring-1 hover:ring-accent-brand/30"
                    >
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded">
                        <Image
                          src={`${LOGO_BASE_URL}${p.logo_path}`}
                          alt={p.provider_name}
                          fill
                          className="object-contain"
                          sizes="32px"
                        />
                      </div>
                      <span className="text-xs text-text-secondary transition-colors group-hover:text-white md:text-sm">
                        {p.provider_name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[10px] text-text-secondary/50">
          Datos proporcionados por{" "}
          <a
            href="https://www.justwatch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-brand/70 hover:underline"
          >
            JustWatch
          </a>
        </p>
      </div>
    </section>
  );
}
