import { Box, Typography, Button, Stack, Dialog, DialogContent, DialogActions } from '@mui/material';
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
import { InteractionModal } from './InteractionModal';

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

  const isActive = recommendation.recommendationState === 'Active';

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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: `2px solid ${COLORS.primaryMid}`,
        backgroundColor: COLORS.primaryDark,
        p: 2,
        gap: 3,
        overflowY: 'auto', // Scroll interno
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: COLORS.primaryMid, borderRadius: 0 },
      }}
    >
      {/* PÓSTER DE LA PELÍCULA */}
      <Box
        sx={{
          width: '100%',
          aspectRatio: '2 / 3', // Formato clásico de póster de cine
          border: `2px solid ${COLORS.primaryLight}`,
          boxShadow: `5px 5px 0px ${COLORS.accentDark}`,
          backgroundImage: `url('https://image.tmdb.org/t/p/w500${recommendation.movie.posterUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // Filtro visual si está inactiva
          filter: isActive ? 'none' : 'grayscale(80%) opacity(0.7)'
        }}
      />

      {/* INFORMACIÓN DE LA RECOMENDACIÓN */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          sx={{
            fontFamily: 'sans-serif',
            fontWeight: 900,
            fontSize: '1.8rem',
            letterSpacing: '-1px',
            color: COLORS.primaryLight,
            textTransform: 'uppercase',
            lineHeight: 1.1,
            mb: 1
          }}
        >
          {recommendation.movie.name}
        </Typography>

        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid }}>
          {`${t('recSidebar.date', 'FECHA')}: ${formatTerminalDate(rawDate)}`}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid }}>
            {t('recSidebar.priority', 'PRIORIDAD')}:
          </Typography>

          {/* NUEVO DISEÑO DE PRIORIDAD: Solo el número en amarillo */}
          <Box sx={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            border: `1px solid ${COLORS.primaryMid}`,
            px: 1.5, // Un poco más ancho para que el número respire
            py: 0.2,
            boxShadow: `2px 2px 0px ${COLORS.primaryMid}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography sx={{ fontFamily: 'monospace', color: '#ffcc00', fontWeight: 900, fontSize: '1.1rem' }}>
              {recommendation.priority}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* BOTONES DE ACCIÓN PRINCIPALES */}
      <Stack spacing={2}>
        <Button
          disableRipple
          sx={mechanicalButtonStyle}
          onClick={() => navigate(`/movie/${recommendation.movie.id}`)}
        >
          {t('recSidebar.goToMovie', '> IR A PELÍCULA')}
        </Button>
        <Button
          disableRipple
          sx={mechanicalButtonStyle}
          onClick={() => setIsInteractionModalOpen(true)}
        >
          {t('recSidebar.interact', '> CREAR INTERACCIÓN')}
        </Button>
      </Stack>

      <InteractionModal
        open={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        recommendation={recommendation}
      />


      {/* BOTÓN DE DESACTIVAR/ACTIVAR (SÓLO ADMIN O DUEÑO) */}
      {isAdminOrOwner && (
        <Button
          disableRipple
          onClick={() => setIsActivationDesactivationModalOpen(true)}
          sx={{
            ...mechanicalButtonStyle,
            mt: 4,
            // Cambiamos el color sutilmente si la acción es "Activar"
            border: `2px solid ${isActive ? COLORS.primaryMid : COLORS.primaryLight}`,
            color: isActive ? COLORS.primaryMid : COLORS.primaryDark,
            backgroundColor: isActive ? 'transparent' : COLORS.primaryLight,
            boxShadow: `3px 3px 0px ${COLORS.accentDark}`,
            fontSize: '0.8rem',
            p: '8px',
            '&:hover': {
              backgroundColor: isActive ? COLORS.primaryDark : COLORS.primaryMid,
              color: isActive ? COLORS.primaryLight : COLORS.primaryDark,
              borderColor: isActive ? COLORS.primaryLight : COLORS.primaryMid,
            }
          }}
        >
          {isActive ? t('recSidebar.deactivate', 'DESACTIVAR RECOMENDACIÓN') : t('recSidebar.activate', 'ACTIVAR RECOMENDACIÓN')}
        </Button>
      )}

      {/* MODAL DINÁMICO DE CONFIRMACIÓN DE DESACTIVACIÓN/ACTIVACIÓN */}
      <Dialog
        open={isActivationDesactivationModalOpen}
        onClose={() => setIsActivationDesactivationModalOpen(false)}
        PaperProps={{
          sx: {
            // Modal rojo para desactivar, modal verde/secundario para activar
            border: `2px solid ${isActive ? '#ff5555' : '#55ff55'}`,
            boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
            backgroundColor: COLORS.primaryDark,
          }
        }}
      >
        <Box sx={{ p: 3, pb: 1, borderBottom: `2px solid ${isActive ? '#ff5555' : '#55ff55'}` }}>
          <Typography sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '1.5rem', fontFamily: 'sans-serif', color: isActive ? '#ff5555' : '#55ff55' }}>
            {isActive
              ? t('recSidebar.deactivateTitle', '¿DESACTIVAR RECOMENDACIÓN?')
              : t('recSidebar.activateTitle', '¿ACTIVAR RECOMENDACIÓN?')}
          </Typography>
        </Box>

        <DialogContent sx={{ pt: 4, pb: 4 }}>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid }}>
            {isActive
              ? t('recSidebar.deactivateBody', 'Esta acción ocultará la recomendación del grupo. ¿Deseas proceder?')
              : t('recSidebar.activateBody', 'Esta acción activará la recomendación y permitirá interactuar con ella. ¿Estás seguro?')}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
          <Button
            onClick={() => setIsActivationDesactivationModalOpen(false)}
            disableRipple
            sx={{
              ...mechanicalButtonStyle,
              border: `2px solid ${COLORS.primaryMid}`,
              boxShadow: `4px 4px 0px ${COLORS.accentDark}`,
              color: COLORS.primaryMid,
              p: '8px 16px'
            }}
          >
            {t('recSidebar.cancel', 'CANCELAR')}
          </Button>
          <Button
            onClick={() => ActivateDesactivateRecommendation.mutate()}
            disabled={ActivateDesactivateRecommendation.isPending}
            disableRipple
            sx={{
              ...mechanicalButtonStyle,
              // Color del botón: Rojo para desactivar, Verde para activar
              bgcolor: isActive ? '#ff5555' : '#55ff55',
              color: COLORS.primaryDark,
              borderColor: isActive ? '#ff5555' : '#55ff55',
              boxShadow: `4px 4px 0px ${COLORS.accentDark}`,
              p: '8px 16px',
              '&:hover': { bgcolor: isActive ? '#ff7777' : '#77ff77' }
            }}
          >
            {ActivateDesactivateRecommendation.isPending
              ? t('recSidebar.processing', 'PROCESANDO...')
              : t('recSidebar.confirmAction', 'CONFIRMAR')}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
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
