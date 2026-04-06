import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../theme/AppTheme';
import type { Member } from '../../interfaces/Member';
import type { Group } from '../../interfaces/Group';
import type { User } from '../../interfaces/User';
import type { Recommendation } from '../../interfaces/Recommendation';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { formatTerminalDate } from '../../utils/DateUtils';

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

  const [viewMode, setViewMode] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const activeRecommendations = group.recommendations.filter(rec => rec.recommendationState === 'Active');
  const inactiveRecommendations = group.recommendations.filter(rec => rec.recommendationState === 'Inactive');

  const currentRecommendations = viewMode === 'ACTIVE' ? activeRecommendations : inactiveRecommendations;

  const groupedByUser = currentRecommendations.reduce<GroupedUserRecommendations[]>((acc, rec) => {
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

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      minWidth: 0,
      border: `2px solid ${COLORS.primaryMid}`,
      overflowY: 'auto',
      overflowX: 'hidden',
      '&::-webkit-scrollbar': { width: '6px' },
      '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
      '&::-webkit-scrollbar-thumb': { backgroundColor: COLORS.primaryMid, borderRadius: 0 },
    }}>

      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: COLORS.primaryDark,
        borderBottom: `2px solid ${COLORS.primaryMid}`,
        p: 2,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Box sx={{ display: 'flex', width: { xs: '100%', sm: 'auto' }, border: `2px solid ${COLORS.primaryLight}`, boxShadow: `3px 3px 0px ${COLORS.accentDark}` }}>
          <Button
            disableRipple
            onClick={() => setViewMode('ACTIVE')}
            sx={{
              ...tabBtnSx,
              flex: { xs: 1, sm: 'initial' },
              backgroundColor: viewMode === 'ACTIVE' ? COLORS.primaryLight : 'transparent',
              color: viewMode === 'ACTIVE' ? COLORS.primaryDark : COLORS.primaryLight,
            }}
          >
            {t('recommendationGroup.activeTab', 'ACTIVAS')}
          </Button>
          <Button
            disableRipple
            onClick={() => setViewMode('INACTIVE')}
            sx={{
              ...tabBtnSx,
              flex: { xs: 1, sm: 'initial' },
              backgroundColor: viewMode === 'INACTIVE' ? COLORS.primaryLight : 'transparent',
              color: viewMode === 'INACTIVE' ? COLORS.primaryDark : COLORS.primaryLight,
              borderLeft: `2px solid ${COLORS.primaryLight}`
            }}
          >
            {t('recommendationGroup.inactiveTab', 'INACTIVAS')}
          </Button>
        </Box>
      </Box>

      {/* CONTENIDO DESLIZABLE */}
      <Box sx={{ p: { xs: 2, lg: 3 }, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>

        {/* ESTADO VACÍO DINÁMICO */}
        {groupedByUser.length === 0 && (
          <Box sx={{ p: 4, border: `2px dashed ${COLORS.primaryMid}`, textAlign: 'center', mt: 4 }}>
            <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid }}>
              {viewMode === 'ACTIVE'
                ? t('recommendationGroup.noActiveRecs', '>>> NO_HAY_RECOMENDACIONES_ACTIVAS_')
                : t('recommendationGroup.noInactiveRecs', '>>> NO_HAY_RECOMENDACIONES_INACTIVAS_')}
            </Typography>
          </Box>
        )}
        {/* ITERACIÓN DE USUARIOS */}
        {groupedByUser.map((userGroup: GroupedUserRecommendations) => (
          <UserRecommendationRow
            key={userGroup.member.user.id}
            user={userGroup.member.user}
            memberInfo={userGroup.member}
            recommendations={userGroup.recommendations}
            sortPreference={sortPreferences[userGroup.member.user.id] || 'TIME'}
            onToggleSort={() => toggleSortPreference(userGroup.member.user.id)}
            formatDate={formatTerminalDate}
            navigate={navigate}
            viewMode={viewMode}
          />
        ))}
      </Box>

    </Box>
  );
}

interface RowProps {
  user: User;
  memberInfo: Member | undefined;
  recommendations: Recommendation[];
  sortPreference: 'PRIORITY' | 'TIME';
  onToggleSort: () => void;
  formatDate: (d: string) => string;
  navigate: (path: string) => void;
  viewMode: 'ACTIVE' | 'INACTIVE';
}

function UserRecommendationRow({ user, memberInfo, recommendations, sortPreference, onToggleSort, formatDate, navigate, viewMode }: RowProps) {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', minWidth: 0 }}>

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        borderBottom: `2px solid ${COLORS.primaryMid}`,
        pb: 1,
        width: '100%'
      }}>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            component="img"
            src={user.imgUrl || '/assets/placeholder-avatar.png'}
            sx={{ width: 40, height: 40, border: `2px solid ${COLORS.primaryLight}`, objectFit: 'cover', flexShrink: 0 }}
          />
          <Typography noWrap sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase' }}>
            {displayName}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', border: `2px solid ${COLORS.primaryMid}`, flexShrink: 0 }}>
          <Button
            disableRipple
            onClick={onToggleSort}
            sx={{
              ...filterBtnSx,
              flex: { xs: 1, sm: 'initial' },
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
              flex: { xs: 1, sm: 'initial' }, // 50% ancho en celular
              backgroundColor: sortPreference === 'TIME' ? COLORS.primaryLight : 'transparent',
              color: sortPreference === 'TIME' ? COLORS.primaryDark : COLORS.primaryMid,
              borderLeft: `2px solid ${COLORS.primaryMid}`
            }}
          >
            {t('recommendationGroup.recent', '[ RECIENTES ]')}
          </Button>
        </Box>
      </Box>

      {/* 2. CONTENEDOR HORIZONTAL DE RECOMENDACIONES  */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
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
                backgroundImage: rec.movie.posterUrl ? `url('https://image.tmdb.org/t/p/w200${rec.movie.posterUrl}')` : 'url(/assets/placeholder-movie.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer',
                transition: 'all 0.1s linear',
                boxShadow: `3px 3px 0px ${COLORS.accentDark}`,
                mb: 1,
                filter: viewMode === 'ACTIVE' ? 'none' : 'grayscale(80%) opacity(0.7)',
                '&:hover': {
                  borderColor: COLORS.primaryLight,
                  transform: 'translate(-2px, -2px)',
                  boxShadow: `5px 5px 0px ${COLORS.primaryLight}`,
                  filter: 'none',
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
const tabBtnSx = {
  minWidth: { xs: 0, sm: '120px' },
  borderRadius: 0,
  p: '8px 16px',
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  fontWeight: 900,
  transition: 'none',
  '&:hover': { backgroundColor: 'rgba(203, 211, 214, 0.1)' }
};
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
