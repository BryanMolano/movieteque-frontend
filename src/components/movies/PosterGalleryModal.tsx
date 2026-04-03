import { Box, Button, Modal, Typography } from '@mui/material';
import { COLORS } from '../../theme/AppTheme'; // Ajusta tu ruta
import type { MovieImages } from '../../interfaces/MovieDetails';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
  posters: MovieImages[];
}

export function PostersGallery({ open, posters, onClose }: Props) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPoster = posters[currentIndex];

  const handleNext = () => {
    if (currentIndex < posters.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  };

  const imageUrl = currentPoster
    ? `https://image.tmdb.org/t/p/original${currentPoster.file_path}`
    : '';
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-posters"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: COLORS.primaryDark,
          border: `2px solid ${COLORS.primaryMid}`,
          boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
          p: 3,
          maxWidth: '1000px',
          width: '95%',
          maxHeight: '95vh',
          overflowY: 'auto',
          margin: '0 auto',
        }}
      >
        {/* HEADER DEL MODAL */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${COLORS.primaryMid}`, pb: 1 }}>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontWeight: 900 }}>
            {`${t('galleryModals.postersTitle')} : ${currentIndex + 1} / ${posters.length} ]`}
          </Typography>

          <Button
            disableRipple
            onClick={onClose}
            sx={{
              minWidth: 'auto',
              p: 0,
              color: COLORS.primaryMid,
              fontFamily: 'monospace',
              fontWeight: 900,
              '&:hover': { color: '#FF0000', backgroundColor: 'transparent' } // Hover rojo brutalista
            }}
          >
            [ X ]
          </Button>
        </Box>

        {/* ÁREA CENTRAL: BOTONES Y PÓSTER */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>

          {/* BOTÓN IZQUIERDO */}
          <Button
            disableRipple
            onClick={handlePrev}
            disabled={currentIndex === 0}
            sx={{
              minWidth: 'auto',
              width: 50,
              height: 50,
              borderRadius: 0,
              fontFamily: 'monospace',
              fontWeight: 900,
              fontSize: '1.5rem',
              border: `2px solid ${COLORS.primaryMid}`,
              backgroundColor: COLORS.primaryDark,
              color: COLORS.primaryLight,
              boxShadow: `4px 4px 0px ${COLORS.accentMid}`,
              transition: 'all 0.05s linear',
              '&:hover': { backgroundColor: 'rgba(203, 211, 214, 0.05)', borderColor: COLORS.primaryLight },
              '&:active': { transform: 'translate(4px, 4px)', boxShadow: '0px 0px 0px transparent' },
              // Puedes usar el pseudo-clase :disabled cuando conectes la lógica
              '&:disabled': { opacity: 0.3, boxShadow: 'none', cursor: 'not-allowed' }
            }}
          >
            {`<`}
          </Button>

          {/* CONTENEDOR DE IMAGEN (CARGA PEREZOSA NATURAL) */}
          <Box
            component="img"
            src={imageUrl ? imageUrl : '/assets/placeholder-movie.png'}
            alt={`Póster ${currentIndex + 1}`}
            // Usamos el loading lazy nativo de HTML por si acaso
            loading="lazy"
            sx={{
              width: 'auto',
              maxWidth: '100%', // Evita que crezca monstruosamente
              height: 'auto',
              maxHeight: '70vh',
              aspectRatio: '2 / 3',
              objectFit: 'contain',
              border: `2px solid ${COLORS.primaryMid}`,
              backgroundColor: COLORS.primaryDark, // Fondo mientras carga
              mx: 'auto'
            }}
          />

          {/* BOTÓN DERECHO */}
          <Button
            disableRipple
            onClick={handleNext}
            disabled={currentIndex === posters.length - 1}
            sx={{
              minWidth: 'auto',
              width: 50,
              height: 50,
              borderRadius: 0,
              fontFamily: 'monospace',
              fontWeight: 900,
              fontSize: '1.5rem',
              border: `2px solid ${COLORS.primaryMid}`,
              backgroundColor: COLORS.primaryDark,
              color: COLORS.primaryLight,
              boxShadow: `4px 4px 0px ${COLORS.accentMid}`,
              transition: 'all 0.05s linear',
              '&:hover': { backgroundColor: 'rgba(203, 211, 214, 0.05)', borderColor: COLORS.primaryLight },
              '&:active': { transform: 'translate(4px, 4px)', boxShadow: '0px 0px 0px transparent' },
              '&:disabled': { opacity: 0.3, boxShadow: 'none', cursor: 'not-allowed' }
            }}
          >
            {`>`}
          </Button>

        </Box>
      </Box>
    </Modal>
  );
}
