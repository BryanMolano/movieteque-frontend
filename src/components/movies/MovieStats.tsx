import { Box, Typography } from '@mui/material';
import type { MovieDetails } from '../../interfaces/MovieDetails';
import { COLORS } from '../../theme/AppTheme';
import { useTranslation } from 'react-i18next';

interface Props {
  movie: MovieDetails;
}

// Sub-componente para cada bloque de métrica
function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        border: `2px solid ${COLORS.primaryMid}`,
        p: 1.5,
        backgroundColor: COLORS.primaryDark,
        boxShadow: `3px 3px 0px ${COLORS.accentDark}`, // Sombra dura para dar volumen
      }}
    >
      <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.75rem', fontWeight: 'bold' }}>
        {`> ${label}`}
      </Typography>
      <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase' }}>
        {value}
      </Typography>
    </Box>
  );
}

export function MovieStats({ movie }: Props) {
  const { t } = useTranslation();
  // Formateador de dinero (Ej: 1500000 -> $1,500,000)
  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return t('movieStats.unknown');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0, // Sin centavos para que se vea más limpio
    }).format(amount);
  };

  // Formateador de números grandes (Ej: 15420 -> 15,420)
  const formatNumber = (num: number) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>

      {/* Título de la Sección */}
      <Typography
        sx={{
          fontFamily: 'monospace',
          color: COLORS.primaryLight,
          fontSize: '1.2rem',
          fontWeight: 900,
          borderBottom: `2px solid ${COLORS.primaryMid}`,
          pb: 0.5
        }}
      >
        {t('movieStats.title')}
      </Typography>

      {/* Grid de Estadísticas (Se adapta automáticamente al tamaño de la pantalla) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, // 2 columnas en móvil, 3 en PC
          gap: 2
        }}
      >
        <StatBlock label={t('movieStats.budget')} value={formatCurrency(movie.budget)} />
        <StatBlock label={t('movieStats.revenue')} value={formatCurrency(movie.revenue)} />
        <StatBlock label={t('movieStats.originalLanguage')} value={movie.original_language || 'N/A'} />

        <StatBlock
          label={t('movieStats.popularity')}
          value={movie.popularity ? movie.popularity.toFixed(1) : '0.0'}
        />
        <StatBlock
          label={t('movieStats.score')}
          value={movie.vote_average ? `${movie.vote_average.toFixed(1)} / 10` : 'N/A'}
        />
        <StatBlock
          label={t('movieStats.totalVotes')}
          value={formatNumber(movie.vote_count)}
        />
      </Box>

    </Box>
  );
}
