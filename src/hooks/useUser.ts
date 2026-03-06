import { useQuery } from "@tanstack/react-query";
import { movietequeApi } from "../api/MovietequeApi";
import type { User } from "../interfaces/User";

export const useUser = () => {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data } = await movietequeApi.get<User>('/auth/authUser');
      return data;
    },
    // Aquí podemos añadir configuraciones extra luego
    staleTime: 1000 * 60 * 5,
  });
};
