import { useTranslation } from "react-i18next";
import type { Member } from "../../interfaces/Member";
import type { RecommendationComplete } from "../../interfaces/RecommendationComplete";
import { useState } from "react";
import type { Interaction } from "../../interfaces/Interaction";
import { Box, Typography, Grid, Button, Dialog, DialogContent, DialogActions } from "@mui/material";
import { COLORS } from "../../theme/AppTheme";
import { mechanicalButtonStyle } from "../../theme/AppTheme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { movietequeApi } from "../../api/MovietequeApi";
import { useToast } from "../../contexts/ToastContext";
import { EditInteractionModal } from "./EditInteractionModal";
import { ViewInteractionModal } from "./ViewInteractionModal";
import { formatTerminalDate } from "../../utils/DateUtils";

interface RecommendationInteractionsProps {
  recommendation: RecommendationComplete | null;
  isOwner: boolean | undefined;
  currentMember: Member | undefined;
}
export function RecommendationInteractions({ recommendation, isOwner, currentMember }: RecommendationInteractionsProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [interactionToView, setInteractionToView] = useState<Interaction | null>(null);
  const [interactionToEdit, setInteractionToEdit] = useState<Interaction | null>(null);
  const [interactionToDelete, setInteractionToDelete] = useState<Interaction | null>(null);

  //filtrado
  const [showCurrentUserInteractions, setShowCurrentUserInteractions] = useState<boolean>(false);
  const [stateOption, setStateOption] = useState<'ALL' | 'SEEN' | 'UNSEEN' | 'SKIPPED'>('ALL');
  const [privacySortingOption, setPrivacySortingOption] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');
  const [sortingOption, setSortingOption] = useState<'DATE' | 'RATING'>('DATE');

  const processedInteractions = (recommendation?.interactions || [])
    .filter(interaction => {
      if (showCurrentUserInteractions) return interaction?.member?.user?.id === currentMember?.user?.id;
      else if (!showCurrentUserInteractions) return true;
    })
    .filter(interaction => {
      if (stateOption === 'SEEN') return interaction.state === 'SEEN';
      else if (stateOption === 'UNSEEN') return interaction.state === 'UNSEEN';
      else if (stateOption === 'SKIPPED') return interaction.state === 'SKIPPED';
      else if (stateOption === 'ALL') return true;
    })
    .filter(interaction => {
      if (interaction.member?.user.id === currentMember?.user?.id) return true;
      if (!isOwner) return interaction.type === 'PUBLIC';
      if (privacySortingOption === 'PUBLIC') return interaction.type === 'PUBLIC';
      else if (privacySortingOption === 'PRIVATE') return interaction.type === 'PRIVATE';
    })
    .sort((a, b) => {
      if (sortingOption === 'RATING') {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      } else {
        const tiempoA = new Date(a.createdAt).getTime();
        const tiempoB = new Date(b.createdAt).getTime();
        return tiempoB - tiempoA;
      }
    })

  const DeleteInteractionMutation = useMutation({
    mutationFn: async () => {
      const response = await movietequeApi.post(`/interaction/${recommendation?.group.id}/delete`, { id: interactionToDelete?.id })
      return response.data;
    },
    onSuccess: (data) => {
      showToast(`[ OK ] `, 'success');
      queryClient.invalidateQueries({ queryKey: ['recommendation', recommendation?.id] });
      setInteractionToDelete(null);
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
        gap: 2,
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: COLORS.primaryMid, borderRadius: 0 },
      }}
    >
      {/* TÍTULO */}
      <Typography
        sx={{
          fontFamily: 'sans-serif',
          fontWeight: 900,
          fontSize: '1.2rem',
          letterSpacing: '-1px',
          color: COLORS.primaryLight,
          borderBottom: `2px solid ${COLORS.primaryMid}`,
          pb: 1,
          mb: 1
        }}
      >
        {t('interactions.title', '> INTERACCIONES')}
      </Typography>

      {/* PANEL DE FILTROS */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>

        <FilterRow>
          <FilterButton active={!showCurrentUserInteractions} onClick={() => setShowCurrentUserInteractions(false)}>
            {t('interactions.filterAll', 'TODAS')}
          </FilterButton>
          <FilterButton active={showCurrentUserInteractions} onClick={() => setShowCurrentUserInteractions(true)}>
            {t('interactions.filterMine', 'MÍAS')}
          </FilterButton>
        </FilterRow>

        <FilterRow>
          <FilterButton active={sortingOption === 'DATE'} onClick={() => setSortingOption('DATE')}>
            {t('interactions.sortDate', 'RECIENTES')}
          </FilterButton>
          <FilterButton active={sortingOption === 'RATING'} onClick={() => setSortingOption('RATING')}>
            {t('interactions.sortRating', 'PUNTUACIÓN')}
          </FilterButton>
        </FilterRow>

        {isOwner && (
          <FilterRow>
            <FilterButton active={privacySortingOption === 'PUBLIC'} onClick={() => setPrivacySortingOption('PUBLIC')}>
              {t('interactions.typePublic', 'PÚBLICAS')}
            </FilterButton>
            <FilterButton active={privacySortingOption === 'PRIVATE'} onClick={() => setPrivacySortingOption('PRIVATE')}>
              {t('interactions.typePrivate', 'PRIVADAS')}
            </FilterButton>
          </FilterRow>
        )}

        <FilterRow>
          <FilterButton active={stateOption === 'ALL'} onClick={() => setStateOption('ALL')}>ALL</FilterButton>
          <FilterButton active={stateOption === 'SEEN'} onClick={() => setStateOption('SEEN')}>SEEN</FilterButton>
          <FilterButton active={stateOption === 'UNSEEN'} onClick={() => setStateOption('UNSEEN')}>UNS</FilterButton>
          <FilterButton active={stateOption === 'SKIPPED'} onClick={() => setStateOption('SKIPPED')}>SKIP</FilterButton>
        </FilterRow>
      </Box>

      {/* LISTA DE INTERACCIONES */}
      {processedInteractions.length === 0 && (
        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, textAlign: 'center', mt: 2 }}>
          {t('interactions.empty', '>>> NO_HAY_INTERACCIONES_')}
        </Typography>
      )}

      {processedInteractions.map((interaction) => {
        const isMyInteraction = interaction?.member?.user?.id === currentMember?.user?.id;

        return (
          <Box
            key={interaction.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: 1.5,
              border: `2px solid ${COLORS.primaryMid}`,
              backgroundColor: isMyInteraction ? 'rgba(97, 123, 133, 0.1)' : 'transparent',
              transition: 'border-color 0.1s linear',
              '&:hover': { borderColor: COLORS.primaryLight }
            }}
          >
            {/* Cabecera de la interacción */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>

              {/* --- INICIO CAMBIO 1: Contenedor Izquierdo con Foto y Textos --- */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

                {/* Cuadro de la Foto del Usuario */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    border: `2px solid ${COLORS.primaryMid}`,
                    backgroundImage: `url(${interaction.member?.user?.imgUrl || 'https://via.placeholder.com/40/0B2833/CBD3D6?text=?'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />

                {/* Textos del Usuario */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', lineHeight: 1.1 }}>
                    {interaction.member?.nickname || interaction.member?.user?.username || 'ANONYMOUS'}
                  </Typography>

                  {/* --- INICIO CAMBIO 2: Inclusión del número de interacción --- */}
                  <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.8rem', mt: 0.5 }}>
                    #{interaction.number ?? '?'} | {formatTerminalDate(interaction.createdAt)} | [{interaction.state}] | [{interaction.type}]
                  </Typography>
                  {/* --- FIN CAMBIO 2 --- */}
                </Box>
              </Box>
              {/* --- FIN CAMBIO 1 --- */}

              {/* Rating Box */}
              {interaction.rating && (
                <Box sx={{ border: `1px solid ${COLORS.primaryMid}`, px: 1, py: 0.5, backgroundColor: 'rgba(0,0,0,0.3)', ml: 1, flexShrink: 0 }}>
                  <Typography sx={{ fontFamily: 'monospace', color: '#ffcc00', fontWeight: 900 }}>★ {interaction.rating}</Typography>
                </Box>
              )}
            </Box>

            {/* BOTONES DE LA INTERACCIÓN */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Button
                disableRipple
                sx={interactionBtnStyle}
                onClick={() => setInteractionToView(interaction)}
              >
                {t('interactions.btnView', '> VER')}
              </Button>

              {(isMyInteraction && recommendation?.recommendationState === 'Active') && (
                <>
                  <Button
                    disableRipple
                    sx={{ ...interactionBtnStyle, color: '#eab308', borderColor: '#eab308', '&:hover': { backgroundColor: 'rgba(234, 179, 8, 0.1)' } }}
                    onClick={() => setInteractionToEdit(interaction)}
                  >
                    {t('interactions.btnEdit', 'EDITAR')}
                  </Button>
                  <Button
                    disableRipple
                    sx={{ ...interactionBtnStyle, color: '#ff5555', borderColor: '#ff5555', '&:hover': { backgroundColor: 'rgba(255, 85, 85, 0.1)' } }}
                    onClick={() => setInteractionToDelete(interaction)}
                  >
                    {t('interactions.btnDelete', 'ELIMINAR')}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        );
      })}

      {/* ===== MODAL DE ELIMINACIÓN ===== */}
      <EditInteractionModal
        key={interactionToEdit ? interactionToEdit.id : 'no-interaction-to-edit'}
        open={Boolean(interactionToEdit)}
        onClose={() => setInteractionToEdit(null)}
        interaction={interactionToEdit}
        currentMember={currentMember}
        recommendation={recommendation}
      />
      <ViewInteractionModal
        key={interactionToView ? interactionToView.id : 'no-interaction-to-view'}
        open={Boolean(interactionToView)}
        onClose={() => setInteractionToView(null)}
        interaction={interactionToView}
        currentMember={currentMember}
        recommendation={recommendation}
      />
      <Dialog
        open={Boolean(interactionToDelete)}
        onClose={() => setInteractionToDelete(null)}
        PaperProps={{
          sx: {
            border: `2px solid #ff5555`,
            boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
            backgroundColor: COLORS.primaryDark,
            borderRadius: 0
          }
        }}
      >
        <Box sx={{ p: 3, pb: 1, borderBottom: `2px solid #ff5555` }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', fontFamily: 'sans-serif', color: '#ff5555', letterSpacing: '-1px' }}>
            {t('interactions.deleteTitle', '¿ELIMINAR INTERACCIÓN?')}
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 4, pb: 4 }}>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid }}>
            {t('interactions.deleteBody', 'Esta acción es irreversible. ¿Deseas borrar tu interacción de esta recomendación?')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
          <Button
            onClick={() => setInteractionToDelete(null)}
            disableRipple
            sx={{ ...mechanicalButtonStyle, border: `2px solid ${COLORS.primaryMid}`, color: COLORS.primaryMid, boxShadow: `4px 4px 0px ${COLORS.accentDark}` }}
          >
            {t('interactions.cancel', 'CANCELAR')}
          </Button>
          <Button
            onClick={() => DeleteInteractionMutation.mutate()}
            disabled={DeleteInteractionMutation.isPending}
            disableRipple
            sx={{ ...mechanicalButtonStyle, bgcolor: '#ff5555', color: COLORS.primaryDark, borderColor: '#ff5555', boxShadow: `4px 4px 0px ${COLORS.accentDark}`, '&:hover': { bgcolor: '#ff7777' } }}
          >
            {DeleteInteractionMutation.isPending
              ? t('interactions.deleting', 'BORRANDO...')
              : t('interactions.confirmDelete', 'ELIMINAR')}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

// ==========================================
// SUB-COMPONENTES
// ==========================================

const FilterRow = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: 'flex', width: '100%', border: `1px solid ${COLORS.primaryMid}` }}>
    {children}
  </Box>
);

const FilterButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
  <Button
    disableRipple
    onClick={onClick}
    sx={{
      flex: 1,
      borderRadius: 0,
      p: '6px 8px',
      fontFamily: 'monospace',
      fontSize: '0.8rem',
      fontWeight: 900,
      backgroundColor: active ? COLORS.primaryLight : 'transparent',
      color: active ? COLORS.primaryDark : COLORS.primaryMid,
      borderRight: `1px solid ${COLORS.primaryMid}`,
      '&:last-child': { borderRight: 'none' },
      '&:hover': { backgroundColor: active ? COLORS.primaryLight : 'rgba(203, 211, 214, 0.1)' }
    }}
  >
    {children}
  </Button>
);

const interactionBtnStyle = {
  borderRadius: 0,
  border: `1px solid ${COLORS.primaryLight}`,
  color: COLORS.primaryLight,
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  p: '4px 12px',
  minWidth: 'auto',
  transition: 'none',
  '&:hover': { backgroundColor: 'rgba(203, 211, 214, 0.1)' }
};

// const formatTerminalDate = (dateString: string) => {
//   if (!dateString) return "??/??/????";
//   const datePart = dateString.substring(0, 10);
//   const [year, month, day] = datePart.split('-');
//   return `${day}/${month}/${year}`;
// }
