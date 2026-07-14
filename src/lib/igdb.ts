import type { IGDBGameDetail, IGDBGameResult, GameResult } from "@/types/igdb";
import { IGDB_IMAGE_BASE, IGDB_COVER_SIZE, IGDB_SCREENSHOT_SIZE } from "@/types/igdb";

if (!process.env.TWITCH_CLIENT_ID) throw new Error("Missing TWITCH_CLIENT_ID");
if (!process.env.TWITCH_CLIENT_SECRET) throw new Error("Missing TWITCH_CLIENT_SECRET");
const TWITCH_CLIENT_ID: string = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET: string = process.env.TWITCH_CLIENT_SECRET;
const IGDB_API = "https://api.igdb.com/v4";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const res = await fetch(
    `${TWITCH_TOKEN_URL}?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" },
  );

  if (!res.ok) throw new Error(`Twitch auth error: ${res.status}`);

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken!;
}

async function fetchFromIGDB<T>(
  endpoint: string,
  body: string,
): Promise<T[]> {
  const token = await getAccessToken();

  const res = await fetch(`${IGDB_API}/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body,
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IGDB API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T[]>;
}

function igdbCoverUrl(imageId: string | undefined): string | null {
  if (!imageId) return null;
  return `${IGDB_IMAGE_BASE}/t_${IGDB_COVER_SIZE}/${imageId}.jpg`;
}

function igdbScreenshotUrl(imageId: string | undefined): string | null {
  if (!imageId) return null;
  return `${IGDB_IMAGE_BASE}/t_${IGDB_SCREENSHOT_SIZE}/${imageId}.jpg`;
}

function mapGameToResult(game: IGDBGameResult): GameResult {
  return {
    id: game.id,
    title: game.name,
    type: "game",
    year: game.first_release_date
      ? new Date(game.first_release_date * 1000).getFullYear().toString()
      : "",
    posterUrl: igdbCoverUrl(game.cover?.image_id),
    backdropUrl: game.screenshots?.[0]
      ? igdbScreenshotUrl(game.screenshots[0].image_id)
      : igdbCoverUrl(game.cover?.image_id),
    rating:
      game.total_rating !== undefined
        ? Math.round((game.total_rating / 10) * 10) / 10
        : game.rating !== undefined
          ? Math.round((game.rating / 10) * 10) / 10
          : 0,
    genres: game.genres?.map((g) => g.name) ?? [],
    overview: game.summary ?? "",
  };
}

export async function searchGames(
  query: string,
  limit = 20,
): Promise<GameResult[]> {
  const data = await fetchFromIGDB<IGDBGameResult>(
    "games",
    `search "${query}"; fields name,cover.image_id,first_release_date,platforms.abbreviation,rating,total_rating,total_rating_count,genres.name,summary,screenshots.image_id; limit ${limit};`,
  );
  return data.map(mapGameToResult);
}

export async function getPopularGames(
  limit = 20,
  offset = 0,
): Promise<GameResult[]> {
  const data = await fetchFromIGDB<IGDBGameResult>(
    "games",
    `fields name,cover.image_id,first_release_date,platforms.abbreviation,rating,total_rating,total_rating_count,genres.name,summary,screenshots.image_id; sort total_rating_count desc; where total_rating_count > 10 & cover != null; limit ${limit}; offset ${offset};`,
  );
  return data.map(mapGameToResult);
}

export async function getUpcomingGames(limit = 20): Promise<GameResult[]> {
  const now = Math.floor(Date.now() / 1000);
  const data = await fetchFromIGDB<IGDBGameResult>(
    "games",
    `fields name,cover.image_id,first_release_date,platforms.abbreviation,rating,total_rating,total_rating_count,genres.name,summary,screenshots.image_id; where first_release_date > ${now} & cover != null; sort first_release_date asc; limit ${limit};`,
  );
  return data.map(mapGameToResult);
}

export async function getTrendingGames(limit = 6): Promise<GameResult[]> {
  const data = await fetchFromIGDB<IGDBGameResult>(
    "games",
    `fields name,cover.image_id,first_release_date,platforms.abbreviation,rating,total_rating,total_rating_count,genres.name,summary,screenshots.image_id; sort total_rating_count desc; where total_rating_count > 100 & cover != null & screenshots != null; limit ${limit};`,
  );
  return data.map(mapGameToResult);
}

export async function getGameById(id: number): Promise<IGDBGameDetail | null> {
  const data = await fetchFromIGDB<IGDBGameDetail>(
    "games",
    `fields name,cover.image_id,first_release_date,platforms.abbreviation,platforms.name,rating,total_rating,total_rating_count,genres.name,summary,storyline,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,screenshots.image_id,artworks.image_id,videos.video_id,videos.name,aggregated_rating,websites.category,websites.url; where id = ${id};`,
  );
  return data[0] ?? null;
}
