import { Box, Button } from '@mui/material';
import type { MovieDetails } from '../../interfaces/MovieDetails';
import { COLORS } from '../../theme/AppTheme';
import { useState } from 'react';
import { PostersGallery } from './PosterGalleryModal';
import { BackdropsGallery } from './BackdropGalleryModal';
import { RecommendationMovieModal } from './RecommendationMovieModal';

interface Props {
  movie: MovieDetails;
}

export function MovieSidebar({ movie }: Props) {
  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750/0B2833/CBD3D6?text=NO+POSTER';

  const logoUrl = movie?.logos?.[0]?.file_path
    ? `https://image.tmdb.org/t/p/w300${movie.logos[0].file_path}`
    : null;
  const [isPostersModalOpen, setIsPostersModalOpen] = useState<boolean>(false)

  const [isBackdropsModalOpen, setIsBackdropsModalOpen] = useState<boolean>(false)

  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState<boolean>(false)
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: '350px', // 👈 Pone un límite estricto al ancho de toda la columna
        width: '100%',
        margin: '0 auto' // Centra el contenido dentro del tercio izquierdo
      }}
    >
      {/* Contenedor de botones técnicos */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between', // Uno a cada extremo
          alignItems: 'center',
          width: '100%',
          mb: 0.5 // Un pequeño respiro antes del póster
        }}
      >
        {/* Botón 1: Posters */}
        <Button
          disableRipple
          onClick={() => setIsPostersModalOpen(true)}
          sx={{
            minWidth: 'auto',
            p: '2px 4px',
            fontSize: '0.7rem', // Un poco más pequeño para que quepan bien
            color: COLORS.primaryMid,
            fontFamily: 'monospace',
            '&:hover': {
              color: COLORS.primaryLight,
              backgroundColor: 'transparent',
              textDecoration: 'underline' // Estilo link de terminal
            }
          }}
        >
          [ VER_PÓSTERS ]
        </Button>

        <PostersGallery
          open={isPostersModalOpen}
          onClose={() => setIsPostersModalOpen(false)}
          posters={movie.posters}

        />
        {/* Botón 2: Imágenes */}
        <Button
          disableRipple
          onClick={() => setIsBackdropsModalOpen(true)}
          sx={{
            minWidth: 'auto',
            p: '2px 4px',
            fontSize: '0.7rem',
            color: COLORS.primaryMid,
            fontFamily: 'monospace',
            '&:hover': {
              color: COLORS.primaryLight,
              backgroundColor: 'transparent',
              textDecoration: 'underline'
            }
          }}
        >
          [ VER_STILLS ]
        </Button>
        <BackdropsGallery
          open={isBackdropsModalOpen}
          onClose={() => setIsBackdropsModalOpen(false)}
          backdrops={movie.backdrops}

        />
      </Box>
      {/* 2. Póster Controlado */}
      <Box
        component="img"
        src={posterUrl}
        alt={`Póster de la película ${movie.title}`}
        sx={{
          width: '100%',
          height: 'auto',
          aspectRatio: '2 / 3', // 👈 Garantiza proporción perfecta 
          objectFit: 'cover',
          border: `2px solid ${COLORS.primaryMid}`,
          display: 'block'
        }}
      />

      {/* 3. Botón Principal (El único protagonista) */}
      <Button
        disableRipple
        onClick={() => setIsRecommendationModalOpen(true)}
        sx={{
          width: '100%',
          p: 1.5,
          mt: 1,
          fontFamily: 'monospace',
          fontSize: '1rem',
          letterSpacing: '1px',
          border: `2px solid ${COLORS.primaryLight}`,
          backgroundColor: COLORS.primaryDark,
          color: COLORS.primaryLight,
          boxShadow: `4px 4px 0px ${COLORS.accentMid}`,
          transition: 'all 0.05s linear',
          justifyContent: 'flex-start',
          '&:hover': {
            backgroundColor: 'rgba(203, 211, 214, 0.05)',
          },
          '&:active': {
            transform: 'translate(4px, 4px)',
            boxShadow: `0px 0px 0px transparent`,
          }
        }}
      >
        {`> RECOMENDAR_PELÍCULA`}
      </Button>

      <RecommendationMovieModal
        open={isRecommendationModalOpen}
        onClose={() => setIsRecommendationModalOpen(false)}
        movie={movie}
      />

      {/* 4. Logo Flotante */}
      {logoUrl && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Box
            component="img"
            src={logoUrl}
            alt={`Logo de ${movie.title}`}
            sx={{
              maxWidth: '80%',
              maxHeight: '90px', // Limitado para no estorbar visualmente
              objectFit: 'contain',
              filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))'
            }}
          />
        </Box>
      )}

    </Box>
  );
}
