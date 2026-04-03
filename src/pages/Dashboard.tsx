import { Box, Button, Container, Typography, Paper, Grid, Avatar, Modal } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { movietequeApi } from '../api/MovietequeApi';
import { COLORS } from '../theme/AppTheme';
import { useEffect, useState } from 'react';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import { useUser } from '../hooks/useUser';
import { InvitationsModal } from '../components/groups/InvitationsModal';

interface Group {
  id: string;
  name: string;
  type: 'PRIVATE' | 'PUBLIC';
  created_at: string;
  membersCount: number;
  imgUrl: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Iniciamos el traductor
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isInvitationsModalOpen, setIsInvitationsModalOpen] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const { showToast } = useToast();
  const { data: currentUser } = useUser();

  const [pendingToken, setPendingToken] = useState<string | null>(
    localStorage.getItem('pending-invite')
  )

  const { data: inviteData, isError: isInviteError } = useQuery({
    queryKey: ['verify-invite', pendingToken],
    queryFn: async () => {
      try {
        const response = await movietequeApi.get(`/group/verify-invitation/${pendingToken}`)
        return response.data;
      }
      catch (error) {
        localStorage.removeItem('pending-invite');
        setPendingToken(null);
      }
    },
    enabled: !!pendingToken,
    retry: false
  })

  // Mutación para unirse al grupo
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      return await movietequeApi.post('/group/joinbylink', { jwt: pendingToken });
    },
    onSuccess: () => {
      localStorage.removeItem('pending-invite');
      setPendingToken(null);
      queryClient.invalidateQueries({ queryKey: ['user-groups'] })
      showToast(t('dashboard.inviteModal.successJoin', '[OK]'), 'success');
    },
    onError: (error) => {
      localStorage.removeItem('pending-invite');
      setPendingToken(null);
      let serverMessage = t('dashboard.inviteModal.systemError', 'ERROR_DE_SISTEMA');
      if (axios.isAxiosError(error)) {
        serverMessage = error.response?.data?.message || serverMessage;
        if (Array.isArray(serverMessage)) serverMessage = serverMessage[0];
      }
      showToast(`[ ERROR ] ${serverMessage}`, 'error');
    }
  });

  const handleRejectInvite = () => {
    localStorage.removeItem('pending-invite');
    setPendingToken(null);
  };
  //FIN TOKEN

  const { data: groups, isLoading, isError } = useQuery({
    queryKey: ['user-groups'],
    queryFn: async () => {
      const response = await movietequeApi.get(`/group/${currentUser?.id}/userGroups`);
      return response.data as Group[];
    }, enabled: !!currentUser
  });

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.primaryDark, p: 4 }}>
      <Container maxWidth="md">

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${COLORS.primaryMid}`, pb: 2, mb: 4 }}>
          <Typography variant="h4" color={COLORS.primaryLight} sx={{ fontWeight: 900, fontFamily: 'monospace', textShadow: `2px 2px 0px ${COLORS.accentMid}` }}>
            {t('dashboard.title')}
          </Typography>
          {/* PEGA EL BOTÓN AQUÍ */}
          <Button
            disableRipple
            onClick={() => setIsInvitationsModalOpen(true)}
            sx={{
              py: 1, px: 3,
              backgroundColor: 'transparent',
              color: COLORS.primaryLight,
              borderRadius: 0,
              border: `2px solid ${COLORS.primaryLight}`,
              boxShadow: `3px 3px 0px ${COLORS.accentDark}`,
              fontWeight: '900',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              transition: 'all 0.05s linear',
              '&:hover': { backgroundColor: 'rgba(203, 211, 214, 0.1)' },
              '&:active': { boxShadow: `0px 0px 0px transparent`, transform: 'translate(3px, 3px)' }
            }}
          >
            {t('dashboard.invitations', '[ INVITACIONES ]')}
          </Button>

          <InvitationsModal
            open={isInvitationsModalOpen}
            onClose={() => setIsInvitationsModalOpen(false)}
            user={currentUser}
          />
        </Box>

        {isLoading && (
          <Typography color={COLORS.primaryLight} sx={{ fontFamily: 'monospace', fontSize: '1.2rem' }}>
            {t('dashboard.loading')}
          </Typography>
        )}

        {isError && (
          <Typography color="#ff5555" sx={{ fontFamily: 'monospace', fontSize: '1.2rem', backgroundColor: '#331111', p: 2, border: '2px solid #ff5555' }}>
            {t('dashboard.error')}
          </Typography>
        )}

        {!isLoading && !isError && groups && (
          <>
            {groups.length === 0 ? (
              <Typography color={COLORS.primaryMid} sx={{ fontFamily: 'monospace' }}>
                {t('dashboard.empty')}
              </Typography>
            ) : (
              // alignItems="stretch" asegura que las columnas de una misma fila tengan el mismo alto
              <Grid container spacing={3} alignItems="stretch">
                {groups.map((group) => (
                  // Aquí definimos la matriz 2x2: en móviles es 1 columna (xs=12), en PC son 2 columnas (md=6)
                  <Grid size={{ xs: 12, md: 6 }} key={group.id}>
                    <GroupCard group={group} onClick={() => navigate(`/groups/${group.id}`)} t={t} />
                  </Grid>
                ))}
              </Grid>
            )}

            <Button
              onClick={() => setIsModalOpen(true)}
              disableRipple
              sx={{
                mt: 4, py: 1.5, px: 4, backgroundColor: COLORS.primaryLight, color: COLORS.primaryDark,
                borderRadius: 0, border: `2px solid ${COLORS.primaryLight}`, boxShadow: `5px 5px 0px ${COLORS.accentMid}`,
                fontWeight: '900', fontFamily: 'monospace', fontSize: '1rem', transition: 'all 0.05s linear',
                '&:active': { boxShadow: `2px 2px 0px ${COLORS.accentMid}`, transform: 'translate(3px, 3px)' }
              }}
            >
              {t('dashboard.createGroupBtn')}
            </Button>
            <CreateGroupModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </>
        )}
      </Container>
      <Modal open={!!inviteData} onClose={handleRejectInvite}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 450, backgroundColor: COLORS.primaryDark, border: `2px solid ${COLORS.primaryLight}`,
          boxShadow: `8px 8px 0px ${COLORS.accentMid}`, p: 4, outline: 'none'
        }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: COLORS.primaryLight, letterSpacing: '-1px', mb: 2, fontFamily: 'sans-serif' }}>
            {t('dashboard.inviteModal.title', 'NUEVA_INVITACION_DETECTADA')}
          </Typography>

          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, mb: 4 }}>
            {t('dashboard.inviteModal.body1', 'El usuario ')}<strong style={{ color: COLORS.primaryLight }}>[{inviteData?.inviterNickname}]</strong>{t('dashboard.inviteModal.body2', ' te ha invitado a unirte al grupo estratégico:')}
            <br /><br />
            <span style={{ fontSize: '1.2rem', color: COLORS.primaryLight, borderLeft: `4px solid ${COLORS.accentMid}`, paddingLeft: '10px' }}>
              {inviteData?.groupName}
            </span>
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button disableRipple onClick={handleRejectInvite} sx={{
              border: `2px solid ${COLORS.primaryMid}`, color: COLORS.primaryMid,
              boxShadow: `4px 4px 0px ${COLORS.accentDark}`, borderRadius: 0, fontFamily: 'sans-serif', fontWeight: 900
            }}>
              {t('dashboard.inviteModal.rejectBtn', '[ RECHAZAR ]')}
            </Button>
            <Button disableRipple onClick={() => joinGroupMutation.mutate()} disabled={joinGroupMutation.isPending} sx={{
              border: `2px solid ${COLORS.primaryLight}`, color: COLORS.primaryDark, backgroundColor: COLORS.primaryLight,
              boxShadow: `4px 4px 0px ${COLORS.accentMid}`, borderRadius: 0, fontFamily: 'sans-serif', fontWeight: 900,
              '&:hover': { backgroundColor: '#fff' }
            }}>
              {joinGroupMutation.isPending ? t('dashboard.inviteModal.processing', 'PROCESANDO...') : t('dashboard.inviteModal.acceptBtn', '[ ACEPTAR_E_INGRESAR ]')}
            </Button>
          </Box>
        </Box>
      </Modal>

    </Box >
  );
}

const GroupCard = ({ group, onClick, t }: { group: Group, onClick: () => void, t: any }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: 2, display: 'flex', gap: 2, alignItems: 'flex-start',
      height: '100%', boxSizing: 'border-box', // <-- ESTO OBLIGA A QUE TODAS MIDAN IGUAL
      backgroundColor: COLORS.primaryDark, borderRadius: 0,
      border: `2px solid ${COLORS.primaryMid}`, boxShadow: `6px 6px 0px ${COLORS.accentDark}`,
      cursor: 'pointer', transition: 'all 0.1s linear',
      '&:hover': {
        borderColor: COLORS.primaryLight,
        boxShadow: `6px 6px 0px ${COLORS.accentMid}`,
        transform: 'translate(-2px, -2px)'
      }
    }}
  >
    <Avatar
      src={group.imgUrl || '/assets/placeholder-group.png'} // <-- CAMBIO AQUÍ: Implementación de la imagen local de respaldo
      alt={group.name}
      variant="square"
      sx={{ width: 70, height: 70, border: `2px solid ${COLORS.primaryLight}`, flexShrink: 0 }} // flexShrink evita que la imagen se aplaste
    />

    {/* minWidth: 0 es un truco de flexbox para que el truncamiento (noWrap) funcione */}
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
      <Typography variant="h6" color={COLORS.primaryLight} noWrap sx={{ fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase' }}>
        {group.name}
      </Typography>

      {/* flexWrap permite que las etiquetas bajen de línea si la pantalla es muy pequeña */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
        <Typography variant="body2" color={COLORS.primaryMid} sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {t('dashboard.type')}: [{group.type}]
        </Typography>
        <Typography variant="body2" color={COLORS.primaryMid} sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {t('dashboard.users')}: [{group.membersCount}]
        </Typography>
        <Typography variant="body2" color={COLORS.primaryMid} sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {t('dashboard.created')}: [{group.created_at}]
        </Typography>
      </Box>
    </Box>
  </Paper>
);
