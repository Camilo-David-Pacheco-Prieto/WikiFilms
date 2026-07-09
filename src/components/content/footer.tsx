import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-base py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          <div>
            <span className="font-display text-lg font-bold uppercase tracking-wider text-white">
              WikiFilms
            </span>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Tu enciclopedia cinematográfica personal. Explora, descubre y
              guarda tus películas y series favoritas.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Navegar
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <Link
                href="/"
                className="text-text-secondary transition-colors hover:text-white"
              >
                Inicio
              </Link>
              <Link
                href="/search"
                className="text-text-secondary transition-colors hover:text-white"
              >
                Explorar
              </Link>
              <Link
                href="/search?type=movie"
                className="text-text-secondary transition-colors hover:text-white"
              >
                Películas
              </Link>
              <Link
                href="/search?type=tv"
                className="text-text-secondary transition-colors hover:text-white"
              >
                Series
              </Link>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Más
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <Link
                href="/dashboard"
                className="text-text-secondary transition-colors hover:text-white"
              >
                Favoritos
              </Link>
              <a
                href="#"
                className="cursor-not-allowed text-text-secondary/50"
                title="Próximamente"
              >
                Comunidad
              </a>
              <a
                href="#"
                className="cursor-not-allowed text-text-secondary/50"
                title="Próximamente"
              >
                Estadísticas
              </a>
              <Link
                href="/login"
                className="text-text-secondary transition-colors hover:text-white"
              >
                Ingresar
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border-subtle pt-6 text-center text-xs text-text-secondary">
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
