import Link from "next/link";
import { Search } from "lucide-react";

export function Navbar() {
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
            href="/search"
            className="font-body text-sm font-medium text-text-secondary transition-colors hover:text-white"
          >
            Explorar
          </Link>
          <Link
            href="/?type=movie"
            className="font-body text-sm font-medium text-text-secondary transition-colors hover:text-white"
          >
            Películas
          </Link>
          <Link
            href="/?type=tv"
            className="font-body text-sm font-medium text-text-secondary transition-colors hover:text-white"
          >
            Series
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="flex items-center gap-1 rounded-md bg-surface px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-zinc-700"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar</span>
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-accent-brand px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Ingresar
          </Link>
        </div>
      </div>
    </header>
  );
}