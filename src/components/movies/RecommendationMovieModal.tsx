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
import { Dialog, Box, Typography, DialogContent, TextField, Select, MenuItem, DialogActions, Button } from "@mui/material";
import { COLORS } from "../../theme/AppTheme";

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
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [priority, setPriority] = useState<number>(1);
  const [message, setMessage] = useState('');
  const { data: groupsToRecommend, isLoading, isError } = useQuery({
    queryKey: ['groups', currentUser?.id],
    queryFn: async () => {
      const response = await movietequeApi.get(`/group/${currentUser?.id}/userGroups`);
      return response.data as Group[];
    }, enabled: open && !!currentUser?.id
  });
  const selectedGroup = groupsToRecommend?.find(g => g.id === selectedGroupId);

  const createRecommendationMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await movietequeApi.post(`/recommendation/${groupId}`,
        {
          movieId: movie?.id,
          moviePoster: movie?.poster_path,
          movieName: movie?.title,
          USER_LOCALE: USER_LOCALE,
          priority: priority,
          message: message
        })
      return response.data;
    },
    onSuccess: () => {
      showToast('[OK]', 'success')
      handleClose();
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
  const handleClose = () => {
    setStep(1);
    setSelectedGroupId(null);
    setMessage('');
    setPriority(1);
    onClose();
  }
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          border: `2px solid ${COLORS.primaryLight}`,
          boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
          backgroundColor: COLORS.primaryDark,
          borderRadius: 0,
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh'
        }
      }}
    >
      {/* ENCABEZADO DINÁMICO */}
      <Box sx={{ p: 3, pb: 2, borderBottom: `2px solid ${COLORS.primaryLight}` }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: '-1px', fontSize: '1.5rem', fontFamily: 'sans-serif', color: COLORS.primaryLight }}>
          {step === 1 ? '[ SELECCIONAR_GRUPO ]' : '[ REDACTAR_RECOMENDACIÓN ]'}
        </Typography>
      </Box>

      {/* CONTENIDO DEL MODAL */}
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3, p: { xs: 2, md: 3 } }}>

        {/* ================= PASO 1: LISTA DE GRUPOS ================= */}
        {step === 1 && (
          <>
            {isLoading ? (
              <Typography sx={{ color: COLORS.primaryMid, fontFamily: 'monospace' }}>Cargando grupos...</Typography>
            ) : groupsToRecommend?.length === 0 ? (
              <Typography sx={{ color: COLORS.primaryMid, fontFamily: 'monospace' }}>No tienes grupos disponibles.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {groupsToRecommend?.map((group) => (
                  <GroupSelectionRow
                    key={group.id}
                    group={group}
                    onSelect={() => {
                      setSelectedGroupId(group.id);
                      setStep(2);
                    }}
                  />
                ))}
              </Box>
            )}
          </>
        )}

        {/* ================= PASO 2: FORMULARIO ================= */}
        {step === 2 && movie && selectedGroup && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* INFO VISUAL: Película y Grupo */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, border: `2px solid ${COLORS.primaryMid}`, backgroundColor: 'rgba(0,0,0,0.2)' }}>
              {/* Poster miniatura */}
              <Box
                component="img"
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                sx={{ width: 60, height: 90, objectFit: 'cover', border: `2px solid ${COLORS.primaryLight}` }}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ color: COLORS.primaryLight, fontWeight: 900, fontFamily: 'sans-serif', fontSize: '1.1rem', lineHeight: 1.1, mb: 1 }} noWrap>
                  {movie.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="img" src={selectedGroup.imgUrl || 'https://via.placeholder.com/20'} sx={{ width: 20, height: 20, borderRadius: '50%' }} />
                  <Typography sx={{ color: COLORS.primaryMid, fontFamily: 'monospace', fontSize: '0.8rem' }} noWrap>
                    {`>> ${selectedGroup.name}`}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* INPUT: Mensaje */}
            <Box>
              <Typography sx={{ color: COLORS.primaryLight, fontFamily: 'monospace', mb: 1, fontSize: '0.9rem' }}>
                [ MENSAJE_RESEÑA ]
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="¿Por qué recomiendas esta película?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={neobrutalistInputSx}
              />
            </Box>

            {/* INPUT: Prioridad */}
            <Box>
              <Typography sx={{ color: COLORS.primaryLight, fontFamily: 'monospace', mb: 1, fontSize: '0.9rem' }}>
                [ NIVEL_PRIORIDAD : 1-10 ]
              </Typography>
              <Select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                fullWidth
                sx={neobrutalistInputSx}
                MenuProps={{ PaperProps: { sx: { backgroundColor: COLORS.primaryDark, border: `2px solid ${COLORS.primaryLight}`, borderRadius: 0 } } }}
              >
                {[...Array(10)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1} sx={{ fontFamily: 'monospace', color: COLORS.primaryLight }}>
                    {i + 1} {i + 1 === 10 && '(MÁXIMA)'}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* ACCIONES DEL MODAL (FOOTER DINÁMICO) */}
      <DialogActions sx={{ p: 2, borderTop: `2px solid ${COLORS.primaryMid}`, justifyContent: 'space-between' }}>
        {step === 1 ? (
          <Button disableRipple onClick={handleClose} sx={{ ...mechanicalBtnSx, width: '100%', borderColor: COLORS.primaryMid, color: COLORS.primaryMid }}>
            [ CANCELAR ]
          </Button>
        ) : (
          <>
            <Button disableRipple onClick={() => setStep(1)} sx={{ ...mechanicalBtnSx, borderColor: COLORS.primaryMid, color: COLORS.primaryMid }}>
              {'< VOLVER'}
            </Button>
            <Button
              disableRipple
              disabled={createRecommendationMutation.isPending}
              onClick={() => {
                if (selectedGroupId) createRecommendationMutation.mutate(selectedGroupId);
              }}
              sx={{ ...mechanicalBtnSx, backgroundColor: COLORS.primaryLight, color: COLORS.primaryDark, '&:hover': { backgroundColor: '#fff' } }}
            >
              {createRecommendationMutation.isPending ? '[ EJECUTANDO... ]' : '[ CONFIRMAR ]'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

// --- SUB-COMPONENTE PARA LA FILA DEL GRUPO (PASO 1) ---
function GroupSelectionRow({ group, onSelect }: { group: Group, onSelect: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1,
        border: `2px solid ${COLORS.primaryMid}`, transition: 'border-color 0.1s linear',
        '&:hover': { borderColor: COLORS.primaryLight }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flexGrow: 1, mr: 2 }}>
        <Box
          sx={{
            width: 40, height: 40, flexShrink: 0, border: `2px solid ${COLORS.primaryMid}`,
            backgroundImage: `url(${group.imgUrl || 'https://via.placeholder.com/40/0B2833/CBD3D6?text=G'})`,
            backgroundSize: 'cover', backgroundPosition: 'center', mr: 2
          }}
        />
        <Typography noWrap sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '1rem', fontWeight: 'bold' }}>
          {group.name}
        </Typography>
      </Box>
      <Button disableRipple onClick={onSelect} sx={{ ...mechanicalBtnSx, p: '4px 8px', fontSize: '0.8rem' }}>
        [ ELEGIR ]
      </Button>
    </Box>
  );
}

// --- ESTILOS BASE ---
const mechanicalBtnSx = {
  borderRadius: 0, border: `2px solid ${COLORS.primaryLight}`, backgroundColor: 'transparent',
  fontFamily: 'sans-serif', fontWeight: 900, fontSize: '1rem', letterSpacing: '-1px',
  padding: '8px 16px', boxShadow: `3px 3px 0px ${COLORS.accentDark}`, transition: 'all 0.05s linear',
  '&:hover': { backgroundColor: 'rgba(203, 211, 214, 0.05)' },
  '&:active': { transform: 'translate(3px, 3px)', boxShadow: `0px 0px 0px transparent` },
  '&.Mui-disabled': { borderColor: COLORS.primaryMid, color: COLORS.primaryMid, boxShadow: 'none' }
};

const neobrutalistInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    color: COLORS.primaryLight,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0,0,0,0.2)',
    '& fieldset': { border: `2px solid ${COLORS.primaryMid}` },
    '&:hover fieldset': { borderColor: COLORS.primaryLight },
    '&.Mui-focused fieldset': { borderColor: COLORS.primaryLight, borderWidth: '2px' },
  },
  '& .MuiSvgIcon-root': { color: COLORS.primaryLight } // Para la flecha del Select
}
