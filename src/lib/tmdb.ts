import type {
  TMDBMovie,
  TMDBSeries,
  TMDBPaginatedResponse,
  MediaType,
  ContentResult,
  ContentDetail,
  SearchResult,
  TMDBWatchProvidersResponse,
  TMDBVideoResponse,
} from "@/types/tmdb";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
const IMG_BASE_URL_LARGE = "https://image.tmdb.org/t/p/w780";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const LOGO_BASE_URL = "https://image.tmdb.org/t/p/w92";

function localeToTMDBlang(locale?: string): string {
  return locale === "es" ? "es-MX" : "en-US";
}

function localeToTMDBRegion(locale?: string): string {
  return locale === "es" ? "CO" : "US";
}

async function fetchFromTMDB<T>(
  endpoint: string,
  params?: Record<string, string>,
  lang?: string,
  region?: string,
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY ?? "");
  url.searchParams.set("language", lang ?? "es-MX");
  if (region) url.searchParams.set("region", region);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

function mapMovieToResult(movie: TMDBMovie): ContentResult {
  return {
    id: movie.id,
    title: movie.title,
    type: "movie",
    year: movie.release_date?.split("-")[0] ?? "",
    posterUrl: movie.poster_path
      ? `${IMG_BASE_URL}${movie.poster_path}`
      : null,
    backdropUrl: movie.backdrop_path
      ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
      : null,
    rating: movie.vote_average,
    genres: movie.genres?.map((g) => g.name) ?? [],
  };
}

function mapSeriesToResult(series: TMDBSeries): ContentResult {
  return {
    id: series.id,
    title: series.name,
    type: "tv",
    year: series.first_air_date?.split("-")[0] ?? "",
    posterUrl: series.poster_path
      ? `${IMG_BASE_URL}${series.poster_path}`
      : null,
    backdropUrl: series.backdrop_path
      ? `${BACKDROP_BASE_URL}${series.backdrop_path}`
      : null,
    rating: series.vote_average,
    genres: series.genres?.map((g) => g.name) ?? [],
  };
}

export async function getPopular(
  type: MediaType = "movie",
  page = 1,
  locale?: string,
): Promise<ContentResult[]> {
  const data = await fetchFromTMDB<TMDBPaginatedResponse<any>>(
    `/${type}/popular`,
    { page: String(page) },
    localeToTMDBlang(locale),
    localeToTMDBRegion(locale),
  );

  return data.results.map((item: any) =>
    type === "movie"
      ? mapMovieToResult(item as TMDBMovie)
      : mapSeriesToResult(item as TMDBSeries),
  );
}

export async function searchContent(
  query: string,
  type?: MediaType,
  page = 1,
  locale?: string,
): Promise<SearchResult> {
  const searchType = type ?? "multi";
  const data = await fetchFromTMDB<TMDBPaginatedResponse<any>>(`/search/${searchType}`, {
    query,
    page: String(page),
  }, localeToTMDBlang(locale), localeToTMDBRegion(locale));

  const results = data.results
    .filter((item: any) => item.media_type !== "person")
    .map((item: any) => {
      if (item.media_type === "tv" || type === "tv") {
        return mapSeriesToResult(item as TMDBSeries);
      }
      return mapMovieToResult(item as TMDBMovie);
    });

  return { results, totalPages: data.total_pages };
}

function extractTrailerKey(videos: { results: TMDBVideoResponse[] } | undefined): string | undefined {
  if (!videos?.results) return undefined;
  const ys = videos.results.filter((v) => v.site === "YouTube");
  const priority = (v: TMDBVideoResponse): number => {
    let score = 0;
    if (v.type === "Trailer") score += 0;
    else if (v.type === "Teaser") score += 10;
    else score += 20;
    if (!v.official) score += 5;
    if (v.iso_639_1 === "es") score -= 3;
    else if (v.iso_639_1 === "en") score += 1;
    else score += 2;
    return score;
  };
  ys.sort((a, b) => priority(a) - priority(b));
  return ys[0]?.key;
}

function mapMovieToDetail(movie: TMDBMovie): ContentDetail {
  const director =
    movie.credits?.crew?.find((c) => c.job === "Director")?.name ?? "";
  const cast =
    movie.credits?.cast?.slice(0, 5).map((c) => c.name) ?? [];

  return {
    id: movie.id,
    title: movie.title,
    type: "movie",
    year: movie.release_date?.split("-")[0] ?? "",
    posterUrl: movie.poster_path
      ? `${IMG_BASE_URL_LARGE}${movie.poster_path}`
      : null,
    backdropUrl: movie.backdrop_path
      ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
      : null,
    rating: movie.vote_average,
    genres: movie.genres?.map((g) => g.name) ?? [],
    overview: movie.overview,
    director,
    cast,
    trailerKey: extractTrailerKey(movie.videos),
  };
}

function mapSeriesToDetail(series: TMDBSeries): ContentDetail {
  const director = series.created_by?.[0]?.name ?? "";
  const cast =
    series.credits?.cast?.slice(0, 5).map((c) => c.name) ?? [];

  return {
    id: series.id,
    title: series.name,
    type: "tv",
    year: series.first_air_date?.split("-")[0] ?? "",
    posterUrl: series.poster_path
      ? `${IMG_BASE_URL_LARGE}${series.poster_path}`
      : null,
    backdropUrl: series.backdrop_path
      ? `${BACKDROP_BASE_URL}${series.backdrop_path}`
      : null,
    rating: series.vote_average,
    genres: series.genres?.map((g) => g.name) ?? [],
    overview: series.overview,
    director,
    cast,
    seasons: series.number_of_seasons,
    trailerKey: extractTrailerKey(series.videos),
  };
}

export async function getMovieDetail(id: number, locale?: string): Promise<ContentDetail> {
  const movie = await fetchFromTMDB<TMDBMovie>(`/movie/${id}`, {
    append_to_response: "credits,videos",
  }, localeToTMDBlang(locale), localeToTMDBRegion(locale));
  return mapMovieToDetail(movie);
}

export async function getSeriesDetail(id: number, locale?: string): Promise<ContentDetail> {
  const series = await fetchFromTMDB<TMDBSeries>(`/tv/${id}`, {
    append_to_response: "credits,videos",
  }, localeToTMDBlang(locale), localeToTMDBRegion(locale));
  return mapSeriesToDetail(series);
}

export async function getByGenre(
  type: MediaType = "movie",
  genreId: number,
  page = 1,
  locale?: string,
): Promise<ContentResult[]> {
  const data = await fetchFromTMDB<TMDBPaginatedResponse<TMDBMovie>>(
    `/discover/${type}`,
    { with_genres: String(genreId), page: String(page) },
    localeToTMDBlang(locale),
    localeToTMDBRegion(locale),
  );

  return data.results.map(type === "movie" ? mapMovieToResult : (item: any) => mapSeriesToResult(item as TMDBSeries));
}

export async function getWatchProviders(
  type: MediaType,
  id: number,
  locale?: string,
): Promise<TMDBWatchProvidersResponse> {
  return fetchFromTMDB<TMDBWatchProvidersResponse>(
    `/${type}/${id}/watch/providers`,
    undefined,
    localeToTMDBlang(locale),
    localeToTMDBRegion(locale),
  );
}

export async function getTrending(
  type: "all" | "movie" | "tv" = "all",
  page = 1,
  locale?: string,
): Promise<ContentResult[]> {
  const data = await fetchFromTMDB<TMDBPaginatedResponse<any>>(
    `/trending/${type}/week`,
    { page: String(page) },
    localeToTMDBlang(locale),
    localeToTMDBRegion(locale),
  );
  return data.results.map((item: any) =>
    item.media_type === "tv" || item.media_type === undefined && type === "tv"
      ? mapSeriesToResult(item as TMDBSeries)
      : mapMovieToResult(item as TMDBMovie),
  );
}

export async function getRecommendations(
  type: MediaType,
  id: number,
  locale?: string,
): Promise<ContentResult[]> {
  try {
    const data = await fetchFromTMDB<TMDBPaginatedResponse<any>>(
      `/${type}/${id}/recommendations`,
      {},
      localeToTMDBlang(locale),
      localeToTMDBRegion(locale),
    );
    return data.results.map((item: any) =>
      type === "movie"
        ? mapMovieToResult(item as TMDBMovie)
        : mapSeriesToResult(item as TMDBSeries),
    );
  } catch {
    return [];
  }
}

export const GENRE_MAP: Record<string, number> = {
  Acción: 28, Action: 28,
  Aventura: 12, Adventure: 12,
  Animación: 16, Animation: 16,
  Comedia: 35, Comedy: 35,
  Crimen: 80, Crime: 80,
  Documental: 99, Documentary: 99,
  Drama: 18,
  Familia: 10751, Family: 10751,
  Fantasía: 14, Fantasy: 14,
  Historia: 36, History: 36,
  Terror: 27, Horror: 27,
  Música: 10402, Music: 10402,
  Misterio: 9648, Mystery: 9648,
  Romance: 10749,
  "Ciencia ficción": 878, "Science Fiction": 878,
  "Película de TV": 10770, "TV Movie": 10770,
  Suspenso: 53, Thriller: 53,
  Bélica: 10752, War: 10752,
  Western: 37,
};

export const GENRE_ORDER_ES = [
  "Acción", "Aventura", "Animación", "Comedia", "Crimen",
  "Documental", "Drama", "Familia", "Fantasía", "Historia",
  "Terror", "Música", "Misterio", "Romance", "Ciencia ficción",
  "Película de TV", "Suspenso", "Bélica", "Western",
];

export const GENRE_ORDER_EN = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "History",
  "Horror", "Music", "Mystery", "Romance", "Science Fiction",
  "TV Movie", "Thriller", "War", "Western",
];