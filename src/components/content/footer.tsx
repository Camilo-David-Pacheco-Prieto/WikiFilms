import Link from "next/link";
import { Home, Search, LogIn, ExternalLink, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-base py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2 text-center md:text-left">
            <Heart className="h-5 w-5 text-accent-brand" />
            <div>
              <span className="font-display text-xl font-bold uppercase tracking-wider text-white">
                WikiFilms
              </span>
              <p className="mt-1 text-sm text-text-secondary">
                Tu enciclopedia cinematográfica personal.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-text-secondary">
            <Link
              href="/"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Home className="h-4 w-4" />
              Inicio
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Search className="h-4 w-4" />
              Explorar
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <LogIn className="h-4 w-4" />
              Ingresar
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border-subtle pt-6 text-center text-xs text-text-secondary">
          <p>
            Web desarrollada por{" "}
            <span className="font-medium text-white">Camilo Pacheco</span>
          </p>
          <p className="mt-1 flex items-center justify-center gap-1">
            Datos proporcionados por{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-accent-brand transition-colors hover:underline"
            >
              TMDB
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
          <p className="mt-1">© {new Date().getFullYear()} WikiFilms</p>
        </div>
      </div>
    </footer>
  );
}
