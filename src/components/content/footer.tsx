import Link from "next/link";
import { auth } from "@/lib/auth";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

export default async function Footer() {
  const session = await auth();
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  return (
    <footer className="border-t border-border-subtle bg-gradient-to-b from-base via-accent-brand/[0.015] to-base py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-3">
          <div className="col-span-2 lg:col-span-1">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-center md:text-xs">
              WIKIFILMS 26™{" "}
              <span className="font-normal tracking-normal text-text-secondary">
                un proyecto por y para el{" "}
              </span>
              <span className="text-accent-brand">CINE</span>
            </p>
            <p className="text-xs leading-relaxed text-text-secondary md:text-sm">
              {dict["footer.description"]}
            </p>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-secondary md:text-xs">
              {dict["footer.navigate"]}
            </p>
            <div className="flex flex-col gap-1.5 text-xs md:text-sm">
              <Link
                href="/"
                className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
              >
                {dict["footer.home"]}
              </Link>
              <Link
                href="/search"
                className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
              >
                {dict["footer.explore"]}
              </Link>
              <Link
                href="/search?type=movie"
                className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
              >
                {dict["footer.movies"]}
              </Link>
              <Link
                href="/search?type=tv"
                className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
              >
                {dict["footer.series"]}
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-secondary md:text-xs">
              {dict["footer.more"]}
            </p>
            <div className="flex flex-col gap-1.5 text-xs md:text-sm">
              {session?.user && (
                <Link
                  href="/games"
                  className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
                >
                  {dict["footer.games"]}
                </Link>
              )}
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
                >
                  {dict["footer.favorites"]}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
                >
                  {dict["footer.signIn"]}
                </Link>
              )}
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
        </div>

        <div className="relative mt-10 pt-6 text-center text-[10px] text-text-secondary md:text-xs">
          <div className="absolute -top-px left-1/2 h-px w-16 -translate-x-1/2 bg-accent-brand/50" />
          <img
            src="/images/logo-tipo-x-men-footer.png"
            alt="WikiFilms"
            className="mx-auto mb-4 h-8 w-auto opacity-60"
          />
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
