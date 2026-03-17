import { useQuery } from "@tanstack/react-query";
import { movietequeApi } from "../api/MovietequeApi";
import type { MovieDetails } from "../interfaces/MovieDetails";


export const useMovieDetails= (id: string| undefined) => {
  return useQuery({
    queryKey: ['movieDetails', id],
    queryFn: async () => {
      const { data } = await movietequeApi.get<MovieDetails>(`/movie/${id}/movieDetails`);
      return data;
    },
    enabled: !!id,
  });
};

