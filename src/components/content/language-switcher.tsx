"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/i18n/language-provider";
import { locales, localeNames } from "@/i18n/config";
import { Button } from "@/components/ui/button";

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
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        aria-label="Idioma"
      >
        <Languages className="h-4 w-4" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-md border border-border bg-popover py-1 shadow-lg">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => handleSelect(l)}
                disabled={l === locale}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-default disabled:text-foreground"
              >
                {l === locale && <span className="text-primary">✓ </span>}
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
