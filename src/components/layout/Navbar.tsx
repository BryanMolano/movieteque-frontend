import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { COLORS } from '../../theme/AppTheme';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'GRUPOS' },
    { path: '/movies', label: 'PELÍCULAS' },
    { path: '/users', label: 'USUARIOS' },
    { path: '/notifications', label: 'NOTIFICACIONES' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('movieteque-token');
    localStorage.removeItem('movieteque-user');
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: COLORS.primaryDark,
        borderBottom: `2px solid ${COLORS.primaryMid}`,
        boxShadow: `0px 6px 0px ${COLORS.accentDark}`, // Sombra sólida inferior
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h5"
          color={COLORS.primaryLight}
          sx={{ fontWeight: 900, letterSpacing: '-1.5px', textShadow: `2px 2px 0px ${COLORS.accentMid}`, cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          MOVIETEQUE
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                disableRipple
                onClick={() => navigate(item.path)}
                sx={{
                  color: isActive ? COLORS.primaryDark : COLORS.primaryLight,
                  backgroundColor: isActive ? COLORS.primaryLight : 'transparent',
                  border: `2px solid ${isActive ? COLORS.primaryLight : 'transparent'}`,
                  borderRadius: 0,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
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
          })}

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
            SALIR
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
