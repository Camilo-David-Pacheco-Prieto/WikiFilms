export interface IGDBGameResult {
  id: number;
  name: string;
  cover?: { image_id: string };
  first_release_date?: number;
  platforms?: { id: number; abbreviation: string; name: string }[];
  rating?: number;
  total_rating?: number;
  total_rating_count?: number;
  slug: string;
  genres?: { id: number; name: string }[];
  screenshots?: { image_id: string }[];
  summary?: string;
}

export interface IGDBGameDetail extends IGDBGameResult {
  storyline?: string;
  involved_companies?: {
    company: { id: number; name: string };
    developer: boolean;
    publisher: boolean;
  }[];
  screenshots?: { image_id: string }[];
  artworks?: { image_id: string }[];
  videos?: { video_id: string; name: string }[];
  aggregated_rating?: number;
  websites?: { category: number; url: string }[];
}

export interface GameResult {
  id: number;
  title: string;
  type: "game";
  year: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: number;
  genres: string[];
  overview: string;
}

export const IGDB_IMAGE_BASE = "https://images.igdb.com/igdb/image/upload";
export const IGDB_COVER_SIZE = "cover_big";
export const IGDB_SCREENSHOT_SIZE = "screenshot_big";
