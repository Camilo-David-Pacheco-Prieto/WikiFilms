import Link from "next/link";
import { auth } from "@/lib/auth";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import { LanguageSwitcherInline } from "./language-switcher-inline";

export default async function Footer() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  const session = await auth();
  const user = session?.user;

  return (
    <footer className="border-t border-border-subtle bg-gradient-to-b from-base via-accent-brand/[0.015] to-base py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-3">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-accent-brand text-xs font-bold text-white">
                W
              </div>
              <span className="font-display text-base font-bold uppercase tracking-wider text-white">
                {dict["footer.brand"]}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary md:text-sm">
              {dict["footer.description"]}
            </p>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-secondary md:text-xs">
              {dict["footer.more"]}
            </p>
            <div className="flex flex-col gap-1.5 text-xs md:text-sm">
              <Link
                href="/dashboard"
                className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
              >
                {dict["footer.favorites"]}
              </Link>
              <Link
                href="/watchlist"
                className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
              >
                {dict["nav.watchlist"]}
              </Link>
              <span className="flex items-center gap-2 text-text-secondary/50">
                {dict["footer.community"]}
                <span className="rounded border border-border-subtle px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-text-secondary/50">
                  {dict["footer.comingSoon"]}
                </span>
              </span>
              <span className="flex items-center gap-2 text-text-secondary/50">
                {dict["footer.stats"]}
                <span className="rounded border border-border-subtle px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-text-secondary/50">
                  {dict["footer.comingSoon"]}
                </span>
              </span>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-secondary md:text-xs">
              {dict["nav.language"]}
            </p>
            <div className="flex flex-col gap-1.5 text-xs md:text-sm">
              <LanguageSwitcherInline />
              {user ? (
                <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-accent-brand">
                  {dict["nav.signOut"]}
                </span>
              ) : (
                <Link
                  href="/login"
                  className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
                >
                  {dict["footer.signIn"]}
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="relative mt-10 pt-6 text-center text-[10px] text-text-secondary md:text-xs">
          <div className="absolute -top-px left-1/2 h-px w-16 -translate-x-1/2 bg-accent-brand/50" />
          <p>
            {dict["footer.developedBy"]}
            <span className="font-medium text-white">{dict["footer.developerName"]}</span>
          </p>
          <p className="mt-0.5">
            {dict["footer.dataProvidedBy"]}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-brand transition-all hover:gap-1 hover:underline"
            >
              TMDB
            </a>
          </p>
          <p className="mt-0.5">{dict["footer.copyright"]?.replace("{year}", String(new Date().getFullYear()))}</p>
        </div>
      </div>
    </footer>
  );
}
