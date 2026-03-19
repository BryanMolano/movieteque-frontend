import type { MovieDetailsGenre } from "./MovieDetailsGenre";

export interface MovieDetails {
  id:number;
  title:string;
  original_title:string;
  poster_path:string|null;
  backdrop_path: string|null;
  release_date: string;
  overview: string;
  status: string;
  

  budget: number,
  revenue: number,
  runtime: number,
  origin_country: string,
  original_language: string,


  popularity: number,
  vote_average: number,
  vote_count: number,



  genres: MovieDetailsGenre[],
  cast:MovieCast[],
  directors: CrewMember[],
  writers: CrewMember[],
  composers: CrewMember[],
  crew: CrewMember[],
  backdrops: MovieImages[],
  logos: MovieImages[],
  posters: MovieImages[],
  videos: MovieVideo[];
  watch_providers: WatchProviders | null;
}
export interface MovieCast {
  id: number;
  name: string;
  character: string; 
  profile_path: string | null; 
}
export interface CrewMember {
  id: number;
  name: string;
  profile_path: string | null; 
  job: string; 
}
export interface MovieVideo {
  id: string;
  name: string;
  key: string; 
  type: string; 
}
export interface ProviderInfo {
  provider_id: number;
  provider_name: string;
  logo_path: string; 
}
export interface WatchProviders {
  flatrate?: ProviderInfo[]; // suscripción
}
export interface MovieImages{
  file_path: string;
  height: number;
  width: number;
}
