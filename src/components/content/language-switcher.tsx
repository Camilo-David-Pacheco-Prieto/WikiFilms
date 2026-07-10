"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/i18n/language-provider";
import { locales, localeNames } from "@/i18n/config";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  function handleSelect(l: (typeof locales)[number]) {
    setLocale(l);
    setOpen(false);
    window.location.reload();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-brand text-xs font-bold text-white transition-colors hover:bg-accent-hover"
        aria-label="Idioma"
      >
        <Languages className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-md border border-border-subtle bg-surface py-1 shadow-lg">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => handleSelect(l)}
                disabled={l === locale}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-default disabled:text-white"
              >
                {l === locale && <span className="text-accent-brand">✓ </span>}
                {!l || l !== locale ? <span className="w-4" /> : null}
                {localeNames[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
