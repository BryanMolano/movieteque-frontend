import { Box, Typography, Link, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../theme/AppTheme';

export function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        backgroundColor: COLORS.primaryDark,
        borderTop: `1px solid rgba(97, 123, 133, 0.2)`,
        py: 3,
        px: { xs: 2, md: 4 },
        mt: 'auto',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: { xs: 2, md: 0 },
        opacity: 0.6,
        transition: 'opacity 0.2s ease-in-out',
        '&:hover': { opacity: 1 }
      }}
    >
      {/* SECCIÓN TMDB */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="img"
          src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
          alt="TMDB Logo"
          sx={{ height: 12 }}
        />
        <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.65rem', maxWidth: '250px' }}>
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </Typography>
      </Box>

      {/* ENLACES LEGALES Y SOBRE EL PROYECTO */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ gap: { xs: 1.5, md: 2 } }}
      >
        <Link
          component="button"
          onClick={() => navigate('/about?tab=privacy')}
          underline="hover"
          sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '0.7rem' }}
        >
          {t('footer.privacy')}
        </Link>

        <Link
          component="button"
          onClick={() => navigate('/about?tab=terms')}
          underline="hover"
          sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '0.7rem' }}
        >
          {t('footer.terms')}
        </Link>

        {/* Enlace destacado para reclutadores - CSS Estabilizado */}
        <Link
          component="button"
          onClick={() => navigate('/about?tab=project')}
          underline="none"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: 'monospace',
            color: '#988775',
            fontWeight: 900,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            lineHeight: 1.2,
            border: `2px solid #988775`,
            px: { xs: 1, sm: 1.5 },
            py: { xs: 0.5, sm: 0.6 },
            boxShadow: `2px 2px 0px ${COLORS.accentDark}`,
            transition: 'all 0.1s linear',
            '&:hover': {
              backgroundColor: 'rgba(152, 135, 117, 0.1)'
            },
            '&:active': {
              transform: 'translate(2px, 2px)',
              boxShadow: '0px 0px 0px transparent'
            }
          }}
        >
          {t('footer.about')}
        </Link>
      </Stack>

      <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.65rem' }}>
        © {new Date().getFullYear()} Movieteque. All rights reserved.
      </Typography>
    </Box>
  );
}
