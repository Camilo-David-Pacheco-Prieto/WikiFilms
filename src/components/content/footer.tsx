import Link from "next/link";

export function Footer() {
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
                WikiFilms
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary md:text-sm">
              Tu enciclopedia cinematográfica personal. Explora, descubre y
              guarda tus películas y series favoritas.
            </p>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-secondary md:text-xs">
              Navegar
            </p>
            <div className="flex flex-col gap-1.5 text-xs md:text-sm">
              <Link
                href="/"
                className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
              >
                Inicio
              </Link>
              <Link
                href="/search"
                className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
              >
                Explorar
              </Link>
              <Link
                href="/search?type=movie"
                className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
              >
                Películas
              </Link>
              <Link
                href="/search?type=tv"
                className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
              >
                Series
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-secondary md:text-xs">
              Más
            </p>
            <div className="flex flex-col gap-1.5 text-xs md:text-sm">
              <Link
                href="/dashboard"
                className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
              >
                Favoritos
              </Link>
              <span className="flex items-center gap-2 text-text-secondary/50">
                Comunidad
                <span className="rounded border border-border-subtle px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-text-secondary/50">
                  Pronto
                </span>
              </span>
              <span className="flex items-center gap-2 text-text-secondary/50">
                Estadísticas
                <span className="rounded border border-border-subtle px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-text-secondary/50">
                  Pronto
                </span>
              </span>
              <Link
                href="/login"
                className="text-text-secondary transition-all hover:translate-x-0.5 hover:text-white"
              >
                Ingresar
              </Link>
            </div>
          </div>
        </div>

        <div className="relative mt-10 pt-6 text-center text-[10px] text-text-secondary md:text-xs">
          <div className="absolute -top-px left-1/2 h-px w-16 -translate-x-1/2 bg-accent-brand/50" />
          <p>
            Web desarrollada por{" "}
            <span className="font-medium text-white">Camilo Pacheco</span>
          </p>
          <p className="mt-0.5">
            Datos proporcionados por{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-brand transition-all hover:gap-1 hover:underline"
            >
              TMDB
            </a>
          </p>
          <p className="mt-0.5">© {new Date().getFullYear()} WikiFilms</p>
        </div>
      </div>
    </footer>
  );
}
