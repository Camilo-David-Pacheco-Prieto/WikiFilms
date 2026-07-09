import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-base py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <span className="font-display text-xl font-bold uppercase tracking-wider text-white">
              WikiFilms
            </span>
            <p className="mt-1 text-sm text-text-secondary">
              Tu enciclopedia cinematográfica personal.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-text-secondary">
            <Link
              href="/"
              className="transition-colors hover:text-white"
            >
              Inicio
            </Link>
            <Link
              href="/search"
              className="transition-colors hover:text-white"
            >
              Explorar
            </Link>
            <Link
              href="/login"
              className="transition-colors hover:text-white"
            >
              Ingresar
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border-subtle pt-6 text-center text-xs text-text-secondary">
          <p>
            Web desarrollada por{" "}
            <span className="font-medium text-white">Camilo Pacheco</span>
          </p>
          <p className="mt-1">
            Datos proporcionados por{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-brand transition-colors hover:underline"
            >
              TMDB
            </a>
          </p>
          <p className="mt-1">© {new Date().getFullYear()} WikiFilms</p>
        </div>
      </div>
    </footer>
  );
}
