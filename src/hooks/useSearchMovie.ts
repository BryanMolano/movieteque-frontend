import { useQuery } from "@tanstack/react-query";
import { movietequeApi } from "../api/MovietequeApi";
import type { User } from "../interfaces/User";
import type { MovieBasic } from "../interfaces/MovieBasic";


export const useSearchMovie= (term: string | undefined) => {
  return useQuery({
    queryKey: ['searchMovie', term],
    queryFn: async () => {
      const { data } = await movietequeApi.get<MovieBasic[]>(`/movie/${term}/search`);
      return data;
    },
    enabled: !!term,
  });
};

