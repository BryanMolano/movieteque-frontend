import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { movietequeApi } from "../api/MovietequeApi";
import type { User } from "../interfaces/User";
import { Box, Button, Typography } from "@mui/material";
import { COLORS } from "../theme/AppTheme";
import type { Group } from "../interfaces/Group";
import { useToast } from "../contexts/ToastContext";
import axios from "axios";
import { useState } from "react";
import { EditUserProfile } from '../components/users/EditUserProfile';
import { useTranslation } from "react-i18next";
import { InviteUserModal } from "../components/users/InviteUserToGroupModal";

const formatTerminalDate = (isoString?: string) => {
  if (!isoString) return 'DESCONOCIDO';
  try {
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return 'ERROR_DE_SISTEMA';
  }
};
export function UserProfile() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState<boolean>(false)
  const { showToast } = useToast();
  const queryClient = useQueryClient()
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: currentUser } = useUser();
  let isCurrentUserProfile: boolean = false;
  if (id === currentUser?.id) {
    isCurrentUserProfile = true;
  }

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await movietequeApi.post(`/group/${groupId}/joinPublicGroup`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-groups-user', id] })
      showToast(t('userProfile.joinSuccess', '[OK] TE HAS UNIDO AL GRUPO'), 'success');
      // showToast('[OK] TE HAS UNIDO AL GRUPO', 'success')
    },
    onError: (error) => {
      let serverMessage = t('userProfile.systemError')
      if (axios.isAxiosError(error)) {
        serverMessage = error.response?.data?.message || serverMessage;
        if (Array.isArray(serverMessage)) serverMessage = serverMessage[0];
      }
      showToast(`[ ERROR ] ${serverMessage}`, 'error');
    }
  });

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await movietequeApi.get(`/user/${id}`);
      return response.data as User;
    }
  });
  const { data: groups } = useQuery({
    queryKey: ['public-groups-user', id],
    queryFn: async () => {
      const response = await movietequeApi.get(`/group/${id}/get-public-groups`);
      return response.data as Group[];
    }
  });

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.primaryDark, p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color={COLORS.primaryLight} sx={{ fontFamily: 'monospace', fontSize: '2rem' }}>
          {/* {`>>> CARGANDO_USER..._`} */}
          {t('userProfile.loadingUser')}
        </Typography>
      </Box>
    );
  }
  if (isError) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.primaryDark, p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color={COLORS.primaryLight} sx={{ fontFamily: 'monospace', fontSize: '2rem' }}>
          {`>>> ERROR_404: NOT FOUND..._`}
        </Typography>
      </Box>
    );
  }
  const handleJoinGroup = (groupId: string) => { console.log('universe al grupo', groupId) }
  const goToGroup = (groupId: string) => {

  }
  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: COLORS.primaryDark,
      p: { xs: 2, md: 4 },
      display: 'flex',
      justifyContent: 'center'
    }}>

      {/* CONTENEDOR PRINCIPAL: Limitamos el ancho para que no se estire infinito en PC */}
      <Box sx={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 4 }}>

        {/* 1. TARJETA DE CABECERA (Foto, Username, Fecha y Botón Editar) */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
          p: 3,
          backgroundColor: COLORS.primaryDark,
          border: `2px solid ${COLORS.primaryLight}`,
          boxShadow: `6px 6px 0px ${COLORS.accentMid}`, // Sombra brutalista cálida
        }}>

          {/* FOTO */}
          <Box
            component="img"
            src={user?.imgUrl || 'https://via.placeholder.com/150'} // Cambia profileImage por tu variable real
            alt="Profile"
            sx={{
              width: { xs: '100%', sm: 150 },
              height: 150,
              objectFit: 'cover',
              border: `2px solid ${COLORS.primaryMid}`,
              backgroundColor: 'rgba(0,0,0,0.5)' // Por si la imagen tarda en cargar
            }}
          />

          {/* INFO Y BOTÓN */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography color={COLORS.primaryLight} sx={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-1.5px', textTransform: 'uppercase' }}>
              {user?.username}
            </Typography>
            <Typography color={COLORS.primaryMid} sx={{ mb: 2 }}>
              {/* {`> MIEMBRO_DES{DE: ${formatTerminalDate(user?.createdAt)}`} */}
              {`> ${t('userProfile.memberSince', 'MIEMBRO_DESDE')}: ${formatTerminalDate(user?.createdAt)}`}
            </Typography>

            {/* BOTÓN EDITAR (Condicional) */}
            {isCurrentUserProfile && (
              <Button
                onClick={() => setIsModalOpen(true)}
                disableRipple
                // onClick={handleEditProfile} // Tu función aquí
                sx={{
                  alignSelf: 'flex-start',
                  color: COLORS.primaryLight,
                  backgroundColor: 'transparent',
                  border: `2px solid ${COLORS.primaryLight}`,
                  boxShadow: `3px 3px 0px ${COLORS.accentMid}`,
                  '&:hover': { backgroundColor: 'rgba(203, 211, 214, 0.1)' },
                  '&:active': { transform: 'translate(3px, 3px)', boxShadow: 'none' }
                }}
              >
                {/* [ EDITAR PERFIL ] */}
                {t('userProfile.editProfileBtn', '[ EDITAR PERFIL ]')}
              </Button>
            )}
            <EditUserProfile
              key={`${currentUser!.id}-${isModalOpen}`}
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              user={currentUser}
            />



            {/* BOTÓN INVITAR A GRUPO (Solo si NO es el usuario actual) */}
            {!isCurrentUserProfile && currentUser && (
              <Button
                disableRipple
                onClick={() => setIsInviteUserModalOpen(true)}
                sx={{
                  alignSelf: 'flex-start',
                  color: COLORS.primaryDark,
                  backgroundColor: COLORS.primaryLight,
                  border: `2px solid ${COLORS.primaryLight}`,
                  boxShadow: `3px 3px 0px ${COLORS.accentMid}`,
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  '&:hover': { backgroundColor: '#ffffff' },
                  '&:active': { transform: 'translate(3px, 3px)', boxShadow: 'none' }
                }}
              >
                {t('userProfile.inviteToGroupBtn', '[ INVITAR A GRUPO ]')}
              </Button>
            )}
            <InviteUserModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              user={currentUser}
              invitedUser={user}
            />
          </Box>
        </Box>

        {/* 2. BLOQUE DE DESCRIPCIÓN */}
        <Box sx={{
          p: 3,
          border: `2px solid ${COLORS.primaryMid}`,
          backgroundColor: 'transparent'
        }}>
          <Typography color={COLORS.primaryLight} sx={{ fontWeight: 900, mb: 2 }}>
            {/* [ BIO_DEL_USUARIO ] */}
            {t('userProfile.bioTitle', '[ BIO_DEL_USUARIO ]')}
          </Typography>
          <Typography color={COLORS.primaryLight} sx={{ whiteSpace: 'pre-line' }}>
            {user?.description || t('userProfile.noBioError', '> ERROR: USUARIO_SIN_DESCRIPCIÓN.')}
            {/* {user?.description || '> ERROR: USUARIO_SIN_DESCRIPCIÓN.'} */}
          </Typography>
        </Box>

        {/* 3. LISTADO DE GRUPOS */}
        <Box>
          <Typography color={COLORS.primaryLight} sx={{ fontWeight: 900, mb: 2, letterSpacing: '-1px' }}>
            {/* {`>>> GRUPOS_PÚBLICOS [${groups?.length || 0}]`} */}
            {`>>> ${t('userProfile.publicGroupsTitle', 'GRUPOS_PÚBLICOS')} [${groups?.length || 0}]`}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {groups?.map((group) => {

              const isMember = group.members?.some(m => m.user.id === currentUser?.id);
              return (
                <Box
                  key={group.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    border: `2px solid ${COLORS.primaryMid}`,
                    backgroundColor: COLORS.primaryDark,
                    transition: 'all 0.1s linear',
                    '&:hover': {
                      borderColor: COLORS.primaryLight,
                      backgroundColor: 'rgba(203, 211, 214, 0.05)'
                    }
                  }}
                >
                  {/* Imagen del grupo pequeña */}
                  <Box
                    component="img"
                    src={group.imgUrl || 'https://via.placeholder.com/40'} // Cambia por tu variable real
                    sx={{ width: 40, height: 40, border: `1px solid ${COLORS.primaryMid}`, mr: 2, objectFit: 'cover' }}
                  />

                  {/* Nombre del grupo */}
                  <Typography color={COLORS.primaryLight} sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    {group.name}
                  </Typography>

                  {/* Botón Unirse (Mecánico y pequeño) */}
                  {currentUser && !isMember && <Button
                    disableRipple
                    onClick={() => joinGroupMutation.mutate(group.id)} // Tu función aquí
                    disabled={joinGroupMutation.isPending}
                    sx={{
                      minWidth: 'auto',
                      p: '4px 8px',
                      color: COLORS.primaryDark,
                      backgroundColor: COLORS.primaryLight,
                      border: `2px solid ${COLORS.primaryLight}`,
                      boxShadow: `2px 2px 0px ${COLORS.accentMid}`,
                      fontSize: '0.85rem',
                      opacity: joinGroupMutation.isPending ? 0.5 : 1,
                      '&:active': { transform: 'translate(2px, 2px)', boxShadow: 'none' }
                    }}
                  >
                    {/* {joinGroupMutation.isPending ? 'UNIENDO...' : 'UNIRSE'} */}
                    {joinGroupMutation.isPending ? t('userProfile.joiningBtn', 'UNIENDO...') : t('userProfile.joinBtn', 'UNIRSE')}
                  </Button>}

                  {currentUser && isMember && <Button
                    disableRipple
                    onClick={() => navigate(`/groups/${group.id}`)}
                    sx={{
                      minWidth: 'auto',
                      p: '4px 8px',
                      color: COLORS.primaryDark,
                      backgroundColor: COLORS.primaryLight,
                      border: `2px solid ${COLORS.primaryLight}`,
                      boxShadow: `2px 2px 0px ${COLORS.accentMid}`,
                      fontSize: '0.85rem',
                      '&:active': { transform: 'translate(2px, 2px)', boxShadow: 'none' }
                    }}
                  >
                    {t('userProfile.goToGroupBtn', 'IR A GRUPO')}
                    {/* IR A GRUPO */}
                  </Button>}
                </Box>
              )
            })}

            {/* Mensaje si no hay grupos */}
            {groups?.length === 0 && (
              <Typography color={COLORS.primaryMid}>
                {t('userProfile.noGroupsMsg', '> ESTE_USUARIO_NO_PERTENECE_A_NINGÚN_GRUPO_PÚBLICO.')}
                {/* {`> ESTE_USUARIO_NO_PERTENECE_A_NINGÚN_GRUPO_PÚBLICO.`} */}
              </Typography>
            )}
          </Box>
        </Box>

      </Box>
    </Box>
  );
}

