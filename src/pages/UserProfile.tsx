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
import { formatTerminalDate } from "../utils/DateUtils";
import { VerifyEmailModal } from "../components/users/VerifyEmailModal";
// import { VerifyEmailModal } from '../components/users/VerifyEmailModal';


export function UserProfile() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState<boolean>(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false); // Nuevo estado

  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: currentUser } = useUser();
  const isCurrentUserProfile = id === currentUser?.id;

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await movietequeApi.post(`/group/${groupId}/joinPublicGroup`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-groups-user', id] });
      showToast(t('userProfile.joinSuccess', '[OK] TE HAS UNIDO AL GRUPO'), 'success');
    },
    onError: (error) => {
      let serverMessage = t('userProfile.systemError', 'Error de sistema');
      if (axios.isAxiosError(error)) {
        serverMessage = error.response?.data?.message || serverMessage;
        if (Array.isArray(serverMessage)) serverMessage = serverMessage[0];
      }
      showToast(`[ ERROR ] ${serverMessage}`, 'error');
    }
  });

  const toggleNotificationsMutation = useMutation({
    mutationFn: async () => {
      const response = await movietequeApi.post(`/user/activate-desactivate-notifications`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      showToast(t('userProfile.notifSuccess', '[OK] NOTIFICACIONES ACTUALIZADAS'), 'success');
    },
    onError: () => {
      showToast(t('userProfile.systemError', '[ERROR DEL SERVIDOR]'), 'error');
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
          {t('userProfile.loadingUser', 'CARGANDO...')}
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

  return (
    <Box sx={{
      minHeight: '100vh', backgroundColor: COLORS.primaryDark,
      p: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center'
    }}>

      <Box sx={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 4 }}>

        {/* 1. CABECERA DE PERFIL */}
        <Box sx={{
          display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, p: 3,
          backgroundColor: COLORS.primaryDark, border: `2px solid ${COLORS.primaryLight}`,
          boxShadow: `6px 6px 0px ${COLORS.accentMid}`,
        }}>
          <Box
            component="img"
            src={user?.imgUrl || '/assets/placeholder-avatar.png'}
            alt="Profile"
            sx={{
              width: { xs: '100%', sm: 150 }, height: 150, objectFit: 'cover',
              border: `2px solid ${COLORS.primaryMid}`, backgroundColor: 'rgba(0,0,0,0.5)'
            }}
          />

          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography color={COLORS.primaryLight} sx={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-1.5px', textTransform: 'uppercase' }}>
              {user?.username}
            </Typography>
            <Typography color={COLORS.primaryMid} sx={{ mb: 2 }}>
              {`> ${t('userProfile.memberSince', 'MIEMBRO_DESDE')}: ${formatTerminalDate(user?.createdAt)}`}
            </Typography>

            {isCurrentUserProfile && (
              <Button
                onClick={() => setIsModalOpen(true)}
                disableRipple
                sx={{
                  alignSelf: 'flex-start', color: COLORS.primaryLight, backgroundColor: 'transparent',
                  border: `2px solid ${COLORS.primaryLight}`, boxShadow: `3px 3px 0px ${COLORS.accentMid}`,
                  '&:hover': { backgroundColor: 'rgba(203, 211, 214, 0.1)' },
                  '&:active': { transform: 'translate(3px, 3px)', boxShadow: 'none' }
                }}
              >
                {t('userProfile.editProfileBtn', '[ EDITAR PERFIL ]')}
              </Button>
            )}

            <EditUserProfile
              key={`${currentUser?.id}-${isModalOpen}`}
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              user={currentUser}
            />

            <VerifyEmailModal
              open={isVerificationModalOpen}
              onClose={() => setIsVerificationModalOpen(false)}
              user={currentUser}
            />

            {!isCurrentUserProfile && currentUser && (
              <Button
                disableRipple
                onClick={() => setIsInviteUserModalOpen(true)}
                sx={{
                  alignSelf: 'flex-start', color: COLORS.primaryDark, backgroundColor: COLORS.primaryLight,
                  border: `2px solid ${COLORS.primaryLight}`, boxShadow: `3px 3px 0px ${COLORS.accentMid}`,
                  fontWeight: 900, fontFamily: 'monospace',
                  '&:hover': { backgroundColor: '#ffffff' },
                  '&:active': { transform: 'translate(3px, 3px)', boxShadow: 'none' }
                }}
              >
                {t('userProfile.inviteToGroupBtn', '[ INVITAR A GRUPO ]')}
              </Button>
            )}

            <InviteUserModal
              open={isInviteUserModalOpen}
              onClose={() => setIsInviteUserModalOpen(false)}
              currentUser={currentUser}
              invitedUser={user}
            />
          </Box>
        </Box>

        {/* 2. BLOQUE DE DESCRIPCIÓN */}
        <Box sx={{ p: 3, border: `2px solid ${COLORS.primaryMid}`, backgroundColor: 'transparent' }}>
          <Typography color={COLORS.primaryLight} sx={{ fontWeight: 900, mb: 2 }}>
            {t('userProfile.bioTitle', '[ BIO_DEL_USUARIO ]')}
          </Typography>
          <Typography color={COLORS.primaryLight} sx={{ whiteSpace: 'pre-line' }}>
            {user?.description || t('userProfile.noBioError', '> ERROR: USUARIO_SIN_DESCRIPCIÓN.')}
          </Typography>
        </Box>

        {/* --- NUEVO: 2.5 BLOQUE DE CONFIGURACIÓN (SOLO USUARIO ACTUAL) --- */}
        {isCurrentUserProfile && currentUser && (
          <Box sx={{ p: 3, border: `2px dashed ${COLORS.primaryMid}`, backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <Typography color={COLORS.primaryLight} sx={{ fontWeight: 900, mb: 3, letterSpacing: '-1px' }}>
              {t('userProfile.settingsTitle', '>>> CONFIGURACIÓN_DE_CUENTA')}
            </Typography>

            {/* Si NO está verificado: Mostrar Botón de Verificar */}
            {!currentUser.isEmailVerified ? (
              <Box>
                <Typography color="#f39c12" sx={{ mb: 1, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  {t('userProfile.emailNotVerifiedWarn', '[ ADVERTENCIA ]: CORREO NO VERIFICADO. LAS NOTIFICACIONES ESTÁN DESHABILITADAS.')}
                </Typography>
                <Button
                  disableRipple
                  onClick={() => setIsVerificationModalOpen(true)}
                  sx={{
                    color: COLORS.primaryDark, backgroundColor: '#f39c12',
                    border: `2px solid #f39c12`, boxShadow: `3px 3px 0px #b9770e`,
                    fontWeight: 900, fontFamily: 'monospace',
                    '&:hover': { backgroundColor: '#f1c40f' },
                    '&:active': { transform: 'translate(3px, 3px)', boxShadow: 'none' }
                  }}
                >
                  {t('userProfile.verifyEmailBtn', '[ VERIFICAR CORREO ]')}
                </Button>
              </Box>
            ) : (
              /* Si SÍ está verificado: Mostrar Switch de Notificaciones */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography color={COLORS.primaryLight} sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  {t('userProfile.notificationsLabel', 'NOTIFICACIONES POR CORREO:')}
                </Typography>
                <BrutalistToggle
                  active={!!currentUser.isNotificationEnable}
                  onToggle={() => toggleNotificationsMutation.mutate()}
                  disabled={toggleNotificationsMutation.isPending}
                />
              </Box>
            )}
          </Box>
        )}

        {/* 3. LISTADO DE GRUPOS */}
        <Box>
          <Typography color={COLORS.primaryLight} sx={{ fontWeight: 900, mb: 2, letterSpacing: '-1px' }}>
            {`>>> ${t('userProfile.publicGroupsTitle', 'GRUPOS_PÚBLICOS')} [${groups?.length || 0}]`}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {groups?.map((group) => {
              const isMember = group.members?.some(m => m.user.id === currentUser?.id);
              return (
                <Box
                  key={group.id}
                  sx={{
                    display: 'flex', alignItems: 'center', p: 1.5,
                    border: `2px solid ${COLORS.primaryMid}`, backgroundColor: COLORS.primaryDark,
                    transition: 'all 0.1s linear',
                    '&:hover': { borderColor: COLORS.primaryLight, backgroundColor: 'rgba(203, 211, 214, 0.05)' }
                  }}
                >
                  <Box
                    component="img"
                    src={group.imgUrl || 'https://via.placeholder.com/40'}
                    sx={{ width: 40, height: 40, border: `1px solid ${COLORS.primaryMid}`, mr: 2, objectFit: 'cover' }}
                  />
                  <Typography color={COLORS.primaryLight} sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    {group.name}
                  </Typography>

                  {currentUser && !isMember && (
                    <Button
                      disableRipple
                      onClick={() => joinGroupMutation.mutate(group.id)}
                      disabled={joinGroupMutation.isPending}
                      sx={{
                        minWidth: 'auto', p: '4px 8px', color: COLORS.primaryDark,
                        backgroundColor: COLORS.primaryLight, border: `2px solid ${COLORS.primaryLight}`,
                        boxShadow: `2px 2px 0px ${COLORS.accentMid}`, fontSize: '0.85rem',
                        opacity: joinGroupMutation.isPending ? 0.5 : 1,
                        '&:active': { transform: 'translate(2px, 2px)', boxShadow: 'none' }
                      }}
                    >
                      {joinGroupMutation.isPending ? t('userProfile.joiningBtn', 'UNIENDO...') : t('userProfile.joinBtn', 'UNIRSE')}
                    </Button>
                  )}

                  {currentUser && isMember && (
                    <Button
                      disableRipple
                      onClick={() => navigate(`/groups/${group.id}`)}
                      sx={{
                        minWidth: 'auto', p: '4px 8px', color: COLORS.primaryDark,
                        backgroundColor: COLORS.primaryLight, border: `2px solid ${COLORS.primaryLight}`,
                        boxShadow: `2px 2px 0px ${COLORS.accentMid}`, fontSize: '0.85rem',
                        '&:active': { transform: 'translate(2px, 2px)', boxShadow: 'none' }
                      }}
                    >
                      {t('userProfile.goToGroupBtn', 'IR A GRUPO')}
                    </Button>
                  )}
                </Box>
              )
            })}

            {groups?.length === 0 && (
              <Typography color={COLORS.primaryMid}>
                {t('userProfile.noGroupsMsg', '> ESTE_USUARIO_NO_PERTENECE_A_NINGÚN_GRUPO_PÚBLICO.')}
              </Typography>
            )}
          </Box>
        </Box>

      </Box>
    </Box>
  );
}
const BrutalistToggle = ({
  active,
  onToggle,
  disabled
}: {
  active: boolean,
  onToggle: () => void,
  disabled?: boolean
}) => (
  <Box sx={{ display: 'flex', width: '100%', maxWidth: '300px', border: `2px solid ${COLORS.primaryMid}` }}>
    <Button
      disableRipple
      disabled={disabled}
      onClick={() => !active && onToggle()}
      sx={{
        flex: 1, borderRadius: 0, minWidth: 0,
        bgcolor: active ? COLORS.primaryLight : 'transparent',
        color: active ? COLORS.primaryDark : COLORS.primaryMid,
        fontWeight: 900, fontFamily: 'monospace',
        '&:hover': { bgcolor: active ? COLORS.primaryLight : 'rgba(255,255,255,0.05)' },
        '&.Mui-disabled': { color: active ? COLORS.primaryDark : 'rgba(255,255,255,0.2)' }
      }}
    >
      ON
    </Button>
    <Button
      disableRipple
      disabled={disabled}
      onClick={() => active && onToggle()}
      sx={{
        flex: 1, borderRadius: 0, minWidth: 0,
        bgcolor: !active ? COLORS.primaryLight : 'transparent',
        color: !active ? COLORS.primaryDark : COLORS.primaryMid,
        fontWeight: 900, fontFamily: 'monospace',
        borderLeft: `2px solid ${COLORS.primaryMid}`,
        '&:hover': { bgcolor: !active ? COLORS.primaryLight : 'rgba(255,255,255,0.05)' },
        '&.Mui-disabled': { color: !active ? COLORS.primaryDark : 'rgba(255,255,255,0.2)' }
      }}
    >
      OFF
    </Button>
  </Box>
);
