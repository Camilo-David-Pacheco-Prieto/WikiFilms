import type { Locale } from "./config";

type Dict = Record<string, string>;

const dictionaries = new Map<Locale, Promise<Dict>>();

function load(locale: Locale): Promise<Dict> {
  return import(`./dictionaries/${locale}.json`).then((m) => m.default);
}

export async function getDictionary(locale: string): Promise<Dict> {
  const key = (["es", "en"].includes(locale) ? locale : "es") as Locale;
  if (!dictionaries.has(key)) {
    dictionaries.set(key, load(key));
  }
  return dictionaries.get(key)!;
}
