import Link from "next/link";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

export default async function NotFound() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="font-display text-8xl font-black text-accent-brand md:text-9xl">
        404
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold uppercase text-white">
        {dict["notFound.heading"]}
      </h1>
      <p className="mt-2 text-text-secondary">
        {dict["notFound.description"]}
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-accent-brand px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover"
      >
        {dict["notFound.backHome"]}
      </Link>
    </main>
  );
}
