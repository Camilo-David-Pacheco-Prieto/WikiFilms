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
  const dict = await dictionaries.get(key)!;
  return new Proxy(dict, {
    get(target, prop: string) {
      return target[prop] ?? prop;
    },
  });
}
