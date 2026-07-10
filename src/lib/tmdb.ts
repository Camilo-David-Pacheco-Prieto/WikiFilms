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
  return locale === "es" ? "es-ES" : "en-US";
}

async function fetchFromTMDB<T>(
  endpoint: string,
  params?: Record<string, string>,
  lang?: string,
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY ?? "");
  url.searchParams.set("language", lang ?? "es-ES");
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
  }, localeToTMDBlang(locale));

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
    if (v.official && v.type === "Trailer") return 0;
    if (v.type === "Trailer") return 1;
    if (v.official && v.type === "Teaser") return 2;
    if (v.type === "Teaser") return 3;
    return 4;
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
  }, localeToTMDBlang(locale));
  return mapMovieToDetail(movie);
}

export async function getSeriesDetail(id: number, locale?: string): Promise<ContentDetail> {
  const series = await fetchFromTMDB<TMDBSeries>(`/tv/${id}`, {
    append_to_response: "credits,videos",
  }, localeToTMDBlang(locale));
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
  );
  return data.results.map((item: any) =>
    item.media_type === "tv" || item.media_type === undefined && type === "tv"
      ? mapSeriesToResult(item as TMDBSeries)
      : mapMovieToResult(item as TMDBMovie),
  );
}

export const GENRE_MAP: Record<string, number> = {
  Acción: 28,
  Aventura: 12,
  Animación: 16,
  Comedia: 35,
  Crimen: 80,
  Documental: 99,
  Drama: 18,
  Familia: 10751,
  Fantasía: 14,
  Historia: 36,
  Terror: 27,
  Música: 10402,
  Misterio: 9648,
  Romance: 10749,
  "Ciencia ficción": 878,
  "Película de TV": 10770,
  Suspenso: 53,
  Bélica: 10752,
  Western: 37,
};