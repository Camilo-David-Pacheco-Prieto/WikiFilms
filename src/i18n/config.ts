export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";
export const cookieName = "wiki-lang";

export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
};
