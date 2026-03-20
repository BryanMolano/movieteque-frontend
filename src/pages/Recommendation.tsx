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
import { RecommendationGroup } from '../components/groups/RecommendationGroup';
import { useRecommendation } from '../hooks/useRecommendation';

export function Recommendation() {
  const { id } = useParams();
  const { data: currentUser } = useUser();
  const { data: recommendation, isLoading } = useRecommendation(id);
  const isAdmin = (recommendation?.group?.members.some(member => member.role === 'Admin' && member.user.id === currentUser?.id));
  const currentMember = (recommendation?.group?.members.find(member => member.user.id === currentUser?.id));
  const navigate = useNavigate();
  const isValidMember = currentMember?.role === 'Admin' || currentMember?.role === 'User'

  useEffect(() => {
    if (!isLoading && recommendation && currentUser) {
      if (!isValidMember) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isLoading, recommendation, currentUser, isValidMember, navigate])

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.primaryDark, p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color={COLORS.primaryLight} sx={{ fontFamily: 'monospace', fontSize: '2rem' }}>
          {`>>> CARGANDO_SISTEMA..._`}
        </Typography>
      </Box>
    );
  }
  if (!recommendation) return null;
  if (!isValidMember) return null;
  return (
    <Box sx={{
      backgroundColor: COLORS.primaryDark,
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '300px minmax(0, 1fr) 300px', lg: '350px minmax(0, 1fr) 350px' },
      gap: 3,
      height: { xs: 'auto', md: 'calc(100vh - 130px)' },
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>

      {/* COLUMNAS LIMPIAS: Solo pasan la altura a sus hijos */}
      <Box sx={{ height: '100%', minHeight: 0 }}>
        {/* <GroupInfoSidebar group={group} isAdmin={isAdmin} currentMember={currentMember} /> */}
      </Box>

      <Box sx={{ height: '100%', minHeight: 0 }}>
        {/* <RecommendationGroup currentUser={currentUser} group={group} members={group.members} isAdmin={Boolean(isAdmin)} /> */}
      </Box>

      <Box sx={{ height: '100%', minHeight: 0 }}>
        {/* <GroupMembersList group={group} members={group.members} isAdmin={Boolean(isAdmin)} /> */}
      </Box>

    </Box>
  );
}
