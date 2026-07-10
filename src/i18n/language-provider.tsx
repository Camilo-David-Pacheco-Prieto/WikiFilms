"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { defaultLocale, cookieName, type Locale } from "./config";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getCookie(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie.match(new RegExp(`(^| )${cookieName}=([^;]+)`));
  const val = match?.[2];
  return (val === "es" || val === "en" ? val : defaultLocale) as Locale;
}

function setCookie(value: string) {
  document.cookie = `${cookieName}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

let sharedDict: Record<string, string> = {};
let dictPromise: Promise<void> | null = null;

function ensureDict(locale: string) {
  if (!dictPromise) {
    dictPromise = import(`./dictionaries/${locale}.json`)
      .then((m) => { sharedDict = m.default; })
      .catch(() => { sharedDict = {}; });
  }
  return dictPromise;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getCookie);
  const [, setTick] = useState(0);

  useEffect(() => {
    ensureDict(locale).then(() => setTick((n) => n + 1));
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setCookie(next);
    dictPromise = null;
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let val = sharedDict[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          val = val.replace(`{${k}}`, String(v));
        }
      }
      return val;
    },
    [],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslate() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslate must be used within LanguageProvider");
  return ctx.t;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return { locale: ctx.locale, setLocale: ctx.setLocale };
}
