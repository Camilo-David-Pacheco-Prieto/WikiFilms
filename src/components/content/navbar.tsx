import Link from "next/link";
import { Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { NavbarClient } from "./navbar-client";
import { UserDropdown } from "./user-dropdown";
import { NotificationBell } from "./notification-bell";
import { LanguageSwitcher } from "./language-switcher";
import { SearchBar } from "./search-bar";
import { NavLink } from "./nav-link";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/images/logo-oficial-wikifilms.png"
              alt="WikiFilms"
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="/">{dict["nav.home"]}</NavLink>
            <NavLink href="/search">{dict["nav.explore"]}</NavLink>
            {user && (
              <>
                <NavLink href="/games">{dict["nav.games"]}</NavLink>
                <NavLink href="/watchlist">{dict["nav.watchlist"]}</NavLink>
                <NavLink href="/coming-soon">{dict["nav.comingSoon"]}</NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <SearchBar />
          </div>

          <Link
            href="/search"
            className="md:hidden flex items-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/50"
          >
            <Search className="h-4 w-4" />
          </Link>

          {user && <NotificationBell userId={user.id} />}

          {user ? (
            <UserDropdown name={user.name} role={user.role} />
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
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