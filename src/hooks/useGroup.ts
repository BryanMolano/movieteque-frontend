import { useQuery } from "@tanstack/react-query";
import { movietequeApi } from "../api/MovietequeApi";
import type { User } from "../interfaces/User";
import type { Group } from "../interfaces/Group";

export const useGroup = (id: string | undefined) => {
  return useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      const { data } = await movietequeApi.get<Group>(`/group/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
