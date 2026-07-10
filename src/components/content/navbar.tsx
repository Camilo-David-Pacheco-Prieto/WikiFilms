import Link from "next/link";
import { Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { NavbarClient } from "./navbar-client";
import { UserDropdown } from "./user-dropdown";
import { LanguageSwitcher } from "./language-switcher";
import { SearchBar } from "./search-bar";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-brand text-sm font-bold text-white">
              W
            </div>
            <span className="font-display text-xl font-bold uppercase tracking-wider text-white">
              WikiFilms
            </span>
          </Link>

          <div className="hidden md:block flex-1 max-w-md">
            <SearchBar />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="md:hidden flex items-center rounded-md bg-surface px-2 py-2 text-text-secondary transition-colors hover:bg-zinc-700"
          >
            <Search className="h-4 w-4" />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="font-body text-sm font-medium text-text-secondary transition-colors hover:text-white"
            >
              {dict["nav.home"]}
            </Link>
            <Link
              href="/search"
              className="font-body text-sm font-medium text-text-secondary transition-colors hover:text-white"
            >
              {dict["nav.explore"]}
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="font-body text-sm font-medium text-text-secondary transition-colors hover:text-white"
                >
                  {dict["nav.favorites"]}
                </Link>
                <Link
                  href="/watchlist"
                  className="font-body text-sm font-medium text-text-secondary transition-colors hover:text-white"
                >
                  {dict["nav.watchlist"]}
                </Link>
                <Link
                  href="/coming-soon"
                  className="font-body text-sm font-medium text-text-secondary transition-colors hover:text-white"
                >
                  {dict["nav.comingSoon"]}
                </Link>
              </>
            )}
          </nav>

          {user ? (
            <div className="hidden md:flex">
              <UserDropdown name={user.name} role={user.role} />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-accent-brand px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              {dict["nav.signIn"]}
            </Link>
          )}

          <LanguageSwitcher />

          <NavbarClient user={user ? { name: user.name, role: user.role } : null} />
        </div>
      </div>
    </header>
  );
}