import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../theme/AppTheme';
import type { Member } from '../../interfaces/Member';
import type { Group } from '../../interfaces/Group';
import type { User } from '../../interfaces/User';
import type { Recommendation } from '../../interfaces/Recommendation';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface RecommendationGroupProps {
  currentUser: User | undefined;
  members: Member[];
  isAdmin: boolean;
  group: Group;
}
interface GroupedUserRecommendations {
  member: Member;
  recommendations: Recommendation[];
}

export function RecommendationGroup({ members, isAdmin, group, currentUser }: RecommendationGroupProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const activeRecommendations = group.recommendations.filter(rec => rec.recommendationState === 'Active');

  const groupedByUser = activeRecommendations.reduce<GroupedUserRecommendations[]>((acc, rec) => {
    const existingUser = acc.find(item => item.member.user.id === rec.user.id);
    if (existingUser) {
      existingUser.recommendations.push(rec);
    } else {
      const memberToAdd = members.find(m => m.user.id === rec.user.id);
      acc.push({ member: memberToAdd!, recommendations: [rec] });
    }
    return acc;
  }, []);

  const [sortPreferences, setSortPreferences] = useState<Record<string, 'PRIORITY' | 'TIME'>>({});

  const toggleSortPreference = (userId: string) => {
    const currentPreference = sortPreferences[userId] || 'TIME';

    setSortPreferences(prev => ({
      ...prev,
      [userId]: currentPreference === 'TIME' ? 'PRIORITY' : 'TIME'
    }))
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "??/??/????";
    const datePart = dateString.substring(0, 10);
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  }

  if (!group.recommendations || group.recommendations.length === 0) {
    return (
      <Box sx={{
        p: 4,
        border: `2px solid ${COLORS.primaryMid}`,
        textAlign: 'center',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid }}>
          {`>>> NO_HAY_RECOMENDACIONES_ACTIVAS_`}
        </Typography>
      </Box>
    );
  }

  return (
    // ESTE ES EL CONTENEDOR PRINCIPAL: Aquí va el border, la altura 100% y el scroll vertical (Y)
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      width: '100%',
      height: '100%',
      border: `2px solid ${COLORS.primaryMid}`,
      p: { xs: 2, lg: 3 },
      overflowY: 'auto',
      overflowX: 'hidden',
      '&::-webkit-scrollbar': { width: '6px' },
      '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
      '&::-webkit-scrollbar-thumb': { backgroundColor: COLORS.primaryMid, borderRadius: 0 },
    }}>
      {/* Iteramos sobre los usuarios que tienen recomendaciones */}
      {groupedByUser.map((userGroup: GroupedUserRecommendations) => (
        <UserRecommendationRow
          key={userGroup.member.user.id}
          user={userGroup.member.user}
          memberInfo={userGroup.member}
          recommendations={userGroup.recommendations}
          sortPreference={sortPreferences[userGroup.member.user.id] || 'TIME'}
          onToggleSort={() => toggleSortPreference(userGroup.member.user.id)}
          formatDate={formatDate}
          navigate={navigate}
        />
      ))}
    </Box>
  );
}

// --- SUB-COMPONENTE PARA CADA FILA DE USUARIO ---
interface RowProps {
  user: User;
  memberInfo: Member | undefined;
  recommendations: Recommendation[];
  sortPreference: 'PRIORITY' | 'TIME';
  onToggleSort: () => void;
  formatDate: (d: string) => string;
  navigate: (path: string) => void;
}

function UserRecommendationRow({ user, memberInfo, recommendations, sortPreference, onToggleSort, formatDate, navigate }: RowProps) {
  const { t } = useTranslation();
  const displayName = memberInfo?.nickname || user.username;

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const timeA = new Date(a.createdAt.replace(' ', 'T')).getTime();
    const timeB = new Date(b.createdAt.replace(' ', 'T')).getTime();

    if (sortPreference === 'PRIORITY') {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return timeB - timeA;
    } else {
      return timeB - timeA;
    }
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>

      {/* 1. HEADER DE LA FILA (Usuario a la izquierda, Switch a la derecha) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${COLORS.primaryMid}`, pb: 1, width: '100%' }}>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src={user.imgUrl || 'https://via.placeholder.com/40/0B2833/CBD3D6?text=?'}
            sx={{ width: 40, height: 40, border: `2px solid ${COLORS.primaryLight}`, objectFit: 'cover' }}
          />
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase' }}>
            {displayName}
          </Typography>
        </Box>

        {/* Switch Brutalista */}
        <Box sx={{ display: 'flex', border: `2px solid ${COLORS.primaryMid}`, flexShrink: 0 }}>
          <Button
            disableRipple
            onClick={onToggleSort}
            sx={{
              ...filterBtnSx,
              backgroundColor: sortPreference === 'PRIORITY' ? COLORS.primaryLight : 'transparent',
              color: sortPreference === 'PRIORITY' ? COLORS.primaryDark : COLORS.primaryMid,
            }}
          >
            {t('recommendationGroup.priority', '[ PRIORIDAD ]')}
          </Button>
          <Button
            disableRipple
            onClick={onToggleSort}
            sx={{
              ...filterBtnSx,
              backgroundColor: sortPreference === 'TIME' ? COLORS.primaryLight : 'transparent',
              color: sortPreference === 'TIME' ? COLORS.primaryDark : COLORS.primaryMid,
              borderLeft: `2px solid ${COLORS.primaryMid}`
            }}
          >
            {t('recommendationGroup.recent', '[ RECIENTES ]')}
          </Button>
        </Box>
      </Box>

      {/* 2. CONTENEDOR HORIZONTAL DE RECOMENDACIONES (Restaurado a scroll X) */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto', // Solo scroll horizontal aquí
          width: '100%',
          pb: 2,
          '&::-webkit-scrollbar': { height: '8px' },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: COLORS.primaryMid, borderRadius: 0 },
        }}
      >
        {sortedRecommendations.map((rec) => (
          <Box key={rec.id} sx={{ display: 'flex', flexDirection: 'column', width: '140px', flexShrink: 0 }}>

            {/* Póster Clickeable */}
            <Box
              onClick={() => navigate(`/recommendation/${rec.id}`)}
              sx={{
                width: '100%',
                height: '210px',
                border: `2px solid ${COLORS.primaryMid}`,
                backgroundImage: `url('https://image.tmdb.org/t/p/w200${rec.movie.posterUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer',
                transition: 'all 0.1s linear',
                boxShadow: `3px 3px 0px ${COLORS.accentDark}`,
                mb: 1,
                '&:hover': {
                  borderColor: COLORS.primaryLight,
                  transform: 'translate(-2px, -2px)',
                  boxShadow: `5px 5px 0px ${COLORS.primaryLight}`,
                },
                '&:active': {
                  transform: 'translate(2px, 2px)',
                  boxShadow: '0px 0px 0px transparent',
                }
              }}
            />

            {/* Datos compactados */}
            <Typography noWrap sx={{ fontFamily: 'sans-serif', color: COLORS.primaryLight, fontSize: '0.9rem', fontWeight: 900, lineHeight: 1.1 }}>
              {rec.movie.name}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>

              {/* Nuevo diseño para el número de prioridad */}
              <Box sx={{
                border: `1px solid ${COLORS.primaryMid}`,
                backgroundColor: 'rgba(0,0,0,0.3)',
                px: 1,
                py: 0.2,
                boxShadow: `2px 2px 0px ${COLORS.primaryMid}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography sx={{ fontFamily: 'monospace', color: '#ffcc00', fontSize: '0.8rem', fontWeight: 900 }}>
                  {rec.priority}
                </Typography>
              </Box>

              <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.75rem' }}>
                {formatDate(rec.createdAt)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

    </Box>
  );
}

const filterBtnSx = {
  minWidth: 'auto',
  borderRadius: 0,
  p: '2px 8px',
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  fontWeight: 900,
  transition: 'none',
  '&:hover': { backgroundColor: 'rgba(203, 211, 214, 0.1)' }
};
