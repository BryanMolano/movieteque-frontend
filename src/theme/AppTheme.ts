import { createTheme } from '@mui/material';

export const COLORS = {
  primaryDark: '#0B2833',
  primaryMid: '#617B85',
  primaryLight: '#CBD3D6',
  accentDark: '#595149',
  accentMid: '#988775',
  accentLight: '#D6D1CB',
};

export const appTheme = createTheme({
  palette: {
    mode: 'dark', // Establece una base oscura
    primary: { main: COLORS.primaryLight },
    background: { default: COLORS.primaryDark, paper: COLORS.primaryDark },
  },
  typography: {
    fontFamily: 'monospace', // Aplicamos monospace a TODA la app
  },
  components: {
    MuiButton: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'uppercase',
          fontWeight: 900,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundImage: 'none', // Quita el degradado grisáceo de MUI en modo oscuro
        },
      },
    },
  },
});
