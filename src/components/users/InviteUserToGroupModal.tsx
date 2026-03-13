import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import { COLORS } from "../../theme/AppTheme"; // Ajusta la ruta
import type { Group } from "../../interfaces/Group"; // Ajusta la ruta
import { useTranslation } from "react-i18next";
import type { User } from "../../interfaces/User";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import type { id } from "zod/v4/locales";
import { movietequeApi } from "../../api/MovietequeApi";
import { useToast } from "../../contexts/ToastContext";
import axios from "axios";
import { url } from "zod";

// Interfaz para las props del modal
interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: User | undefined;
  invitedUser: User | undefined;
}

export function InviteUserModal({ open, onClose, currentUser, invitedUser }: InviteUserModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient()

  const { data: groupsToInvite, isLoading, isError } = useQuery({
    queryKey: ['groups', currentUser?.id],
    queryFn: async () => {
      const response = await movietequeApi.get(`/group/${currentUser?.id}/userGroups`);
      return response.data as Group[];
    }, enabled: open && !!currentUser?.id
  });
  const { data: groupsAlreadyMember, isLoading: InvitedUserIsLoading, isError: InvitedUserIsError } = useQuery({
    queryKey: ['groups', invitedUser?.id],
    queryFn: async () => {
      const response = await movietequeApi.get(`/group/${invitedUser?.id}/userGroups`);
      return response.data as Group[];
    }, enabled: open && !!invitedUser?.id
  });
  const { data: groupsAlreadyInvited, isLoading: AlreadyInvitedIsLoading, isError: AlreadyInviitedIsError } = useQuery({
    queryKey: ['groups-invited', invitedUser?.id],
    queryFn: async () => {
      const response = await movietequeApi.get(`/group/${invitedUser?.id}/userInvitedGroups`);
      return response.data as Group[];
    }, enabled: open && !!invitedUser?.id
  });



  const inviteUser = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await movietequeApi.post(`/group/${groupId}/invite`, { id: invitedUser?.id })
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', invitedUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['groups', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['groups-invited', invitedUser?.id] });
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
          border: `2px solid ${COLORS.primaryLight
            }`,
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
      <Box sx={{ p: 3, pb: 2, borderBottom: `2px solid ${COLORS.primaryLight}` }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: '-1px', fontSize: '1.5rem', fontFamily: 'sans-serif', color: COLORS.primaryLight }}>
          {t('inviteModal.title')}
        </Typography>
      </Box>

      {/* CONTENIDO DEL MODAL (LISTA DE GRUPOS) */}
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3, p: 2 }}>

        {groupsToInvite?.length === 0 ? (
          <Typography sx={{ color: COLORS.primaryMid, fontFamily: 'monospace', fontSize: '0.9rem' }}>
            {t('inviteModal.noGroupsMsg')}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {groupsToInvite?.map((group) => {
              const isAlreadyMember = groupsAlreadyMember?.some(gm => gm.id === group.id) ?? false;
              const isAlreadyInvited = groupsAlreadyInvited?.some(gm => gm.id === group.id) ?? false;
              return (
                <GroupRow
                  key={group.id}
                  group={group}
                  isAlreadyMember={isAlreadyMember}
                  isAlreadyInvited={isAlreadyInvited}
                  onInvite={() => {
                    inviteUser.mutate(group?.id)
                  }}
                />
              );
            })}
          </Box>
        )}
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
          {t('inviteModal.closeBtn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- SUB-COMPONENTE PARA LA FILA DEL GRUPO ---
function GroupRow({ group, isAlreadyMember, isAlreadyInvited, onInvite }: { group: Group, isAlreadyMember: boolean, isAlreadyInvited: boolean, onInvite: () => void }) {
  const { t } = useTranslation();

  // Agrupamos la condición para que si ya es miembro o ya está invitado, el botón se desactive y cambie el estilo
  const isDisabled = isAlreadyMember || isAlreadyInvited;

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
        '&:hover': { borderColor: isDisabled ? COLORS.primaryMid : COLORS.primaryLight }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flexGrow: 1, mr: 2 }}>
        {/* Foto del grupo cuadrada */}
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            border: `2px solid ${COLORS.primaryMid}`,
            backgroundImage: `url(${group.imgUrl || 'https://via.placeholder.com/40/0B2833/CBD3D6?text=G'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mr: 2,
            opacity: isDisabled ? 0.5 : 1 // Efecto visual desactivado
          }}
        />
        {/* Nombre del grupo */}
        <Typography noWrap sx={{
          fontFamily: 'monospace',
          color: isDisabled ? COLORS.primaryMid : COLORS.primaryLight,
          fontSize: '1rem',
          fontWeight: 'bold'
        }}>
          {group.name}
        </Typography>
      </Box>

      {/* Botón de Acción (Invitar / Ya es miembro / Ya está invitado) */}
      <Button
        disableRipple
        onClick={onInvite}
        disabled={isDisabled}
        sx={{
          minWidth: 'auto',
          p: '4px 8px',
          borderRadius: 0,
          fontFamily: 'monospace',
          fontWeight: 900,
          fontSize: '0.8rem',
          transition: 'all 0.05s linear',
          border: `2px solid ${COLORS.primaryLight}`,
          backgroundColor: 'transparent',
          color: COLORS.primaryLight,
          boxShadow: `2px 2px 0px ${COLORS.accentDark}`,
          '&:hover': {
            backgroundColor: COLORS.primaryLight,
            color: COLORS.primaryDark,
          },
          '&:active': {
            transform: 'translate(2px, 2px)',
            boxShadow: `0px 0px 0px transparent`,
          },
          '&.Mui-disabled': {
            borderColor: COLORS.primaryMid,
            color: COLORS.primaryMid,
            boxShadow: 'none',
            backgroundColor: 'rgba(203, 211, 214, 0.05)'
          }
        }}
      >
        {isAlreadyMember
          ? t('inviteModal.alreadyMemberBtn')
          : isAlreadyInvited
            ? t('inviteModal.alreadyInvitedBtn')
            : t('inviteModal.inviteBtn')
        }
      </Button>
    </Box>
  );
}
// --- ESTILO BASE PARA BOTONES ---
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
