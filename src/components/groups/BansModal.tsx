import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import { COLORS } from "../../theme/AppTheme"; // Ajusta la ruta si es necesario
import type { Member } from "../../interfaces/Member"; // Ajusta la ruta si es necesario
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { movietequeApi } from "../../api/MovietequeApi";
import { useToast } from "../../contexts/ToastContext";
import type { Group } from "../../interfaces/Group";
import { useTranslation } from "react-i18next"; // <-- Importado useTranslation

interface BansModalProps {
  open: boolean;
  onClose: () => void;
  sortedMembers: Member[];
  group: Group;
}

interface BanMemberInput {
  memberId: string;
}

export function BansModal({ open, onClose, sortedMembers, group }: BansModalProps) {
  const { t } = useTranslation(); // <-- Instanciado el traductor
  // Filtramos visualmente a los miembros
  const activeMembers = sortedMembers.filter(m => !m.isBanned && m.role.toLowerCase() !== 'admin');
  const bannedMembers = sortedMembers.filter(m => m.isBanned);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const banMember = useMutation({
    mutationFn: async ({ memberId }: BanMemberInput) => {
      const response = await movietequeApi.post(`/group/${group.id}/ban`, { id: memberId })
      return response.data;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', group.id] });
      showToast('[OK]', 'success')
    },
    onError: (error) => {
      let serverMessage = t('bansModal.systemError', 'ERROR_DE_SISTEMA');
      if (axios.isAxiosError(error)) {
        serverMessage = error.response?.data?.message || serverMessage;
        if (Array.isArray(serverMessage)) serverMessage = serverMessage[0];
      }
      showToast(`[ ERROR ] ${serverMessage}`, 'error');
    }
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          border: `2px solid #ff5555`,
          boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
          backgroundColor: COLORS.primaryDark,
          borderRadius: 0,
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh'
        }
      }}
    >
      {/* ENCABEZADO */}
      <Box sx={{ p: 3, pb: 2, borderBottom: `2px solid #ff5555` }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '1.5rem', fontFamily: 'sans-serif', color: '#ff5555' }}>
          {t('bansModal.title', '[ BANEOS ]')}
        </Typography>
      </Box>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 3, p: 2 }}>

        {/* --- SECCIÓN 1: USUARIOS ACTIVOS (PARA BANEAR) --- */}
        <Box>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, mb: 2, fontWeight: 'bold' }}>
            {t('bansModal.activeUsers', '>>> USUARIOS[{{count}}]', { count: activeMembers.length })}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {activeMembers.length === 0 && (
              <Typography sx={{ color: COLORS.primaryMid, fontSize: '0.9rem' }}>
                {t('bansModal.noActiveUsers', '> NO HAY USUARIOS.')}
              </Typography>
            )}
            {activeMembers.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                actionLabel={t('bansModal.banBtn', 'BANEAR')}
                actionColor="#ff5555"
                onAction={() => banMember.mutate({ memberId: member.id })}
              />
            ))}
          </Box>
        </Box>

        {/* --- SECCIÓN 2: LISTA NEGRA (PARA DESBANEAR) --- */}
        <Box sx={{ borderTop: `1px dashed ${COLORS.primaryMid}`, pt: 3 }}>
          <Typography sx={{ fontFamily: 'monospace', color: '#ff5555', mb: 2, fontWeight: 'bold' }}>
            {t('bansModal.bannedUsers', '>>> BANEADOS[{{count}}]', { count: bannedMembers.length })}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {bannedMembers.length === 0 && (
              <Typography sx={{ color: COLORS.primaryMid, fontSize: '0.9rem' }}>
                {t('bansModal.noBannedUsers', '> NO HAY USUARIOS BANEADOS.')}
              </Typography>
            )}
            {bannedMembers.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                actionLabel={t('bansModal.unbanBtn', 'DESBANEAR')}
                actionColor={COLORS.primaryLight}
                onAction={() => banMember.mutate({ memberId: member.id })}
              />
            ))}
          </Box>
        </Box>

      </DialogContent>

      {/* ACCIONES DEL MODAL (CERRAR) */}
      <DialogActions sx={{ p: 2, borderTop: `2px solid ${COLORS.primaryMid}` }}>
        <Button
          disableRipple
          onClick={onClose}
          sx={{
            ...mechanicalBtnSx,
            width: '100%',
            borderColor: COLORS.primaryMid,
            color: COLORS.primaryMid,
            justifyContent: 'center'
          }}
        >
          {t('bansModal.closeBtn', 'CERRAR')}
        </Button>
      </DialogActions>

    </Dialog>
  );
}

// --- SUB-COMPONENTE PARA REUTILIZAR EL DISEÑO DE LA FILA ---
function MemberRow({ member, actionLabel, actionColor, onAction }: { member: Member, actionLabel: string, actionColor: string, onAction: () => void }) {
  const { t } = useTranslation(); // <-- Agregado para traducir ANONYMOUS aquí adentro

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
        border: `2px solid ${COLORS.primaryMid}`,
        backgroundColor: 'transparent',
        transition: 'border-color 0.1s linear',
        '&:hover': { borderColor: actionColor }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flexGrow: 1, mr: 2 }}>
        {/* Foto de perfil cuadrada */}
        <Box
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            border: `2px solid ${COLORS.primaryMid}`,
            backgroundImage: `url(${member.user?.imgUrl || '/assets/placeholder-avatar.png'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mr: 2
          }}
        />
        {/* Textos */}
        <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Typography noWrap sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '1rem' }}>
            {member.nickname || member.user?.username || t('bansModal.anonymous', 'ANONYMOUS')}
          </Typography>
          {member.nickname && member.user?.username && (
            <Typography noWrap sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.75rem' }}>
              [{member.user.username}]
            </Typography>
          )}
        </Box>
      </Box>

      {/* Botón de Acción (Banear/Desbanear) */}
      <Button
        disableRipple
        onClick={onAction}
        sx={{
          minWidth: 'auto',
          p: '4px 8px',
          borderRadius: 0,
          fontFamily: 'monospace',
          fontWeight: 900,
          fontSize: '0.8rem',
          transition: 'all 0.05s linear',
          border: `2px solid ${actionColor}`,
          backgroundColor: 'transparent',
          color: actionColor,
          boxShadow: `2px 2px 0px ${COLORS.accentDark}`,
          '&:hover': {
            backgroundColor: actionColor,
            color: COLORS.primaryDark,
          },
          '&:active': {
            transform: 'translate(2px, 2px)',
            boxShadow: `0px 0px 0px transparent`,
          }
        }}
      >
        {actionLabel}
      </Button>
    </Box>
  );
}

const mechanicalBtnSx = {
  borderRadius: 0,
  border: `2px solid ${COLORS.primaryLight}`,
  backgroundColor: 'transparent',
  fontFamily: 'sans-serif',
  fontWeight: 900,
  fontSize: '1rem',
  letterSpacing: '-1px',
  padding: '8px 16px',
  boxShadow: `3px 3px 0px ${COLORS.accentDark}`,
  transition: 'all 0.05s linear',
  '&:hover': {
    backgroundColor: 'rgba(203, 211, 214, 0.05)',
  },
  '&:active': {
    transform: 'translate(3px, 3px)',
    boxShadow: `0px 0px 0px transparent`,
  },
};
