import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { movietequeApi } from "../../api/MovietequeApi";
import { useUser } from "../../hooks/useUser";
import type { Group } from "../../interfaces/Group";
import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useToast } from "../../contexts/ToastContext";
import type { Movie } from "../../interfaces/Movie";
import type { MovieDetails } from "../../interfaces/MovieDetails";
import { USER_LOCALE } from "../../utils/localeSettings";

interface Props {
  open: boolean;
  onClose: () => void;
  movie: MovieDetails | undefined;
}

export function RecommendationMovieModal({ open, onClose, movie }: Props) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient()
  const { data: currentUser } = useUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const { data: groupsToRecommend, isLoading, isError } = useQuery({
    queryKey: ['groups', currentUser?.id],
    queryFn: async () => {
      const response = await movietequeApi.get(`/group/${currentUser?.id}/userGroups`);
      return response.data as Group[];
    }, enabled: open && !!currentUser?.id
  });

  const inviteUser = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await movietequeApi.post(`/recommendation/${groupId}`,
        { movieId: movie?.id, moviePoster: movie?.poster_path, movieName: movie?.title, USER_LOCALE: USER_LOCALE })
      return response.data;
    },
    onSuccess: () => {
      showToast('[OK]', 'success')
    },
    onError: (error) => {
      let serverMessage = "ERROR_DE_SISTEMA";
      if (axios.isAxiosError(error)) {
        serverMessage = error.response?.data?.message || serverMessage;
        if (Array.isArray(serverMessage)) serverMessage = serverMessage[0];
      }
      showToast(`[ ERROR ] ${serverMessage}`, 'error');
    }
  })
  return (null);
}
