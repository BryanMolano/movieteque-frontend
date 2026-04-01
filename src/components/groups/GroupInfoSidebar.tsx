// --- INICIO CAMBIOS: Importaciones necesarias ---
import { Box, Typography, Button, Stack, Dialog, DialogContent, DialogActions } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
// --- FIN CAMBIOS ---

import { COLORS } from '../../theme/AppTheme'; // Ajusta la ruta según tu estructura
import type { Group } from '../../interfaces/Group'; // Ajusta la ruta
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

  // --- INICIO CAMBIO: Corrección de mayúscula inicial en el estado para respetar camelCase ---
  const [isExitGroupModalOpen, setIsExitGroupModalOpen] = useState<boolean>(false);
  // --- FIN CAMBIO ---

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
      showToast('[OK]', 'success')
      setIsExitGroupModalOpen(false);
      navigate('/dashboard');
    },
    onError: (error) => {
      let serverMessage = t('recommendationModal.systemError');
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
        minHeight: '100%',
        border: `2px solid ${COLORS.primaryMid}`,
        backgroundColor: COLORS.primaryDark,
        p: 2,
        gap: 3
      }}
    >
      {/* IMAGEN DEL GRUPO */}
      <Box
        sx={{
          width: '100%',
          aspectRatio: '1 / 1',
          border: `2px solid ${COLORS.primaryLight}`,
          boxShadow: `5px 5px 0px ${COLORS.accentDark}`,
          backgroundImage: `url(${group.imgUrl || 'https://via.placeholder.com/600x600/0B2833/CBD3D6?text=NO+IMAGE'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* INFORMACIÓN DEL GRUPO */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          sx={{
            fontFamily: 'sans-serif',
            fontWeight: 900,
            fontSize: '2rem',
            letterSpacing: '-1.5px',
            color: COLORS.primaryLight,
            textTransform: 'uppercase',
            lineHeight: 1.1
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
        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontWeight: 'bold' }}>
          {`${t('groupSidebar.nickname')}: ${currentMember?.nickname || ''}`}
        </Typography>
      </Box>

      {/* BOTONES DE ACCIÓN (ESTILO TERMINAL) */}
      <Stack spacing={2}>
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
      </Stack>

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
            mt: 4,
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

      {/* --- INICIO CAMBIOS: BOTÓN DE SALIR (SÓLO USER NO ADMIN) --- */}
      {!isAdmin && ( // Cambio: Agregado condicional para usuarios normales
        <Button // Cambio: Agregado botón de salir
          disableRipple // Cambio: Desactiva efecto onda
          onClick={() => setIsExitGroupModalOpen(true)} // Cambio: Abre el modal de salida
          sx={{ // Cambio: Estilos brutalistas
            ...mechanicalButtonStyle, // Cambio: Herencia base
            mt: 4, // Cambio: Margen top para separar
            border: `2px solid #ffaa00`, // Cambio: Borde naranja advertencia
            color: '#ffaa00', // Cambio: Texto naranja advertencia
            boxShadow: `3px 3px 0px ${COLORS.accentDark}`, // Cambio: Sombra consistente
            fontSize: '0.8rem', // Cambio: Fuente pequeña
            p: '8px', // Cambio: Padding compacto
            '&:hover': { // Cambio: Hover state
              backgroundColor: COLORS.primaryDark, // Cambio: Mantiene fondo
              color: '#ffcc00', // Cambio: Naranja más brillante
              borderColor: '#ffcc00', // Cambio: Borde más brillante
            }
          }}
        >
          {t('groupSidebar.exitGroup', '[-> SALIR DEL GRUPO')} {/* Cambio: Texto con llave i18n */}
        </Button> // Cambio: Cierre botón
      )}
      {/* --- FIN CAMBIOS --- */}

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

      {/* --- INICIO CAMBIOS: MODAL DE CONFIRMACIÓN DE SALIDA --- */}
      <Dialog // Cambio: Elemento modal para la salida
        open={isExitGroupModalOpen} // Cambio: Ligado al estado corregido
        onClose={() => setIsExitGroupModalOpen(false)} // Cambio: Cierra el modal
        PaperProps={{ // Cambio: Estilos del contenedor del modal
          sx: { // Cambio: Estilos SX
            border: `2px solid #ffaa00`, // Cambio: Borde naranja advertencia
            boxShadow: `8px 8px 0px ${COLORS.accentDark}`, // Cambio: Sombra brutalista
            backgroundColor: COLORS.primaryDark, // Cambio: Fondo oscuro
          }
        }}
      >
        <Box sx={{ p: 3, pb: 1, borderBottom: `2px solid #ffaa00` }}> {/* Cambio: Header del modal */}
          <Typography sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '1.5rem', fontFamily: 'sans-serif', color: '#ffaa00' }}> {/* Cambio: Título */}
            {t('groupSidebar.exitModalTitle', 'ADVERTENCIA_DE_SALIDA')} {/* Cambio: Texto título modal */}
          </Typography>
        </Box>

        <DialogContent sx={{ pt: 4, pb: 4 }}> {/* Cambio: Contenedor texto */}
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid }}> {/* Cambio: Estilo texto */}
            {t('groupSidebar.exitModalBody', 'Si sales del grupo, tus recomendaciones e interacciones se borrarán, pero tus mensajes seguirán vigentes. ¿Estás seguro de querer salir del grupo?')} {/* Cambio: Texto solicitado exacto */}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}> {/* Cambio: Contenedor de botones */}
          <Button // Cambio: Botón cancelar
            onClick={() => setIsExitGroupModalOpen(false)} // Cambio: Cierra modal
            disableRipple // Cambio: Sin efecto
            sx={{ // Cambio: Estilos
              ...mechanicalButtonStyle, // Cambio: Base
              border: `2px solid ${COLORS.primaryMid}`, // Cambio: Borde neutro
              boxShadow: `4px 4px 0px ${COLORS.accentDark}`, // Cambio: Sombra
              color: COLORS.primaryMid, // Cambio: Texto neutro
              p: '8px 16px' // Cambio: Padding
            }}
          >
            {t('groupSidebar.cancel')} {/* Cambio: Texto cancelar */}
          </Button>
          <Button // Cambio: Botón confirmar
            onClick={() => exitGroupMutation.mutate()} // Cambio: Ejecuta mutación
            disabled={exitGroupMutation.isPending} // Cambio: Deshabilita si está cargando
            disableRipple // Cambio: Sin efecto
            sx={{ // Cambio: Estilos
              ...mechanicalButtonStyle, // Cambio: Base
              bgcolor: '#ffaa00', // Cambio: Fondo advertencia
              color: COLORS.primaryDark, // Cambio: Texto oscuro
              borderColor: '#ffaa00', // Cambio: Borde
              boxShadow: `4px 4px 0px ${COLORS.accentDark}`, // Cambio: Sombra
              p: '8px 16px', // Cambio: Padding
              '&:hover': { bgcolor: '#ffcc00' } // Cambio: Hover advertencia
            }}
          >
            {exitGroupMutation.isPending ? t('groupSidebar.exiting', 'SALIENDO...') : t('groupSidebar.confirmExit', '[ EJECUTAR_SALIDA ]')} {/* Cambio: Texto dinámico */}
          </Button>
        </DialogActions>
      </Dialog>
      {/* --- FIN CAMBIOS --- */}

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
  justifyContent: 'flex-start', // Texto alineado a la izquierda para toque de consola
  '&:hover': {
    backgroundColor: COLORS.primaryDark,
    filter: 'brightness(1.2)',
  },
  '&:active': {
    transform: 'translate(4px, 4px)',
    boxShadow: `0px 0px 0px transparent`,
  },
};
