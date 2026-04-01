import { useState } from 'react';
import { AppBar, Box, Button, Toolbar, Typography, Drawer, Stack } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../theme/AppTheme';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false); // Estado para el menú móvil

  const navItems = [
    { path: '/dashboard', label: t('navbar.groups', 'GRUPOS') },
    { path: '/movies', label: t('navbar.movies', 'PELÍCULAS') },
    { path: '/users', label: t('navbar.users', 'USUARIOS') },
  ];

  const handleLogout = () => {
    localStorage.removeItem('movieteque-token');
    localStorage.removeItem('movieteque-user');
    navigate('/login', { replace: true });
  };

  const toggleDrawer = (open: boolean) => () => {
    setMobileOpen(open);
  };

  const renderNavButtons = (isMobile = false) => (
    navItems.map((item) => {
      const isActive = location.pathname === item.path;
      return (
        <Button
          key={item.path}
          disableRipple
          onClick={() => {
            navigate(item.path);
            if (isMobile) setMobileOpen(false); // Cierra el menú en móvil al navegar
          }}
          sx={{
            justifyContent: isMobile ? 'flex-start' : 'center', // Alineado a la izquierda en móvil
            p: isMobile ? 2 : undefined, // Más espacio para tocar en el celular
            color: isActive ? COLORS.primaryDark : COLORS.primaryLight,
            backgroundColor: isActive ? COLORS.primaryLight : 'transparent',
            border: `2px solid ${isActive ? COLORS.primaryLight : 'transparent'}`,
            borderBottom: isMobile && !isActive ? `2px solid ${COLORS.primaryMid}` : undefined,
            borderRadius: 0,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: isMobile ? '1.2rem' : '1rem',
            transition: 'all 0.05s linear',
            '&:hover': {
              backgroundColor: isActive ? COLORS.primaryLight : 'rgba(203, 211, 214, 0.1)',
              borderColor: COLORS.primaryLight,
              color: isActive ? COLORS.primaryDark : COLORS.primaryLight,
            },
            '&:active': { transform: 'translate(2px, 2px)' }
          }}
        >
          {isActive ? `[ ${item.label} ]` : `> ${item.label}`}
        </Button>
      );
    })
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: COLORS.primaryDark,
        borderBottom: `2px solid ${COLORS.primaryMid}`,
        boxShadow: `0px 6px 0px ${COLORS.accentDark}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* LOGO */}
        <Typography
          variant="h5"
          color={COLORS.primaryLight}
          sx={{ fontWeight: 900, letterSpacing: '-1.5px', textShadow: `2px 2px 0px ${COLORS.accentMid}`, cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          MOVIETEQUE
        </Typography>

        {/* --- VISTA ESCRITORIO --- */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
          {renderNavButtons(false)}
          <Button
            disableRipple
            onClick={handleLogout}
            sx={{
              ml: 2, color: COLORS.primaryLight, backgroundColor: COLORS.accentDark,
              border: `2px solid ${COLORS.accentMid}`, borderRadius: 0,
              fontFamily: 'monospace', fontWeight: 'bold',
              boxShadow: `3px 3px 0px ${COLORS.accentMid}`,
              '&:active': { transform: 'translate(3px, 3px)', boxShadow: `1px 1px 0px ${COLORS.accentMid}` }
            }}
          >
            {t('navbar.logoutDesktop', 'SALIR')}
          </Button>
        </Box>

        {/* --- VISTA MÓVIL (Botón Toggle) --- */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <Button
            disableRipple
            onClick={toggleDrawer(true)}
            sx={{
              color: COLORS.primaryLight,
              border: `2px solid ${COLORS.primaryMid}`,
              borderRadius: 0,
              fontFamily: 'monospace',
              fontWeight: 900,
              boxShadow: `2px 2px 0px ${COLORS.accentMid}`,
              '&:active': { transform: 'translate(2px, 2px)', boxShadow: 'none' }
            }}
          >
            {t('navbar.menu', '[ MENU ]')}
          </Button>
        </Box>
      </Toolbar>

      {/* --- PANEL LATERAL MÓVIL (Drawer) --- */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: '85vw', // Ocupa el 85% de la pantalla
            maxWidth: '350px',
            backgroundColor: COLORS.primaryDark,
            borderLeft: `2px solid ${COLORS.primaryLight}`,
            boxShadow: `-10px 0px 0px ${COLORS.accentDark}`,
            borderRadius: 0,
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
          {/* Botón Cerrar */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              disableRipple
              onClick={toggleDrawer(false)}
              sx={{
                color: '#ff5555', border: '2px solid #ff5555', borderRadius: 0,
                fontFamily: 'monospace', fontWeight: 900, p: 1, minWidth: '40px',
                boxShadow: `3px 3px 0px #551111`,
                '&:active': { transform: 'translate(3px, 3px)', boxShadow: 'none' }
              }}
            >
              [ X ]
            </Button>
          </Box>

          {/* Links del Menú */}
          <Stack spacing={1} sx={{ flexGrow: 1 }}>
            {renderNavButtons(true)}
          </Stack>

          {/* Botón Salir en Móvil */}
          <Button
            disableRipple
            onClick={handleLogout}
            sx={{
              mt: 'auto', py: 2, color: COLORS.primaryLight, backgroundColor: COLORS.accentDark,
              border: `2px solid ${COLORS.accentMid}`, borderRadius: 0,
              fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.2rem',
              boxShadow: `4px 4px 0px ${COLORS.accentMid}`,
              '&:active': { transform: 'translate(3px, 3px)', boxShadow: `0px 0px 0px ${COLORS.accentMid}` }
            }}
          >
            {t('navbar.logoutMobile', '! SALIR DEL SISTEMA')}
          </Button>
        </Box>
      </Drawer>
    </AppBar>
  );
}
