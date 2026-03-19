import { useQuery } from "@tanstack/react-query";
import { movietequeApi } from "../api/MovietequeApi";
import type { MovieDetails } from "../interfaces/MovieDetails";
import { USER_LOCALE } from "../utils/localeSettings";


export const useMovieDetails= (id: string| undefined) => {
  return useQuery({
    queryKey: ['movieDetails', id],
    queryFn: async () => {
      const { data } = await movietequeApi.get<MovieDetails>(`/movie/${id}/${USER_LOCALE}/movieDetails`);
      return data;
    },
    enabled: !!id,
  });
};

