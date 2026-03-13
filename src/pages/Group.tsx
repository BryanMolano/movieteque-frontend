import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import { COLORS } from '../theme/AppTheme';
import { useQuery } from '@tanstack/react-query';
import { movietequeApi } from '../api/MovietequeApi';
import type { User } from '../interfaces/User';
import { useUser } from '../hooks/useUser';
import { useGroup } from '../hooks/useGroup';
import { GroupInfoSidebar } from '../components/groups/GroupInfoSidebar';
import { GroupMembersList } from '../components/groups/GroupMembersList';
import { useEffect } from 'react';

export function Group() {
  const { id } = useParams();
  const { data: currentUser } = useUser();
  const { data: group, isLoading } = useGroup(id);
  const isAdmin = (group?.members.some(member => member.role === 'Admin' && member.user.id === currentUser?.id));
  const currentMember = (group?.members.find(member => member.user.id === currentUser?.id));
  const navigate = useNavigate();

  const isValidMember = currentMember?.role === 'Admin' || currentMember?.role === 'User'

  useEffect(() => {
    if (!isLoading && group && currentUser) {
      if (!isValidMember) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isLoading, group, currentUser, isValidMember, navigate])

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.primaryDark, p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color={COLORS.primaryLight} sx={{ fontFamily: 'monospace', fontSize: '2rem' }}>
          {`>>> CARGANDO_SISTEMA..._`}
        </Typography>
      </Box>
    );
  }
  if (!group) return null;
  if (!isValidMember) return null;
  // return (
  //   <Box sx={{
  //     minHeight: '100vh',
  //     backgroundColor: COLORS.primaryDark,
  //     p: 3,
  //     display: 'grid',
  //     gridTemplateColumns: '350px 1fr 350px', // Izquierda, Centro (expande), Derecha
  //     gap: 3,
  //     height: '100vh', // Para que el scroll sea interno por columna
  //     overflow: 'hidden'
  //   }}>
  //
  //     {/* ⬅️ COLUMNA IZQUIERDA: Info del Grupo */}
  //     <Box sx={{ height: '100%', overflowY: 'auto' }}>
  //       <GroupInfoSidebar group={group} isAdmin={isAdmin} currentMember={currentMember} />
  //     </Box>
  //
  //     {/* ⏺️ COLUMNA CENTRAL: Recomendaciones (Placeholder temporal) */}
  //     <Box sx={{
  //       border: `2px solid ${COLORS.primaryMid}`,
  //       height: '100%',
  //       display: 'flex',
  //       alignItems: 'center',
  //       justifyContent: 'center'
  //     }}>
  //       <Typography color={COLORS.primaryMid} sx={{ fontFamily: 'monospace' }}>
  //         [ ÁREA DE CARTAS EN CONSTRUCCIÓN ]
  //       </Typography>
  //     </Box>
  //     <Box sx={{
  //       height: '100%',
  //       overflowY: 'hidden' // El scroll ahora lo maneja el interior del GroupMembersList
  //     }}>
  //       {/* Pasamos la lista de miembros y si el usuario actual es admin para que dibuje o no los botones */}
  //       <GroupMembersList members={group.members} isAdmin={Boolean(isAdmin)} />
  //     </Box>
  //
  //   </Box>
  // );

  // Si hay token, '<Outlet />' renderiza la página que el usuario quería ver (ej. Dashboard)
  return (
    <Box sx={{
      backgroundColor: COLORS.primaryDark,
      // Padding menor en móviles, normal en escritorio
      p: { xs: 2, lg: 3 },
      display: 'grid',

      // 🔥 MAGIA RESPONSIVE: 1 columna en móvil, 3 en PC
      gridTemplateColumns: { xs: '1fr', lg: '350px 1fr 350px' },
      gap: 3,

      // 🔥 Altura automática en móvil (crece hacia abajo), altura estricta de pantalla en PC
      height: { xs: 'auto', lg: '100vh' },
      minHeight: '100vh',

      // 🔥 Permitimos scroll de página en móvil, lo bloqueamos en PC para usar scroll interno
      overflow: { xs: 'visible', lg: 'hidden' }
    }}>

      {/* ⬅️ COLUMNA IZQUIERDA: Info del Grupo */}
      <Box sx={{
        height: { xs: 'auto', lg: '100%' },
        overflowY: { xs: 'visible', lg: 'auto' }
      }}>
        <GroupInfoSidebar group={group} isAdmin={isAdmin} currentMember={currentMember} />
      </Box>

      {/* ⏺️ COLUMNA CENTRAL: Recomendaciones */}
      <Box sx={{
        border: `2px solid ${COLORS.primaryMid}`,
        // Le damos una altura mínima en móvil para que el placeholder no se aplaste
        minHeight: { xs: '400px', lg: '100%' },
        height: { xs: 'auto', lg: '100%' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography color={COLORS.primaryMid} sx={{ fontFamily: 'monospace' }}>
          [ ÁREA DE CARTAS EN CONSTRUCCIÓN ]
        </Typography>
      </Box>

      {/* ➡️ COLUMNA DERECHA: Miembros */}
      <Box sx={{
        height: { xs: 'auto', lg: '100%' },
        overflowY: { xs: 'visible', lg: 'hidden' }
      }}>
        <GroupMembersList group={group} members={group.members} isAdmin={Boolean(isAdmin)} />
      </Box>

    </Box>
  );

}
