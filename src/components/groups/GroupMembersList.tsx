import { Box, Typography, Button, Tooltip, Alert, Snackbar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../theme/AppTheme';
import type { Member } from '../../interfaces/Member';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { movietequeApi } from '../../api/MovietequeApi';
import type { Group } from '../../interfaces/Group';
import type { User } from '../../interfaces/User';
import axios from 'axios';
import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { BansModal } from './BansModal';

interface GroupMembersListProps {
  members: Member[];
  isAdmin: boolean;
  group: Group;
}
interface ChangeRolInput {
  groupId: string;
  memberId: string;
  role: string;
}

export function GroupMembersList({ members, isAdmin, group }: GroupMembersListProps) {

  const navigate = useNavigate();
  const { showToast } = useToast();

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const sortedMembers = [...(members || [])]
    .sort((a, b) => {
      if (a.role.toLowerCase() === 'admin' && b.role.toLowerCase() !== 'admin') return -1;
      if (a.role.toLowerCase() !== 'admin' && b.role.toLowerCase() === 'admin') return 1;
      return 0;
    });

  const changeMemberRole = useMutation({
    mutationFn: async ({ groupId, memberId, role }: ChangeRolInput) => {
      const response = await movietequeApi.post(`/group/${groupId}/changeMemberRole`, { id: memberId, role: role })
      return response.data;
    },
    onSuccess: (data, variables) => {
      const { groupId } = variables;
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });

      showToast(t('groupMembers.roleUpdated', '[OK] ROL_ACTUALIZADO'), 'success')
    },
    onError: (error) => {
      let serverMessage = t('groupMembers.systemError', 'ERROR_DE_SISTEMA');
      if (axios.isAxiosError(error)) {
        serverMessage = error.response?.data?.message || serverMessage;
        if (Array.isArray(serverMessage)) serverMessage = serverMessage[0];
      }

      showToast(`[ ERROR ] ${serverMessage}`, 'error');
    }
  })

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: `2px solid ${COLORS.primaryMid}`,
        backgroundColor: COLORS.primaryDark,
        p: 2,
        gap: 2,
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: COLORS.primaryMid, borderRadius: 0 },
      }}
    >
      {/* TÍTULO */}
      <Typography
        sx={{
          fontFamily: 'sans-serif',
          fontWeight: 900,
          fontSize: '1.2rem',
          letterSpacing: '-1px',
          color: COLORS.primaryLight,
          borderBottom: `2px solid ${COLORS.primaryMid}`,
          pb: 1,
          mb: 1
        }}
      >
        {t('groupMembers.title')}
      </Typography>

      {isAdmin && (
        <Tooltip title={t('groupMembers.manageBans', 'Administrar Baneados')} placement="top" disableInteractive>
          <Button
            disableRipple
            onClick={() => setIsModalOpen(true)} // Tu futura lógica aquí
            sx={{
              ...squareBtnStyle,
              minWidth: '28px',
              height: '28px',
              fontSize: '0.9rem',
              borderColor: COLORS.primaryMid,
              color: COLORS.primaryMid,
              boxShadow: `2px 2px 0px ${COLORS.accentDark}`,
              '&:hover': {
                borderColor: '#ff5555',
                color: '#ff5555',
                backgroundColor: 'transparent'
              }
            }}
          >
            X
          </Button>
        </Tooltip>
      )}

      <BansModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sortedMembers={sortedMembers}
        group={group}
      />
      {/* LISTA DE MIEMBROS */}
      {sortedMembers.length === 0 && (
        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid }}>
          {t('groupMembers.empty')}
        </Typography>
      )}

      {sortedMembers.map((member) => {

        if (member.isBanned) return null;
        if (member.role === 'Invited') return null;

        const isMemberAdmin = member.role.toLowerCase() === 'admin';

        return (
          <Box
            key={member.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              border: `2px solid ${COLORS.primaryMid}`,
              backgroundColor: isMemberAdmin ? 'rgba(97, 123, 133, 0.1)' : 'transparent',
              transition: 'border-color 0.1s linear',
              '&:hover': {
                borderColor: COLORS.primaryLight
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flexGrow: 1, mr: 2 }}>

              {/* 2. Cuadrado con la foto de perfil del usuario */}
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

              {/* 1. Lógica de nombres (Nickname vs Username) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Typography
                  noWrap
                  sx={{
                    fontFamily: 'monospace',
                    color: COLORS.primaryLight,
                    fontWeight: isMemberAdmin ? 900 : 'normal',
                    fontSize: '1.1rem'
                  }}
                >
                  {/* Si tiene nickname lo muestra, si no, muestra el username */}
                  {member.nickname || member.user?.username || 'ANONYMOUS'}
                </Typography>

                {/* Si TIENE nickname, mostramos el username abajo entre corchetes */}
                {member.nickname && member.user?.username && (
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: 'monospace',
                      color: isMemberAdmin ? COLORS.primaryLight : COLORS.primaryMid,
                      fontSize: '0.8rem'
                    }}
                  >
                    [{member.user.username}]
                  </Typography>
                )}
              </Box>
            </Box>

            {/* BOTONES DE ACCIÓN */}
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>

              <Tooltip title={t('groupMembers.viewProfile', 'Ver Perfil')} placement="top" disableInteractive>
                <Button
                  disableRipple
                  sx={{
                    ...squareBtnStyle,
                    borderColor: COLORS.primaryMid,
                    color: COLORS.primaryMid,
                    '&:hover': { borderColor: COLORS.primaryLight, color: COLORS.primaryLight }
                  }}
                  onClick={() => navigate(`/userProfile/${member.user.id}`)}
                >
                  {`>`}
                </Button>
              </Tooltip>

              {/* Botones de Rol (SÓLO SI EL USUARIO ACTUAL ES ADMIN) */}
              {isAdmin && (
                <>
                  {/* Botón Asignar Admin */}
                  <Tooltip title={t('groupMembers.makeAdmin', 'Hacer Admin')} placement="top" disableInteractive>
                    <span>
                      <Button
                        disableRipple
                        disabled={isMemberAdmin}
                        sx={squareBtnStyle}
                        onClick={
                          () => changeMemberRole.mutate({
                            groupId: group.id,
                            memberId: member.id,
                            role: 'Admin'
                          })
                        }
                      >
                        {t('groupMembers.adminBtn')}
                      </Button>
                    </span>
                  </Tooltip>

                  {/* Botón Asignar Usuario */}
                  <Tooltip title={t('groupMembers.makeUser', 'Hacer Usuario')} placement="top" disableInteractive>
                    <span>
                      <Button
                        disableRipple
                        disabled={!isMemberAdmin}
                        sx={squareBtnStyle}
                        onClick={
                          () => changeMemberRole.mutate({
                            groupId: group.id,
                            memberId: member.id,
                            role: 'User'
                          })
                        }
                      >
                        {t('groupMembers.userBtn')}
                      </Button>
                    </span>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
        );
      })}

    </Box>
  );
}

const squareBtnStyle = {
  minWidth: '32px',
  height: '32px',
  padding: 0,
  borderRadius: 0,
  fontFamily: 'monospace',
  fontWeight: 900,
  fontSize: '1rem',
  transition: 'all 0.05s linear',
  border: `2px solid ${COLORS.primaryLight}`,
  backgroundColor: COLORS.primaryDark,
  color: COLORS.primaryLight,
  boxShadow: `2px 2px 0px ${COLORS.accentMid}`,
  '&:hover': {
    backgroundColor: COLORS.primaryDark,
    filter: 'brightness(1.2)',
  },
  '&:active': {
    transform: 'translate(2px, 2px)',
    boxShadow: `0px 0px 0px transparent`,
  },
  '&.Mui-disabled': {
    backgroundColor: COLORS.primaryMid,
    color: COLORS.primaryDark,
    borderColor: COLORS.primaryMid,
    boxShadow: 'none',
    transform: 'translate(2px, 2px)',
  }
};
