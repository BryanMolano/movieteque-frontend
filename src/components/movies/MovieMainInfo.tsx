import { Box, Button, Typography } from '@mui/material';
import type { MovieDetails } from '../../interfaces/MovieDetails';
import { COLORS } from '../../theme/AppTheme';
import { useTranslation } from 'react-i18next';
import { formatTerminalDate } from '../../utils/DateUtils';

interface Props {
  movie: MovieDetails;
}

export function MovieMainInfo({ movie }: Props) {

  const { t } = useTranslation();
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1920${movie.backdrop_path}`
    : '/assets/placeholder-backdrop.png';

  const formatRuntime = (minutes: number) => {
    if (!minutes) return '00H 00M';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}H ${m.toString().padStart(2, '0')}M`;
  };


  const country = Array.isArray(movie.origin_country)
    ? movie.origin_country[0]
    : movie.origin_country || 'N/A';

  return (




    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      <Box
        sx={{
          width: '100%',
          height: { xs: '200px', md: '500px' }, // No muy alto para no requerir scroll
          backgroundImage: `url('${backdropUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: `2px solid ${COLORS.primaryMid}`, // Borde rígido Cyan
          boxShadow: `4px 4px 0px ${COLORS.accentMid}`, // Sombra contrastante térmica
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        {/* Izquierda: Títulos y Datos */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0, width: '100%' }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'sans-serif',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-1.5px',
              fontSize: { xs: '2.5rem', md: '4rem' },
              lineHeight: 1,
              color: COLORS.primaryLight,
              textShadow: `3px 3px 0px ${COLORS.accentDark}`,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {movie.title}
          </Typography>

          {movie.title !== movie.original_title && (
            <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontStyle: 'italic', fontSize: '1.2rem' }}>
              {`AKA: ${movie.original_title}`}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
            {movie.status && (
              <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '0.85rem', border: `1px solid ${COLORS.primaryMid}`, px: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                {t('movieMain.status')}: [{movie.status.toUpperCase()}]
              </Typography>
            )}
            {movie.release_date && (
              <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '0.85rem', border: `1px solid ${COLORS.primaryMid}`, px: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                {t('movieMain.releaseDate')}: [{formatTerminalDate(movie.release_date)}]
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, minWidth: { xs: 'auto', sm: 'max-content' } }}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 900, color: COLORS.accentMid, letterSpacing: '2px' }}>
            {formatRuntime(movie.runtime)}
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.9rem', color: COLORS.primaryMid, letterSpacing: '1px' }}>
            {`[ ${country} ]`}
          </Typography>
        </Box>
      </Box>




      <Box sx={{ borderLeft: `4px solid ${COLORS.primaryMid}`, pl: 2, py: 0.5 }}>
        <Typography
          sx={{
            fontFamily: 'monospace',
            color: COLORS.primaryLight,
            fontSize: '1rem',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {movie.overview || t('movieMain.noSynopsis')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
        {movie.genres?.map((genre) => (
          <Box
            key={genre.id}
            sx={{
              border: `1px solid ${COLORS.primaryMid}`,
              padding: '4px 12px',
              backgroundColor: COLORS.primaryDark
            }}
          >
            <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 900 }}>
              {genre.name}
            </Typography>
          </Box>
        ))}
      </Box>

      {movie.watch_providers?.flatrate && movie.watch_providers.flatrate.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '1rem', fontWeight: 900 }}>
            {t('movieMain.streaming')}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: '6px' },
              '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: COLORS.primaryMid, borderRadius: 0 },
            }}
          >
            {movie.watch_providers.flatrate.map((provider) => (
              <Box
                key={provider.provider_id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  border: `1px solid ${COLORS.primaryMid}`,
                  p: '4px 12px 4px 4px', // Menos padding a la izquierda para pegar el logo
                  backgroundColor: 'rgba(97, 123, 133, 0.05)',
                  flexShrink: 0
                }}
              >
                <Box
                  component="img"
                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                  alt={provider.provider_name}
                  sx={{ width: 24, height: 24, borderRadius: 0, border: `1px solid ${COLORS.primaryDark}` }}
                />
                <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '0.85rem', fontWeight: 900 }}>
                  {provider.provider_name.toUpperCase()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {movie.videos && movie.videos.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '1rem', fontWeight: 900 }}>
            {t('movieMain.trailer')}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: '6px' },
              '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: COLORS.primaryMid, borderRadius: 0 },
            }}
          >
            {movie.videos.map((video) => (
              <Button
                key={video.id}
                component="a"
                href={`https://www.youtube.com/watch?v=${video.key}`}
                target="_blank"
                rel="noopener noreferrer"
                disableRipple
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  border: `2px solid ${COLORS.primaryMid}`,
                  p: '6px 12px',
                  backgroundColor: COLORS.primaryDark,
                  flexShrink: 0,
                  boxShadow: `2px 2px 0px ${COLORS.accentMid}`,
                  transition: 'all 0.05s linear',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: COLORS.primaryLight,
                    backgroundColor: 'rgba(203, 211, 214, 0.05)',
                  },
                  '&:active': {
                    transform: 'translate(2px, 2px)',
                    boxShadow: '0px 0px 0px transparent',
                  }
                }}
              >
                <Box
                  sx={{
                    backgroundColor: '#FF0000',
                    color: '#FFFFFF',
                    px: 1,
                    py: 0.2,
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    border: '1px solid #FF0000'
                  }}
                >
                  ► YT
                </Box>

                <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '0.85rem', fontWeight: 900 }}>
                  {video.type.toUpperCase()}
                </Typography>
              </Button>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
