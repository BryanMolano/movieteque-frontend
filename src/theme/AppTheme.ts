import { createTheme, type SxProps, type Theme } from '@mui/material';

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
export const mechanicalButtonStyle: SxProps<Theme> = {
  borderRadius: 0,
  border: `2px solid ${COLORS.primaryLight}`,
  backgroundColor: COLORS.primaryDark,
  color: COLORS.primaryLight,
  fontFamily: 'sans-serif',
  fontWeight: 900,
  fontSize: '1rem',
  letterSpacing: '-1.5px',
  transition: 'all 0.05s linear',
  '&:active': {
    transform: 'translate(4px, 4px)',
    boxShadow: `0px 0px 0px transparent`,
  },
  '&:hover': {
    backgroundColor: COLORS.primaryDark,
    filter: 'brightness(1.2)',
  },
};

// Estilo para los inputs tipo terminal
export const terminalInputStyle: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    fontFamily: 'monospace',
    color: COLORS.primaryLight,
    '& fieldset': {
      border: `2px solid ${COLORS.primaryMid}`,
    },
    '&:hover fieldset': {
      borderColor: COLORS.primaryLight,
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.primaryLight,
      borderWidth: '2px',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px',
  },
  '& .MuiFormHelperText-root': {
    fontFamily: 'monospace',
    color: COLORS.primaryMid,
    marginLeft: 0,
  },
  '& .MuiSelect-icon': {
    color: COLORS.primaryLight,
  }
};
