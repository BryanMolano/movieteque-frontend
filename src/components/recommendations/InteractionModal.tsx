import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import type { RecommendationComplete } from "../../interfaces/RecommendationComplete";
import { Box, Typography, Button, Dialog, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { useState } from 'react';
import { COLORS, mechanicalButtonStyle, terminalInputStyle } from '../../theme/AppTheme';
import { movietequeApi } from "../../api/MovietequeApi";
import axios from "axios";
import type { Member } from "../../interfaces/Member";

interface Props {
  open: boolean;
  onClose: () => void;
  recommendation: RecommendationComplete | null;
  currentMember: Member | undefined;
}
interface FormErrors {
  rating?: string;
  message?: string;
  state?: string;
  type?: string;
}

export function InteractionModal({ open, onClose, recommendation, currentMember }: Props) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [rating, setRating] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [interactionState, setInteractionState] = useState<'UNSEEN' | 'SEEN' | 'SKIPPED'>('UNSEEN');
  const [interactionType, setInteractionType] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');

  const createInteraction = useMutation({

    mutationFn: async () => {
      const response = await movietequeApi.post(`/interaction/${recommendation?.group?.id}/create`,
        {
          response: message ? message : null,
          rating: rating ? parseFloat(rating) : null,
          memberId: currentMember?.id,
          recommendationId: recommendation?.id,
          state: interactionState,
          type: interactionType,
        })
      return response.data;
    },
    onSuccess: () => {
      onClose()
      //invalidar querys de interacciones
      queryClient.invalidateQueries({ queryKey: ['recommendation', recommendation?.id] });
      showToast('[ OK ]', 'success')
    },
    onError: (error) => {
      let serverErrors = {}
      if (axios.isAxiosError(error)) {
        serverErrors = (error.response?.data)?.message;
      }
      if (Array.isArray(serverErrors)) {
        const newErrors: FormErrors = {}
        serverErrors.forEach((msg: string) => {
          if (msg.includes('rating'))
            newErrors.rating = msg;
          if (msg.includes('response'))
            newErrors.message = msg;
          if (msg.includes('state'))
            newErrors.state = msg;
          if (msg.includes('type'))
            newErrors.type = msg;
        });
        setFormErrors(newErrors)
      }
    }
  })



  if (!recommendation) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: `2px solid ${COLORS.primaryLight}`,
          boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
          backgroundColor: COLORS.primaryDark,
          borderRadius: 0,
        }
      }}
    >
      {/* HEADER DEL MODAL */}
      <Box sx={{ p: 3, pb: 2, borderBottom: `2px solid ${COLORS.primaryMid}` }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '1.5rem', fontFamily: 'sans-serif', color: COLORS.primaryLight }}>
          {t('interactionModal.title', '> REGISTRAR INTERACCIÓN')}
        </Typography>
        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.9rem', mt: 0.5 }}>
          {t('interactionModal.subtitle', { movieName: recommendation.movie.name, defaultValue: `PELÍCULA: ${recommendation.movie.name}` })}
        </Typography>
      </Box>

      {/* CONTENIDO (FORMULARIO) */}
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* 1. PUNTUACIÓN (Opcional, 1-5, 2 decimales max) */}
        <Box>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, mb: 1, fontWeight: 'bold' }}>
            {t('interactionModal.ratingLabel', '1. PUNTUACIÓN (OPCIONAL)')}
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="Ej: 3.42"
            inputProps={{
              min: 1,
              max: 5,
              step: 0.01 // Permite hasta 2 decimales en el input nativo
            }}
            error={Boolean(formErrors.rating)}
            helperText={formErrors.rating || t('interactionModal.ratingHelper', 'Valor entre 1 y 5 (máximo 2 decimales).')}
            sx={terminalInputStyle}
          />
        </Box>

        {/* 2. MENSAJE (Textarea, límite alto) */}
        <Box>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, mb: 1, fontWeight: 'bold' }}>
            {t('interactionModal.messageLabel', '2. MENSAJE (OPCIONAL)')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('interactionModal.messagePlaceholder', 'Escribe tu reseña o comentario aquí..._')}
            inputProps={{ maxLength: 2500 }} // Límite generoso para la BD
            sx={terminalInputStyle}

            error={Boolean(formErrors.message)}
            helperText={formErrors.message || `${message.length}/2500`}
          />
        </Box>

        {/* 3. ESTADO (Select) */}
        <Box>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, mb: 1, fontWeight: 'bold' }}>
            {t('interactionModal.stateLabel', '3. ESTADO *')}
          </Typography>
          <TextField
            select
            fullWidth
            value={interactionState}
            onChange={(e) => setInteractionState(e.target.value as 'UNSEEN' | 'SEEN' | 'SKIPPED')}
            sx={terminalInputStyle}
          >
            <MenuItem value="UNSEEN">{t('interactionModal.stateUnseen', 'UNSEEN (No vista)')}</MenuItem>
            <MenuItem value="SEEN">{t('interactionModal.stateSeen', 'SEEN (Vista)')}</MenuItem>
            <MenuItem value="SKIPPED">{t('interactionModal.stateSkipped', 'SKIPPED (Omitida)')}</MenuItem>
          </TextField>
        </Box>

        {/* 4. TIPO (Select + Explicación) */}
        <Box>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, mb: 1, fontWeight: 'bold' }}>
            {t('interactionModal.typeLabel', '4. TIPO DE VISIBILIDAD *')}
          </Typography>

          {/* Caja explicativa estilo terminal */}
          <Box sx={{ mb: 2, p: 1.5, border: `1px dashed ${COLORS.primaryMid}`, backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.8rem' }}>
              <strong>[ PUBLIC ]:</strong> {t('interactionModal.typePublicDesc', 'Todos los usuarios del grupo podrán ver esta interacción.')}<br />
              <strong>[ PRIVATE ]:</strong> {t('interactionModal.typePrivateDesc', 'Solo el usuario que hizo la recomendación podrá verla.')}
            </Typography>
          </Box>

          <TextField
            select
            fullWidth
            value={interactionType}
            onChange={(e) => setInteractionType(e.target.value as 'PUBLIC' | 'PRIVATE')}
            sx={terminalInputStyle}
          >
            <MenuItem value="PRIVATE">{t('interactionModal.typePrivate', 'PRIVATE (Privado)')}</MenuItem>
            <MenuItem value="PUBLIC">{t('interactionModal.typePublic', 'PUBLIC (Público)')}</MenuItem>
          </TextField>
        </Box>

      </DialogContent>

      {/* FOOTER (BOTONES) */}
      <DialogActions sx={{ p: 3, pt: 1, gap: 2, borderTop: `2px solid ${COLORS.primaryMid}` }}>
        <Button
          onClick={onClose}
          disableRipple
          sx={{
            ...mechanicalButtonStyle,
            border: `2px solid ${COLORS.primaryMid}`,
            boxShadow: `4px 4px 0px ${COLORS.accentDark}`,
            color: COLORS.primaryMid,
            p: '8px 16px'
          }}
        >
          {t('interactionModal.cancel', 'CANCELAR')}
        </Button>
        <Button
          onClick={() => createInteraction.mutate()}
          disabled={createInteraction.isPending}
          disableRipple
          sx={{
            ...mechanicalButtonStyle,
            bgcolor: COLORS.primaryLight,
            color: COLORS.primaryDark,
            boxShadow: `4px 4px 0px ${COLORS.accentDark}`,
            p: '8px 16px',
            '&:hover': { filter: 'brightness(1.1)' },
            '&:disabled': {
              bgcolor: COLORS.primaryMid,
              cursor: 'not-allowed',
              boxShadow: 'none',
              transform: 'translate(2px, 2px)'
            }
          }}
        >
          {createInteraction.isPending
            ? t('interactionModal.loading', 'PROCESANDO...')
            : t('interactionModal.confirm', 'CREAR INTERACCIÓN')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
