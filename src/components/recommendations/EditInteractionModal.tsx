import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import type { Interaction } from "../../interfaces/Interaction";
import { Dialog, Box, Typography, DialogContent, TextField, MenuItem, DialogActions, Button } from "@mui/material";
import { COLORS, terminalInputStyle, mechanicalButtonStyle } from "../../theme/AppTheme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { movietequeApi } from "../../api/MovietequeApi";
import type { Member } from "../../interfaces/Member";
import { useToast } from "../../contexts/ToastContext";
import type { RecommendationComplete } from "../../interfaces/RecommendationComplete";

interface EditInteractionModalProps {
  open: boolean;
  onClose: () => void;
  interaction: Interaction | null;
  currentMember: Member | undefined;
  recommendation: RecommendationComplete | null;
}

interface FormErrors {
  rating?: string;
  message?: string;
  state?: string;
  type?: string;
}

export function EditInteractionModal({ open, onClose, interaction, currentMember, recommendation }: EditInteractionModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [rating, setRating] = useState<string>(interaction?.rating ? interaction.rating.toString() : '');
  const [message, setMessage] = useState<string>(interaction?.response || '');
  const [interactionState, setInteractionState] = useState<'UNSEEN' | 'SEEN' | 'SKIPPED'>(interaction?.state || 'UNSEEN');
  const [interactionType, setInteractionType] = useState<'PUBLIC' | 'PRIVATE'>(interaction?.type || 'PRIVATE');


  const editInteractionMutation = useMutation({

    mutationFn: async () => {
      const response = await movietequeApi.patch(`/interaction/${recommendation?.group?.id}/${interaction?.id}`,
        {
          response: message ? message : null,
          rating: rating ? parseFloat(rating) : null,
          memberId: currentMember?.id,
          recommendationId: interaction?.recommendation?.id,
          state: interactionState,
          type: interactionType,
        })
      return response.data;
    },
    onSuccess: () => {
      onClose()
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
  if (!interaction) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: `2px solid #eab308`, // Borde amarillo/dorado para diferenciar que es MODO EDICIÓN
          boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
          backgroundColor: COLORS.primaryDark,
          borderRadius: 0,
        }
      }}
    >
      {/* HEADER DEL MODAL */}
      <Box sx={{ p: 3, pb: 2, borderBottom: `2px solid ${COLORS.primaryMid}` }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '1.5rem', fontFamily: 'sans-serif', color: '#eab308' }}>
          {t('editInteractionModal.title', '> EDITAR INTERACCIÓN')}
        </Typography>
        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.9rem', mt: 0.5 }}>
          {t('editInteractionModal.subtitle', `ACTUALIZANDO REGISTRO #${interaction.number || '?'}`)}
        </Typography>
      </Box>

      {/* CONTENIDO (FORMULARIO) */}
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* 1. PUNTUACIÓN */}
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
            inputProps={{ min: 1, max: 5, step: 0.01 }}
            error={Boolean(formErrors.rating)}
            helperText={formErrors.rating || t('interactionModal.ratingHelper', 'Valor entre 1 y 5 (máximo 2 decimales).')}
            sx={terminalInputStyle}
          />
        </Box>

        {/* 2. MENSAJE */}
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
            inputProps={{ maxLength: 2500 }}
            sx={terminalInputStyle}
            error={Boolean(formErrors.message)}
            helperText={formErrors.message || `${message.length}/2500`}
          />
        </Box>

        {/* 3. ESTADO */}
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

        {/* 4. TIPO */}
        <Box>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, mb: 1, fontWeight: 'bold' }}>
            {t('interactionModal.typeLabel', '4. TIPO DE VISIBILIDAD *')}
          </Typography>

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
          {t('editInteractionModal.cancel', 'CANCELAR')}
        </Button>
        <Button
          onClick={() => editInteractionMutation.mutate()}
          disabled={editInteractionMutation.isPending}
          disableRipple
          sx={{
            ...mechanicalButtonStyle,
            bgcolor: '#eab308', // Amarillo para edición
            color: COLORS.primaryDark,
            borderColor: '#eab308',
            boxShadow: `4px 4px 0px ${COLORS.accentDark}`,
            p: '8px 16px',
            '&:hover': { bgcolor: '#facc15' },
            '&:disabled': {
              bgcolor: COLORS.primaryMid,
              cursor: 'not-allowed',
              boxShadow: 'none',
              transform: 'translate(2px, 2px)'
            }
          }}
        >
          {editInteractionMutation.isPending ? t('editInteractionModal.loading', 'ACTUALIZANDO...') : t('editInteractionModal.confirm', 'GUARDAR CAMBIOS')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
