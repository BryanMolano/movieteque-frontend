import { useParams } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import { COLORS } from '../theme/AppTheme';
import { useQuery } from '@tanstack/react-query';
import { movietequeApi } from '../api/MovietequeApi';
import type { User } from '../interfaces/User';
import { useUser } from '../hooks/useUser';
import { useGroup } from '../hooks/useGroup';
import { GroupInfoSidebar } from '../components/groups/GroupInfoSidebar';

export function Group() {
  const { id } = useParams();
  const { data: currentUser } = useUser();
  const { data: group, isLoading } = useGroup(id);
  const isAdmin = (group?.members.some(member => member.role === 'Admin' && member.user.id === currentUser?.id));
  const currentMember = (group?.members.find(member => member.user.id === currentUser?.id));



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
  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: COLORS.primaryDark,
      p: 3,
      display: 'grid',
      gridTemplateColumns: '350px 1fr 350px', // Izquierda, Centro (expande), Derecha
      gap: 3,
      height: '100vh', // Para que el scroll sea interno por columna
      overflow: 'hidden'
    }}>

      {/* ⬅️ COLUMNA IZQUIERDA: Info del Grupo */}
      <Box sx={{ height: '100%', overflowY: 'auto' }}>
        <GroupInfoSidebar group={group} isAdmin={isAdmin} currentMember={currentMember} />
      </Box>

      {/* ⏺️ COLUMNA CENTRAL: Recomendaciones (Placeholder temporal) */}
      <Box sx={{
        border: `2px solid ${COLORS.primaryMid}`,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography color={COLORS.primaryMid} sx={{ fontFamily: 'monospace' }}>
          [ ÁREA DE CARTAS EN CONSTRUCCIÓN ]
        </Typography>
      </Box>

      {/* ➡️ COLUMNA DERECHA: Miembros (Placeholder temporal) */}
      <Box sx={{
        border: `2px solid ${COLORS.primaryMid}`,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography color={COLORS.primaryMid} sx={{ fontFamily: 'monospace' }}>
          [ LISTA DE MIEMBROS ]
        </Typography>
      </Box>

    </Box>
  );
}
