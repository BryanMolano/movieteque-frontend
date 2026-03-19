import { useQuery } from "@tanstack/react-query";
import { movietequeApi } from "../api/MovietequeApi";
import type { MovieBasic } from "../interfaces/MovieBasic";
import { USER_LOCALE } from "../utils/localeSettings";


export const useSearchMovie= (term: string | undefined) => {
  return useQuery({
    queryKey: ['searchMovie', term],
    queryFn: async () => {
      const { data } = await movietequeApi.get<MovieBasic[]>(`/movie/${term}/${USER_LOCALE}/search`);
      return data;
    },
    enabled: !!term,
  });
};

