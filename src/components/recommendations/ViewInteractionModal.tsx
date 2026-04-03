import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { Interaction } from "../../interfaces/Interaction";
import type { Member } from "../../interfaces/Member";
import type { RecommendationComplete } from "../../interfaces/RecommendationComplete";
import { Dialog, Box, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import { COLORS, mechanicalButtonStyle } from "../../theme/AppTheme";
import { formatTerminalDate } from "../../utils/DateUtils";

interface ViewInteractionModalProps {
  open: boolean;
  onClose: () => void;
  interaction: Interaction | null;
  currentMember: Member | undefined;
  recommendation: RecommendationComplete | null;
}

export function ViewInteractionModal({ open, onClose, interaction, recommendation }: ViewInteractionModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!interaction) return null;

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
      {/* HEADER: Info general de la recomendación y número de interacción */}
      <Box sx={{ p: 3, pb: 2, borderBottom: `2px solid ${COLORS.primaryMid}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontWeight: 900, letterSpacing: '-1px', fontSize: '1.2rem', fontFamily: 'sans-serif', color: COLORS.primaryLight, textTransform: 'uppercase' }}>
            {t('viewInteraction.title', '> DETALLE DE INTERACCIÓN')}
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.8rem', mt: 0.5 }}>
            {recommendation?.movie.name || t('viewInteraction.unknownMovie', 'PELÍCULA DESCONOCIDA')}
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '1.5rem', fontWeight: 900 }}>
          #{interaction.number || '?'}
        </Typography>
      </Box>

      {/* CONTENIDO CON SCROLL PERSONALIZADO */}
      <DialogContent
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          // 👇 AQUÍ ESTÁN LOS ESTILOS DE LA BARRA DE SCROLL 👇
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: COLORS.primaryMid, borderRadius: 0 },
        }}
      >

        {/* SECCIÓN 1: USUARIO Y BOTÓN DE PERFIL */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, border: `1px dashed ${COLORS.primaryMid}`, backgroundColor: 'rgba(0,0,0,0.2)' }}>
          {/* Foto de perfil */}
          <Box
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              border: `2px solid ${COLORS.primaryMid}`,
              backgroundImage: `url(${interaction.member?.user?.imgUrl || '/assets/placeholder-avatar.png'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase' }}>
              {interaction.member?.nickname || interaction.member?.user?.username || t('viewInteraction.anonymousUser', 'ANÓNIMO')}
            </Typography>

            {/* Botón sutil para ir al perfil */}
            <Button
              disableRipple
              onClick={() => {
                onClose(); // Cerramos el modal antes de navegar para evitar bugs visuales
                navigate(`/userProfile/${interaction.member?.user?.id}`);
              }}
              sx={{
                p: 0,
                minWidth: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: COLORS.primaryMid,
                textTransform: 'uppercase',
                transition: 'color 0.1s linear',
                '&:hover': { color: COLORS.primaryLight, backgroundColor: 'transparent', textDecoration: 'underline' }
              }}
            >
              {t('viewInteraction.goToProfile', '[ IR AL PERFIL ]')}
            </Button>
          </Box>
        </Box>

        {/* SECCIÓN 2: ÉNFASIS (RATING Y RESPONSE) */}
        <Box sx={{ border: `2px solid ${COLORS.primaryLight}`, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}>

          {/* Bloque de Rating (Destacado) */}
          <Box sx={{ borderBottom: `2px solid ${COLORS.primaryLight}`, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontWeight: 900 }}>
              {t('viewInteraction.ratingLabel', 'CALIFICACIÓN:')}
            </Typography>
            {interaction.rating ? (
              <Typography sx={{ fontFamily: 'monospace', color: '#ffcc00', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '2px' }}>
                ★ {interaction.rating}
              </Typography>
            ) : (
              <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontStyle: 'italic' }}>
                {t('viewInteraction.noRating', 'SIN CALIFICAR')}
              </Typography>
            )}
          </Box>

          {/* Bloque de Response (Texto principal) */}
          <Box sx={{ p: 2.5, minHeight: '120px' }}>
            {interaction.response ? (
              <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                "{interaction.response}"
              </Typography>
            ) : (
              <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontStyle: 'italic', textAlign: 'center', mt: 4 }}>
                {t('viewInteraction.noResponse', '>>> NO SE DEJÓ NINGÚN COMENTARIO_')}
              </Typography>
            )}
          </Box>
        </Box>

        {/* SECCIÓN 3: METADATOS TÉCNICOS */}
        <Box sx={{ p: 2, border: `1px solid ${COLORS.primaryMid}`, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: '150px' }}>
            <MetadataItem label={t('viewInteraction.metadata.state', 'ESTADO')} value={interaction.state} />
            <MetadataItem label={t('viewInteraction.metadata.type', 'TIPO')} value={interaction.type} />
          </Box>
          <Box sx={{ flex: 1, minWidth: '150px' }}>
            <MetadataItem label={t('viewInteraction.metadata.created', 'CREADO')} value={formatTerminalDate(interaction.createdAt)} />
            <MetadataItem label={t('viewInteraction.metadata.edited', 'EDITADO')} value={formatTerminalDate(interaction.updatedAt)} />
          </Box>
        </Box>

      </DialogContent>

      {/* FOOTER: Botón principal de cierre */}
      <DialogActions sx={{ p: 3, pt: 1, borderTop: `2px solid ${COLORS.primaryMid}`, justifyContent: 'flex-end' }}>
        <Button
          onClick={onClose}
          disableRipple
          sx={{
            ...mechanicalButtonStyle,
            bgcolor: COLORS.primaryLight,
            color: COLORS.primaryDark,
            boxShadow: `4px 4px 0px ${COLORS.accentDark}`,
            p: '8px 32px',
            '&:hover': { filter: 'brightness(1.1)' }
          }}
        >
          {t('viewInteraction.okButton', 'OK')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Sub-componente para imprimir los metadatos
const MetadataItem = ({ label, value }: { label: string, value: string }) => (
  <Box sx={{ display: 'flex', mb: 0.5 }}>
    <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.8rem', width: '80px', flexShrink: 0 }}>
      [{label}]
    </Typography>
    <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '0.8rem', fontWeight: 'bold' }}>
      : {value}
    </Typography>
  </Box>
);
