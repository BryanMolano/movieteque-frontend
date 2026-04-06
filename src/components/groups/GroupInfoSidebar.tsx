import { Box, Typography, Button, Stack, Dialog, DialogContent, DialogActions } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { COLORS } from '../../theme/AppTheme';
import type { Group } from '../../interfaces/Group';
import { useState } from 'react';
import { movietequeApi } from '../../api/MovietequeApi';
import { useUser } from '../../hooks/useUser';
import { ChangeMemberNicknameModal } from './ChangeNicknameModal';
import type { Member } from '../../interfaces/Member';
import { EditGroupModal } from './EditGroupModal';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

interface GroupInfoSidebarProps {
  group: Group;
  isAdmin: boolean | undefined;
  currentMember: Member | undefined;
}

const formatTerminalDate = (dateString: string) => {
  if (!dateString) return "??/??/????";
  const datePart = dateString.substring(0, 10);
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
}

export function GroupInfoSidebar({ group, isAdmin, currentMember }: GroupInfoSidebarProps) {
  const rawDate = group.created_at || group.created_at;
  const memberCount = group.members?.length || 0;
  const { data: currentUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const { showToast } = useToast();

  const [isExitGroupModalOpen, setIsExitGroupModalOpen] = useState<boolean>(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      await movietequeApi.delete(`/group/${group.id}/deleteGroup`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      setIsDeleteModalOpen(false);
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error(error);
      alert(t('groupSidebar.deleteError'));
    }
  });

  const exitGroupMutation = useMutation({
    mutationFn: async () => {
      await movietequeApi.post(`/group/${group.id}/exitGroup`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      showToast(t('groupSidebar.exitSuccess', '[OK] SALIDA_EXITOSA'), 'success')
      setIsExitGroupModalOpen(false);
      navigate('/dashboard');
    },
    onError: (error) => {
      let serverMessage = t('groupSidebar.systemError', 'ERROR_DE_SISTEMA');
      if (axios.isAxiosError(error)) {
        serverMessage = error.response?.data?.message || serverMessage;
        if (Array.isArray(serverMessage)) serverMessage = serverMessage[0];
      }
      showToast(`[ ERROR ] ${serverMessage}`, 'error');
    }
  })

  const [isCopied, setIsCopied] = useState(false);
  const handleCopyInvite = async () => {
    try {
      const response = await movietequeApi.get(`/group/${group.id}/invitation-link`, {});
      const jwt = response.data;
      const inviteUrl = `${window.location.origin}/login?invite=${jwt}`;
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error al generar enlace", error);
      alert("ERROR_DE_SISTEMA: NO SE PUDO GENERAR EL ENLACE(noaisistema)");
    }
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minWidth: 0,
        overflowX: 'hidden',
        overflowY: { xs: 'visible', md: 'auto' },
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: COLORS.primaryMid, borderRadius: 0 },
        border: `2px solid ${COLORS.primaryMid}`,
        backgroundColor: COLORS.primaryDark,
        p: 2,
        gap: 3,
        boxSizing: 'border-box'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '200px', md: '100%' },
            aspectRatio: '1 / 1',
            border: `2px solid ${COLORS.primaryLight}`,
            boxShadow: `5px 5px 0px ${COLORS.accentDark}`,
            backgroundImage: `url(${group.imgUrl || '/assets/placeholder-group.png'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0,
          }}
        />
      </Box>

      {/* INFORMACIÓN DEL GRUPO */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: 'sans-serif',
            fontWeight: 900,
            fontSize: '2rem',
            letterSpacing: '-1.5px',
            color: COLORS.primaryLight,
            textTransform: 'uppercase',
            lineHeight: 1.1,
            wordBreak: 'break-word'
          }}
        >
          {group.name || t('groupSidebar.nameFallback')}
        </Typography>

        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid }}>
          {`${t('groupSidebar.created')}: ${formatTerminalDate(rawDate)}`}
        </Typography>
        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid }}>
          {`${t('groupSidebar.type')}: ${group.type || t('groupSidebar.public')}`}
        </Typography>
        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontWeight: 'bold' }}>
          {`${t('groupSidebar.members')}: ${memberCount}`}
        </Typography>
        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontWeight: 'bold', wordBreak: 'break-all' }}>
          {`${t('groupSidebar.nickname')}: ${currentMember?.nickname || ''}`}
        </Typography>
      </Box>

      {/* BOTONES DE ACCIÓN (ESTILO TERMINAL) */}
      <Stack spacing={2} sx={{ pb: 2, width: '100%', minWidth: 0 }}>
        <Button disableRipple sx={mechanicalButtonStyle}
          onClick={handleCopyInvite}>
          {isCopied ? t('groupSidebar.inviteCopied') : t('groupSidebar.copyInvite')}
        </Button>
        <Button disableRipple sx={mechanicalButtonStyle}
          onClick={() => setIsModalOpen(true)}
        >
          {t('groupSidebar.changeNickname')}
        </Button>
        <ChangeMemberNicknameModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          groupId={group.id}
        />

        {isAdmin && (
          <Button
            disableRipple sx={mechanicalButtonStyle}
            onClick={() => setIsEditModalOpen(true)}
          >
            {t('groupSidebar.editGroup')}
          </Button>
        )}
        <EditGroupModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          group={group}
        />

        {/* BOTÓN DE ELIMINAR (SÓLO ADMIN) */}
        {isAdmin && (
          <Button
            disableRipple
            onClick={() => setIsDeleteModalOpen(true)}
            sx={{
              ...mechanicalButtonStyle,
              mt: 2,
              border: `2px solid ${COLORS.primaryMid}`,
              color: COLORS.primaryMid,
              boxShadow: `3px 3px 0px ${COLORS.accentDark}`,
              fontSize: '0.8rem',
              p: '8px',
              '&:hover': {
                backgroundColor: COLORS.primaryDark,
                color: COLORS.primaryLight,
                borderColor: COLORS.primaryLight,
              }
            }}
          >
            {t('groupSidebar.deleteGroup')}
          </Button>
        )}

        {/* BOTÓN DE SALIR (SÓLO USER NO ADMIN) */}
        {!isAdmin && (
          <Button
            disableRipple
            onClick={() => setIsExitGroupModalOpen(true)}
            sx={{
              ...mechanicalButtonStyle,
              mt: 2,
              border: `2px solid #ffaa00`,
              color: '#ffaa00',
              boxShadow: `3px 3px 0px ${COLORS.accentDark}`,
              fontSize: '0.8rem',
              p: '8px',
              '&:hover': {
                backgroundColor: COLORS.primaryDark,
                color: '#ffcc00',
                borderColor: '#ffcc00',
              }
            }}
          >
            {t('groupSidebar.exitGroup', '[-> SALIR DEL GRUPO ]')}
          </Button>
        )}
      </Stack>

      {/* Modal de Confirmación de Eliminación Brutalista */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        PaperProps={{
          sx: {
            border: `2px solid #ff5555`,
            boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
            backgroundColor: COLORS.primaryDark,
          }
        }}
      >
        <Box sx={{ p: 3, pb: 1, borderBottom: `2px solid #ff5555` }}>
          <Typography sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '1.5rem', fontFamily: 'sans-serif', color: '#ff5555' }}>
            {t('groupSidebar.deleteModalTitle')}
          </Typography>
        </Box>

        <DialogContent sx={{ pt: 4, pb: 4 }}>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid }}>
            {t('groupSidebar.deleteModalBody')}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
          <Button
            onClick={() => setIsDeleteModalOpen(false)}
            disableRipple
            sx={{
              ...mechanicalButtonStyle,
              border: `2px solid ${COLORS.primaryMid}`,
              boxShadow: `4px 4px 0px ${COLORS.accentDark}`,
              color: COLORS.primaryMid,
              p: '8px 16px'
            }}
          >
            {t('groupSidebar.cancel')}
          </Button>
          <Button
            onClick={() => deleteGroupMutation.mutate()}
            disabled={deleteGroupMutation.isPending}
            disableRipple
            sx={{
              ...mechanicalButtonStyle,
              bgcolor: '#ff5555',
              color: COLORS.primaryDark,
              borderColor: '#ff5555',
              boxShadow: `4px 4px 0px ${COLORS.accentDark}`,
              p: '8px 16px',
              '&:hover': { bgcolor: '#ff7777' }
            }}
          >
            {deleteGroupMutation.isPending ? t('groupSidebar.deleting') : t('groupSidebar.confirmDelete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE CONFIRMACIÓN DE SALIDA */}
      <Dialog
        open={isExitGroupModalOpen}
        onClose={() => setIsExitGroupModalOpen(false)}
        PaperProps={{
          sx: {
            border: `2px solid #ffaa00`,
            boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
            backgroundColor: COLORS.primaryDark,
          }
        }}
      >
        <Box sx={{ p: 3, pb: 1, borderBottom: `2px solid #ffaa00` }}>
          <Typography sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '1.5rem', fontFamily: 'sans-serif', color: '#ffaa00' }}>
            {t('groupSidebar.exitModalTitle', 'ADVERTENCIA_DE_SALIDA')}
          </Typography>
        </Box>

        <DialogContent sx={{ pt: 4, pb: 4 }}>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid }}>
            {t('groupSidebar.exitModalBody', 'Si sales del grupo, tus recomendaciones e interacciones se borrarán, pero tus mensajes seguirán vigentes. ¿Estás seguro de querer salir del grupo?')}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
          <Button
            onClick={() => setIsExitGroupModalOpen(false)}
            disableRipple
            sx={{
              ...mechanicalButtonStyle,
              border: `2px solid ${COLORS.primaryMid}`,
              boxShadow: `4px 4px 0px ${COLORS.accentDark}`,
              color: COLORS.primaryMid,
              p: '8px 16px'
            }}
          >
            {t('groupSidebar.cancel')}
          </Button>
          <Button
            onClick={() => exitGroupMutation.mutate()}
            disabled={exitGroupMutation.isPending}
            disableRipple
            sx={{
              ...mechanicalButtonStyle,
              bgcolor: '#ffaa00',
              color: COLORS.primaryDark,
              borderColor: '#ffaa00',
              boxShadow: `4px 4px 0px ${COLORS.accentDark}`,
              p: '8px 16px',
              '&:hover': { bgcolor: '#ffcc00' }
            }}
          >
            {exitGroupMutation.isPending ? t('groupSidebar.exiting', 'SALIENDO...') : t('groupSidebar.confirmExit', '[ EJECUTAR_SALIDA ]')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
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
  whiteSpace: 'normal', // Añadido para permitir que el texto de los botones salte de línea si es necesario en celulares estrechos
  '&:hover': {
    backgroundColor: COLORS.primaryDark,
    filter: 'brightness(1.2)',
  },
  '&:active': {
    transform: 'translate(4px, 4px)',
    boxShadow: `0px 0px 0px transparent`,
  },
};
