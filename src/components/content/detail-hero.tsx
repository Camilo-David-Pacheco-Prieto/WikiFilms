import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { ContentDetail } from "@/types/tmdb";

interface DetailHeroProps {
  content: ContentDetail;
}

export function DetailHero({ content }: DetailHeroProps) {
  return (
    <section className="relative overflow-hidden">
      {content.backdropUrl && (
        <div className="absolute inset-0">
          <Image
            src={content.backdropUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-surface-glass backdrop-blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-base via-base/50 to-transparent" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:py-20">
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          <div className="shrink-0">
            <div className="relative mx-auto aspect-[2/3] w-56 overflow-hidden rounded-lg md:w-72">
              {content.posterUrl ? (
                <Image
                  src={content.posterUrl}
                  alt={content.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 224px, 288px"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-surface text-text-secondary text-sm">
                  Sin imagen
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center space-y-6">
            <div>
              <h1 className="font-display text-2xl font-black uppercase leading-tight text-white md:text-5xl">
                {content.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
                <span className="transition-colors hover:text-white">{content.year}</span>
                <span className="text-border-subtle">|</span>
                {content.genres.map((genre) => (
                  <span
                    key={genre}
                    className="transition-colors hover:text-accent-brand"
                  >
                    {genre}
                  </span>
                ))}
                <span className="text-border-subtle">|</span>
                <Badge
                  variant="secondary"
                  className="bg-accent-brand/20 text-accent-brand font-bold transition-all hover:scale-110 hover:shadow-lg hover:shadow-accent-brand/20"
                >
                  ★ {content.rating.toFixed(1)}
                </Badge>
                {content.seasons && (
                  <>
                    <span className="text-border-subtle">|</span>
                    <span className="transition-colors hover:text-white">{content.seasons} temporadas</span>
                  </>
                )}
              </div>
            </div>

            {content.director && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  Director
                </p>
                <p className="mt-1 font-display text-lg font-bold text-white transition-transform hover:translate-x-1">
                  {content.director}
                </p>
              </div>
            )}

            {content.overview && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  Sinopsis
                </p>
                <p className="mt-1 leading-relaxed text-text-secondary">
                  {content.overview}
                </p>
              </div>
            )}

            {content.cast.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  Elenco
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {content.cast.map((actor) => (
                    <span
                      key={actor}
                      className="rounded-md bg-surface px-3 py-1 text-sm text-text-secondary transition-all hover:scale-105 hover:bg-accent-brand/20 hover:text-accent-brand"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}