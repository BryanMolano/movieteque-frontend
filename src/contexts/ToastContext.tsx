import { createContext, useState, useContext, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { COLORS } from '../theme/AppTheme'; // Ajusta la ruta a tu tema

type ToastSeverity = 'success' | 'error' | 'info';

interface ToastContextProps {
  showToast: (message: string, severity?: ToastSeverity) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info' as ToastSeverity,
  });

  const showToast = (message: string, severity: ToastSeverity = 'info') => {
    setToast({ open: true, message, severity });
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity}
          icon={false}
          sx={{
            borderRadius: 0,
            border: `2px solid ${toast.severity === 'error' ? '#ff5555' : COLORS.primaryLight}`,
            backgroundColor: COLORS.primaryDark,
            color: toast.severity === 'error' ? '#ff5555' : COLORS.primaryLight,
            fontFamily: 'monospace',
            fontWeight: 900,
            fontSize: '1rem',
            boxShadow: `4px 4px 0px ${toast.severity === 'error' ? '#551111' : COLORS.accentMid}`,
            '& .MuiAlert-action': { color: 'inherit' }
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};
