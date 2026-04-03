import { useParams } from 'react-router-dom';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { MovieSidebar } from '../components/movies/MovieSidebar';
import { Box, Typography } from '@mui/material';
import { COLORS } from '../theme/AppTheme'; // Ajusta la ruta a tu archivo de colores
import { MovieMainInfo } from '../components/movies/MovieMainInfo';
import { MovieCredits } from '../components/movies/MovieCredits';
import { MovieStats } from '../components/movies/MovieStats';

export function MovieDetails() {
  const { id } = useParams();
  const { data: movie, isLoading, isError } = useMovieDetails(id);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.primaryDark, p: 4 }}>
        <Typography sx={{ color: COLORS.primaryLight, fontFamily: 'monospace' }}>
          {`>>> ESCANEANDO_DATOS..._`}
        </Typography>
      </Box>
    );
  }

  if (isError || !movie) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.primaryDark, p: 4 }}>
        <Typography sx={{ color: 'red', fontFamily: 'monospace' }}>
          [ ERROR_CRÍTICO_EN_SISTEMA ]
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: COLORS.primaryDark,
        width: '100%',
        p: { xs: 2, md: 4 },
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
        gap: 4,
        alignItems: 'start'
      }}
    >
      <Box
        component="aside"
        sx={{
          position: { md: 'sticky' },
          top: { md: '2rem' },

          maxHeight: { md: 'calc(100vh - 4rem)' },
          overflowY: 'auto',

          '&::-webkit-scrollbar': { width: '0px' },
        }}
      >
        <MovieSidebar movie={movie} />
      </Box>

      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>

        <MovieMainInfo movie={movie} />
        <MovieCredits movie={movie} />
        <MovieStats movie={movie} />

      </Box>
    </Box >
  );
}
