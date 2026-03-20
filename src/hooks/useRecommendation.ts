import { useQuery } from "@tanstack/react-query";
import { movietequeApi } from "../api/MovietequeApi";
import type { RecommendationComplete } from "../interfaces/RecommendationComplete";

export const useRecommendation= (id: string | undefined) => {
  return useQuery({
    queryKey: ['recommendation', id],
    queryFn: async () => {
      const { data } = await movietequeApi.get<RecommendationComplete>(`/recommendation/${id}/complete`);
      return data;
    },
    enabled: !!id,
  });
};
