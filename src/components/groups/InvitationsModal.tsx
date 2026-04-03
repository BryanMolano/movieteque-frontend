import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import { COLORS } from "../../theme/AppTheme"; // Ajusta la ruta
import type { Group } from "../../interfaces/Group"; // Ajusta la ruta a tu interfaz real
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { movietequeApi } from "../../api/MovietequeApi";
import type { User } from "../../interfaces/User";
import axios from "axios";
import { useToast } from "../../contexts/ToastContext";

interface InvitationsModalProps {
  open: boolean;
  onClose: () => void;
  user: User | undefined;
}

export function InvitationsModal({ open, onClose, user }: InvitationsModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient()

  const { data: invitations, isLoading: AlreadyInvitedIsLoading, isError: AlreadyInviitedIsError } = useQuery({
    queryKey: ['groups-invited', user?.id],
    queryFn: async () => {
      const response = await movietequeApi.get(`/group/${user?.id}/userInvitedGroups`);
      return response.data as Group[];
    }, enabled: open && !!user?.id
  });

  const acceptInvitation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await movietequeApi.post(`/group/${groupId}/acceptInvitation`, { id: user?.id })
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups-invited', user?.id] });
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

  const rejectInvitation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await movietequeApi.post(`/group/${groupId}/deleteMember`, { id: user?.id })
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups-invited', user?.id] });
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
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          border: `2px solid ${COLORS.primaryLight}`,
          boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
          backgroundColor: COLORS.primaryDark,
          borderRadius: 0,
          maxWidth: '550px',
          width: '100%',
          maxHeight: '80vh'
        }
      }}
    >
      <Box sx={{ p: 3, pb: 2, borderBottom: `2px solid ${COLORS.primaryLight}` }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: '-1px', fontSize: '1.5rem', fontFamily: 'sans-serif', color: COLORS.primaryLight }}>
          {t('invitationsModal.title')}
        </Typography>
      </Box>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3, p: 2 }}>
        {invitations?.length === 0 ? (
          <Typography sx={{ color: COLORS.primaryMid, fontFamily: 'monospace', fontSize: '0.9rem' }}>
            {t('invitationsModal.noInvitationsMsg')}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {invitations?.map((group) => (
              <InvitationRow
                key={group.id}
                group={group}
                onAccept={() => acceptInvitation.mutate(group.id)}
                onReject={() => rejectInvitation.mutate(group.id)}
              />
            ))}
          </Box>
        )}
      </DialogContent>

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
          {t('invitationsModal.closeBtn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- SUB-COMPONENTE PARA LA FILA DE INVITACIÓN ---
function InvitationRow({ group, onAccept, onReject }: { group: Group, onAccept: () => void, onReject: () => void }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        border: `2px solid ${COLORS.primaryMid}`,
        backgroundColor: 'transparent',
        transition: 'border-color 0.1s linear',
        '&:hover': { borderColor: COLORS.primaryLight }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flexGrow: 1, mr: 2 }}>
        <Box
          sx={{
            width: 45,
            height: 45,
            flexShrink: 0,
            border: `2px solid ${COLORS.primaryMid}`,
            backgroundImage: `url(${group.imgUrl || '/assets/placeholder-group.png'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mr: 2
          }}
        />
        <Typography noWrap sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '1.1rem', fontWeight: 'bold' }}>
          {group.name}
        </Typography>
      </Box>

      {/* CONTENEDOR DE BOTONES */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* BOTÓN RECHAZAR (Estilo error) */}
        <Button
          disableRipple
          onClick={onReject}
          sx={{
            ...mechanicalBtnSx,
            p: '4px 8px',
            fontSize: '0.8rem',
            borderColor: '#ff5555',
            color: '#ff5555',
            boxShadow: `2px 2px 0px #aa2222`,
            '&:hover': { backgroundColor: 'rgba(255, 85, 85, 0.1)' },
            '&:active': { transform: 'translate(2px, 2px)', boxShadow: 'none' }
          }}
        >
          {t('invitationsModal.rejectBtn')}
        </Button>

        {/* BOTÓN ACEPTAR (Estilo primario) */}
        <Button
          disableRipple
          onClick={onAccept}
          sx={{
            ...mechanicalBtnSx,
            p: '4px 8px',
            fontSize: '0.8rem',
            borderColor: COLORS.primaryLight,
            color: COLORS.primaryDark,
            backgroundColor: COLORS.primaryLight,
            boxShadow: `2px 2px 0px ${COLORS.accentDark}`,
            '&:hover': { backgroundColor: '#ffffff' },
            '&:active': { transform: 'translate(2px, 2px)', boxShadow: 'none' }
          }}
        >
          {t('invitationsModal.acceptBtn')}
        </Button>
      </Box>
    </Box>
  );
}

// --- ESTILO BASE PARA BOTONES ---
const mechanicalBtnSx = {
  minWidth: 'auto',
  borderRadius: 0,
  border: `2px solid`,
  backgroundColor: 'transparent',
  fontFamily: 'monospace',
  fontWeight: 900,
  transition: 'all 0.05s linear',
};
