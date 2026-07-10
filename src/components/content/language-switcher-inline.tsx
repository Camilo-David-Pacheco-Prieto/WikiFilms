"use client";

import { useLanguage } from "@/i18n/language-provider";
import { locales, localeNames } from "@/i18n/config";

export function LanguageSwitcherInline() {
  const { locale, setLocale } = useLanguage();

  function handleSelect(l: (typeof locales)[number]) {
    setLocale(l);
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          <button
            onClick={() => handleSelect(l)}
            disabled={l === locale}
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              l === locale
                ? "text-accent-brand cursor-default"
                : "text-text-secondary hover:text-white"
            }`}
          >
            {localeNames[l]}
          </button>
          {i < locales.length - 1 && (
            <span className="mx-1.5 text-text-secondary/30">|</span>
          )}
        </span>
      ))}
    </div>
  );
}
