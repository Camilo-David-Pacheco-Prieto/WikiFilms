import { getGameById } from "@/lib/igdb";
import { GameDetailHero } from "@/components/content/game-detail-hero";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import { IGDB_IMAGE_BASE, IGDB_SCREENSHOT_SIZE } from "@/types/igdb";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const game = await getGameById(parseInt(id, 10));
  if (!game) return { title: "Game not found" };
  return {
    title: `${game.name} — WikiFilms`,
    description: game.summary ?? "",
  };
}

export default async function GameDetailPage({ params }: Props) {
  const { id } = await params;
  const game = await getGameById(parseInt(id, 10));
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  if (!game) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-white">
          {dict["content.notFoundMovie"]}
        </h1>
      </main>
    );
  }

  function igdbUrl(size: string, imageId: string) {
    return `${IGDB_IMAGE_BASE}/t/${size}/${imageId}.jpg`;
  }

  return (
    <main>
      <GameDetailHero game={game} />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 lg:px-12">
        {game.summary && (
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold uppercase text-white">
              {dict["game.summary"]}
            </h2>
            <p className="max-w-3xl leading-relaxed text-text-secondary">
              {game.summary}
            </p>
          </section>
        )}

        {game.storyline && (
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold uppercase text-white">
              {dict["game.storyline"]}
            </h2>
            <p className="max-w-3xl leading-relaxed text-text-secondary">
              {game.storyline}
            </p>
          </section>
        )}

        {game.screenshots && game.screenshots.length > 1 && (
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold uppercase text-white">
              {dict["game.screenshots"]}
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {game.screenshots.slice(1).map((s, i) => (
                <div
                  key={i}
                  className="relative aspect-video overflow-hidden rounded-lg"
                >
                  <img
                    src={igdbUrl(IGDB_SCREENSHOT_SIZE, s.image_id)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {game.artworks && game.artworks.length > 0 && (
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold uppercase text-white">
              {dict["game.artworks"]}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {game.artworks.map((a, i) => (
                <div
                  key={i}
                  className="relative aspect-video overflow-hidden rounded-lg"
                >
                  <img
                    src={igdbUrl("screenshot_huge", a.image_id)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {game.videos && game.videos.length > 0 && (
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold uppercase text-white">
              {dict["game.videos"]}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {game.videos.map((v, i) => (
                <div key={i}>
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${v.video_id}`}
                      title={v.name}
                      className="h-full w-full"
                      allow="encrypted-media"
                      allowFullScreen
                    />
                  </div>
                  {v.name && (
                    <p className="mt-2 text-sm text-text-secondary">{v.name}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
