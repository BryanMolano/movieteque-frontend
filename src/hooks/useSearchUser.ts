import { useQuery } from "@tanstack/react-query";
import { movietequeApi } from "../api/MovietequeApi";
import type { User } from "../interfaces/User";


export const useSearchUser = (term: string | undefined) => {
  return useQuery({
    queryKey: ['searchUsers', term],
    queryFn: async () => {
      const { data } = await movietequeApi.get<User[]>(`/user/${term}/search`);
      return data;
    },
    enabled: !!term,
  });
};
