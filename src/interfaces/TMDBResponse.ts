import type { MovieBasic } from "./MovieBasic";

export interface TMDBResponde{
  page: number;
  results: MovieBasic[];
  total_pages:number;
  total_results:number
}
