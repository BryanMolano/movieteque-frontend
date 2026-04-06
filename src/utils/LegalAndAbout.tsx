import { Box, Typography, Container, Button } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { COLORS, mechanicalButtonStyle } from '../theme/AppTheme';
import { useTranslation } from 'react-i18next';
import { Footer } from './Footer';

export function LegalAndAbout() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'project';
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: COLORS.primaryDark }}>
      <Container maxWidth="md" sx={{ flexGrow: 1, py: { xs: 4, md: 8 }, px: { xs: 2, md: 4 } }}>

        <Button
          disableRipple
          onClick={() => navigate(-1)}
          sx={{ ...mechanicalButtonStyle, mb: { xs: 3, md: 5 }, px: 3, py: 1, fontSize: '0.85rem' }}
        >
          {t('common.back', '< VOLVER')}
        </Button>

        <Typography
          sx={{
            fontFamily: 'sans-serif',
            fontWeight: 900,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            letterSpacing: '-1.5px',
            color: COLORS.primaryLight,
            borderBottom: `3px solid ${COLORS.primaryMid}`,
            pb: 1.5,
            mb: 4,
            textTransform: 'uppercase'
          }}
        >
          {activeTab === 'privacy' && t('legal.titlePrivacy')}
          {activeTab === 'terms' && t('legal.titleTerms')}
          {activeTab === 'project' && t('legal.titleProject')}
        </Typography>

        <Box
          sx={{
            color: COLORS.primaryLight,
            fontFamily: 'monospace',
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            lineHeight: 1.8,
            '& h2': { color: COLORS.accentMid, mt: 5, mb: 2, fontFamily: 'sans-serif', letterSpacing: '-0.5px', fontSize: { xs: '1.3rem', md: '1.5rem' } },
            '& p': { mb: 2 },
            '& ul': { pl: 3, mb: 3 },
            '& li': { mb: 1 },
            '& strong': { color: COLORS.accentLight }
          }}
        >

          {activeTab === 'privacy' && (
            <>
              <h2>{t('legal.privacy.h1')}</h2>
              <p>{t('legal.privacy.p1')}</p>
              <p>{t('legal.privacy.p2')}</p>

              <h2>{t('legal.privacy.h2')}</h2>
              <p><strong>{t('legal.privacy.p3')}</strong></p>

              <h2>{t('legal.privacy.h3')}</h2>
              <ul>
                <li><strong>Sesiones:</strong> {t('legal.privacy.li1').split(':')[1]}</li>
                <li><strong>Infraestructura:</strong> {t('legal.privacy.li2').split(':')[1]}</li>
                <li><strong>TMDB:</strong> {t('legal.privacy.li3').split(':')[1]}</li>
              </ul>
            </>
          )}

          {activeTab === 'terms' && (
            <>
              <h2>{t('legal.terms.h1')}</h2>
              <p>{t('legal.terms.p1')}</p>

              <h2>{t('legal.terms.h2')}</h2>
              <p>{t('legal.terms.p2')}</p>
            </>
          )}

          {activeTab === 'project' && (
            <>
              <h2>{t('legal.project.h1')}</h2>
              <p>{t('legal.project.p1')}</p>
              <p>{t('legal.project.p2')}</p>
              <p>{t('legal.project.p3')}</p>

              <h2>{t('legal.project.h2')}</h2>
              <ul>
                <li><strong>Frontend:</strong> {t('legal.project.li1').split(':')[1]}</li>
                <li><strong>Backend:</strong> {t('legal.project.li2').split(':')[1]}</li>
                <li><strong>Inf:</strong> {t('legal.project.li3').split(':')[1]}</li>
                <li><strong>APIs:</strong> {t('legal.project.li4').split(':')[1]}</li>
              </ul>

              <h2>{t('legal.project.h3')}</h2>
              <p>{t('legal.project.p4')}</p>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 4, alignItems: { xs: 'stretch', sm: 'flex-start' } }}>
                <Button
                  component="a"
                  href="https://github.com/BryanMolano/movieteque"
                  target="_blank"
                  disableRipple
                  sx={{
                    ...mechanicalButtonStyle,
                    borderColor: COLORS.accentMid,
                    color: COLORS.accentMid,
                    boxShadow: `4px 4px 0px ${COLORS.accentDark}`,
                    textAlign: 'center',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: COLORS.primaryLight,
                      borderColor: COLORS.primaryLight
                    }
                  }}
                >
                  {t('legal.project.btn')}
                </Button>

                <Button
                  component="a"
                  href="https://github.com/BryanMolano/movieteque-frontend"
                  target="_blank"
                  disableRipple
                  sx={{
                    ...mechanicalButtonStyle,
                    borderColor: COLORS.accentMid,
                    color: COLORS.accentMid,
                    boxShadow: `4px 4px 0px ${COLORS.accentDark}`,
                    textAlign: 'center',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: COLORS.primaryLight,
                      borderColor: COLORS.primaryLight
                    }
                  }}
                >
                  {t('legal.project.btn2')}
                </Button>
              </Box>
            </>
          )}

        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
