import Link from "next/link";
import { Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { NavbarClient } from "./navbar-client";
import { UserDropdown } from "./user-dropdown";
import { LanguageSwitcher } from "./language-switcher";
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
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-brand text-sm font-bold text-white">
            W
          </div>
          <span className="font-display text-xl font-bold uppercase tracking-wider text-white">
            WikiFilms
          </span>
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
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="flex items-center gap-1 rounded-md bg-surface px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-zinc-700"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">{dict["nav.search"]}</span>
          </Link>

          <LanguageSwitcher />

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

          <NavbarClient user={user ? { name: user.name, role: user.role } : null} />
        </div>
      </div>
    </header>
  );
}