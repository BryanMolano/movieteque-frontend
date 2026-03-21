import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../theme/AppTheme';
import type { RecommendationComplete } from '../../interfaces/RecommendationComplete';
import type { Member } from '../../interfaces/Member';
import { useState } from 'react';
import { movietequeApi } from '../../api/MovietequeApi';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

interface RecommendationSidebarProps {
  recommendation: RecommendationComplete;
  isAdminOrOwner: boolean | undefined;
  currentMember: Member | undefined;
}
export function RecommendationSidebar({ recommendation, isAdminOrOwner, currentMember }: RecommendationSidebarProps) {
  const rawDate = recommendation.createdAt;
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState<boolean>(false);
  const [isActivationDesactivationModalOpen, setIsActivationDesactivationModalOpen] = useState<boolean>(false);

  const ActivateDesactivateRecommendation = useMutation({
    mutationFn: async () => {
      await movietequeApi.post(`/recommendation/${recommendation.group.id}/activateDesactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      setIsActivationDesactivationModalOpen(false);
      navigate(`/group/${recommendation.group.id}`);
    },
    onError: (error) => {
      let serverMessage = "ERROR_DE_SISTEMA";
      if (axios.isAxiosError(error)) {
        serverMessage = error.response?.data?.message || serverMessage;
        if (Array.isArray(serverMessage)) serverMessage = serverMessage[0];
      }
      showToast(`[ ERROR ] ${serverMessage}`, 'error');
    }
  });

  return (null);
}
const formatTerminalDate = (dateString: string) => {
  if (!dateString) return "??/??/????";
  const datePart = dateString.substring(0, 10);
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
}
const mechanicalButtonStyle = {
  borderRadius: 0,
  border: `2px solid ${COLORS.primaryLight}`,
  backgroundColor: COLORS.primaryDark,
  color: COLORS.primaryLight,
  fontFamily: 'sans-serif',
  fontWeight: 900,
  fontSize: '1rem',
  letterSpacing: '-1.5px',
  padding: '12px 16px',
  boxShadow: `4px 4px 0px ${COLORS.accentMid}`,
  transition: 'all 0.05s linear',
  justifyContent: 'flex-start',
  '&:hover': {
    backgroundColor: COLORS.primaryDark,
    filter: 'brightness(1.2)',
  },
  '&:active': {
    transform: 'translate(4px, 4px)',
    boxShadow: `0px 0px 0px transparent`,
  },
};
