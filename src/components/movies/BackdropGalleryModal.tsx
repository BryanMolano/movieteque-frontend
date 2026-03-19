import { Box, Button, Modal, Typography } from '@mui/material';
import { COLORS } from '../../theme/AppTheme';
import type { MovieImages } from '../../interfaces/MovieDetails';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
  backdrops: MovieImages[];
}

export function BackdropsGallery({ open, backdrops, onClose }: Props) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentBackdrop = backdrops[currentIndex];

  const handleNext = () => {
    if (currentIndex < backdrops.length - 1) {
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

  const imageUrl = currentBackdrop
    ? `https://image.tmdb.org/t/p/original${currentBackdrop.file_path}`
    : '';

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-backdrops"
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
          boxShadow: `12px 12px 0px ${COLORS.accentDark}`,
          p: { xs: 2, md: 4 },

          maxWidth: '1400px',
          width: '95%',
          maxHeight: '95vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          margin: '0 auto',
          outline: 'none',
        }}
      >
        {/* HEADER DEL MODAL */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${COLORS.primaryMid}`, pb: 1 }}>
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontWeight: 900 }}>
            {`${t('galleryModals.backdropsTitle')} : ${currentIndex + 1} / ${backdrops.length} ]`}
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
              '&:hover': { color: '#FF0000', backgroundColor: 'transparent' }
            }}
          >
            [ X ]
          </Button>
        </Box>

        {/* ÁREA CENTRAL: BOTONES Y BACKDROP */}
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
              flexShrink: 0,
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
            {`<`}
          </Button>

          <Box
            component="img"
            src={imageUrl}
            alt={`Backdrop ${currentIndex + 1}`}
            loading="lazy"
            sx={{
              width: '100%',
              maxWidth: 'calc(100% - 140px)',
              height: 'auto',

              maxHeight: 'calc(95vh - 120px)',

              aspectRatio: '16 / 9',
              objectFit: 'contain',

              display: 'block',

              border: `2px solid ${COLORS.primaryMid}`,
              backgroundColor: '#000',
              mx: 'auto'
            }}
          />

          {/* BOTÓN DERECHO */}
          <Button
            disableRipple
            onClick={handleNext}
            disabled={currentIndex === backdrops.length - 1}
            sx={{
              minWidth: 'auto',
              width: 50,
              height: 50,
              borderRadius: 0,
              flexShrink: 0,
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
