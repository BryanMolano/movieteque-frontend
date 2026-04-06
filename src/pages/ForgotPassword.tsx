import { useState } from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { RetroInput } from '../components/ui/RetroInput';
import { COLORS } from '../theme/AppTheme';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { movietequeApi } from '../api/MovietequeApi';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from 'react-i18next';

interface FormErrorEmail {
  email?: string;
}
interface FormErrors {
  resetToken?: string;
  newPassword?: string;
}

export function ForgotPassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [step, setStep] = useState<1 | 2>(1);
  const [savedEmail, setSavedEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formErrorEmail, setFormErrorEmail] = useState<FormErrorEmail>({});

  const sendToken = useMutation({
    mutationFn: async () => {
      const response = await movietequeApi.post(`/auth/forgot-password`, { email: savedEmail });
      return response.data;
    },
    onSuccess: () => {
      setStep(2);
      showToast(t('forgotPassword.codeSent', '[OK] CÓDIGO ENVIADO AL CORREO'), 'success');
    },
    onError: (error) => {
      let isSpecificFieldError = false;
      const newErrors: FormErrorEmail = {};

      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.message;

        if (Array.isArray(backendMessage)) {
          backendMessage.forEach((msg: string) => {
            if (msg.toLowerCase().includes('email')) newErrors.email = msg;
          });
        } else if (typeof backendMessage === 'string') {
          const lowermsg = backendMessage.toLowerCase();
          if (lowermsg.includes('email') || lowermsg.includes('account')) {
            newErrors.email = backendMessage;
            isSpecificFieldError = true;
          }

          if (!isSpecificFieldError) {
            showToast(`${t('editUserProfile.serverError', '[ERROR DEL SERVIDOR]')} ${backendMessage}`, 'error');
          }
        }
      } else {
        showToast(t('editUserProfile.serverError', '[ERROR DEL SERVIDOR]'), 'error');
      }
      setFormErrorEmail(newErrors);
    }
  });

  const resetPassword = useMutation({
    mutationFn: async () => {
      const response = await movietequeApi.post(`/auth/reset-password`, {
        email: savedEmail,
        resetToken: resetToken,
        newPassword: newPassword
      });
      return response.data;
    },
    onSuccess: () => {
      showToast(t('forgotPassword.success', '[OK] CONTRASEÑA ACTUALIZADA. INICIA SESIÓN.'), 'success');
      navigate('/login');
    },
    onError: (error) => {
      let isSpecificFieldError = false;
      const newErrors: FormErrors = {};

      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.message;

        if (Array.isArray(backendMessage)) {
          backendMessage.forEach((msg: string) => {
            // Buscamos 'token' o 'password' en el array de errores de Zod/Class-validator
            if (msg.toLowerCase().includes('token')) newErrors.resetToken = msg;
            if (msg.toLowerCase().includes('password')) newErrors.newPassword = msg;
          });
        } else if (typeof backendMessage === 'string') {
          const lowermsg = backendMessage.toLowerCase();
          if (lowermsg.includes('token')) {
            newErrors.resetToken = backendMessage;
            isSpecificFieldError = true;
          } else if (lowermsg.includes('password')) {
            newErrors.newPassword = backendMessage;
            isSpecificFieldError = true;
          }

          if (!isSpecificFieldError) {
            showToast(`${t('editUserProfile.serverError', '[ERROR DEL SERVIDOR]')} ${backendMessage}`, 'error');
          }
        }
      } else {
        showToast(t('editUserProfile.serverError', '[ERROR DEL SERVIDOR]'), 'error');
      }
      setFormErrors(newErrors);
    }
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedEmail.trim()) {
      setFormErrorEmail({ email: t('validation.emailRequired', 'El correo es requerido') });
      return;
    }
    sendToken.mutate();
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword.trim()) {
      setFormErrors({
        resetToken: !resetToken.trim() ? t('validation.required', 'Requerido') : undefined,
        newPassword: !newPassword.trim() ? t('validation.required', 'Requerido') : undefined,
      });
      return;
    }
    resetPassword.mutate();
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: COLORS.primaryDark, padding: 2 }}>
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            padding: 4, display: 'flex', flexDirection: 'column', gap: 3,
            backgroundColor: COLORS.primaryDark, borderRadius: 0,
            border: `2px solid ${COLORS.primaryMid}`, boxShadow: `10px 10px 0px ${COLORS.accentDark}`,
          }}
        >
          <Typography variant="h5" align="center" color={COLORS.primaryLight} sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
            {step === 1 ? t('forgotPassword.titleStep1', 'RECUPERAR ACCESO') : t('forgotPassword.titleStep2', 'NUEVA CONTRASEÑA')}
          </Typography>

          <Typography variant="body2" align="center" color={COLORS.primaryMid} sx={{ mb: 1, minHeight: '40px' }}>
            {step === 1
              ? t('forgotPassword.descStep1', 'Ingresa tu correo para recibir un código de recuperación.')
              : t('forgotPassword.descStep2', { email: savedEmail })}
          </Typography>

          {step === 1 ? (
            // --- FORMULARIO PASO 1 ---
            <Box component="form" onSubmit={handleStep1Submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <RetroInput
                label={t('forgotPassword.emailLabel', 'Correo electrónico')}
                type="email"
                value={savedEmail}
                onChange={(e) => {
                  setSavedEmail(e.target.value);
                  if (formErrorEmail.email) setFormErrorEmail({}); // Limpia error al escribir
                }}
                error={!!formErrorEmail.email}
                helperText={formErrorEmail.email}
                disabled={sendToken.isPending}
              />
              <Button
                type="submit"
                disabled={sendToken.isPending}
                sx={{ ...mechanicalBtnSx, bgcolor: COLORS.primaryLight, color: COLORS.primaryDark, mt: 1 }}
              >
                {sendToken.isPending ? t('forgotPassword.sendingBtn', 'ENVIANDO...') : t('forgotPassword.sendBtn', 'ENVIAR CÓDIGO')}
              </Button>
            </Box>
          ) : (
            // --- FORMULARIO PASO 2 ---
            <Box component="form" onSubmit={handleStep2Submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <RetroInput
                label={t('forgotPassword.tokenLabel', 'Código de recuperación (6 dígitos)')}
                type="text"
                value={resetToken}
                onChange={(e) => {
                  setResetToken(e.target.value);
                  if (formErrors.resetToken) setFormErrors({ ...formErrors, resetToken: undefined });
                }}
                error={!!formErrors.resetToken}
                helperText={formErrors.resetToken}
                disabled={resetPassword.isPending}
              />
              <RetroInput
                label={t('forgotPassword.newPasswordLabel', 'Nueva contraseña')}
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (formErrors.newPassword) setFormErrors({ ...formErrors, newPassword: undefined });
                }}
                error={!!formErrors.newPassword}
                helperText={formErrors.newPassword}
                disabled={resetPassword.isPending}
              />
              <Button
                type="submit"
                disabled={resetPassword.isPending}
                sx={{ ...mechanicalBtnSx, bgcolor: COLORS.primaryLight, color: COLORS.primaryDark, mt: 1 }}
              >
                {resetPassword.isPending ? t('forgotPassword.savingBtn', 'GUARDANDO...') : t('forgotPassword.executeBtn', 'CAMBIAR CONTRASEÑA')}
              </Button>
            </Box>
          )}

          <Button
            disableRipple
            onClick={() => navigate('/login')}
            disabled={sendToken.isPending || resetPassword.isPending}
            sx={{
              mt: 1, color: COLORS.primaryMid, fontFamily: 'monospace', textTransform: 'none',
              '&:hover': { backgroundColor: 'transparent', color: COLORS.primaryLight, textDecoration: 'underline' }
            }}
          >
            {t('forgotPassword.backToLogin', 'Volver al inicio de sesión')}
          </Button>

        </Paper>
      </Container>
    </Box>
  );
}

const mechanicalBtnSx = {
  py: 1.5,
  border: `2px solid ${COLORS.primaryMid}`,
  boxShadow: `4px 4px 0px ${COLORS.accentMid}`,
  fontWeight: 900,
  fontFamily: 'monospace',
  fontSize: '1rem',
  transition: 'all 0.05s linear',
  '&:hover': { bgcolor: '#ffffff', color: COLORS.primaryDark },
  '&:active': {
    transform: 'translate(3px, 3px)',
    boxShadow: `1px 1px 0px ${COLORS.accentMid}`,
  },
  '&.Mui-disabled': {
    color: COLORS.primaryDark,
    border: `2px solid ${COLORS.primaryDark}`,
    boxShadow: 'none'
  }
};
