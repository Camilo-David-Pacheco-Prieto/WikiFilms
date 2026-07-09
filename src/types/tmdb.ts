export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genres: { id: number; name: string }[];
  credits?: {
    cast: { name: string }[];
    crew: { job: string; name: string }[];
  };
}

export interface TMDBSeries {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  credits?: {
    cast: { name: string }[];
  };
  created_by?: { name: string }[];
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export type MediaType = "movie" | "tv";

export interface ContentResult {
  id: number;
  title: string;
  type: MediaType;
  year: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: number;
  genres: string[];
}

export interface ContentDetail extends ContentResult {
  overview: string;
  director: string;
  cast: string[];
  seasons?: number;
}