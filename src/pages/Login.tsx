import { useEffect, useState } from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { RetroInput } from '../components/ui/RetroInput';
import { COLORS } from '../theme/AppTheme';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { movietequeApi } from '../api/MovietequeApi';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const loginSchema = z.object({
  email: z.string()
    .min(1, { message: 'validation.emailRequired' })
    .email({ message: 'validation.emailInvalid' }),
  password: z.string().min(6, { message: 'validation.passwordMin' }),
  username: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoginView, setIsLoginView] = useState(true);
  const [searchParams] = useSearchParams();

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    clearErrors();
  };

  const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const movietequeAuthToken = localStorage.getItem('movieteque-token');
    if (movietequeAuthToken) navigate('/dashboard', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const inviteToken = searchParams.get('invite');
    if (inviteToken) {
      localStorage.setItem('pending-invite', inviteToken);
    }
  }, [searchParams]);

  const authMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const endpoint = isLoginView ? '/auth/login' : '/auth/register';
      const payload = isLoginView
        ? { email: data.email, password: data.password }
        : { email: data.email, password: data.password, username: data.username };

      const response = await movietequeApi.post(endpoint, payload);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('movieteque-token', data.token);
      localStorage.setItem('movieteque-user', JSON.stringify({ id: data.id, email: data.email }));
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      let isSpecificFieldError = false;
      let generalErrorMessage = 'Error de conexión con el servidor';

      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data.message;

        if (Array.isArray(backendMessage)) {
          backendMessage.forEach((msg: string) => {
            const lowerMsg = msg.toLowerCase();
            if (lowerMsg.includes('email')) {
              setError('email', { type: 'server', message: msg });
              isSpecificFieldError = true;
            }
            if (lowerMsg.includes('password')) {
              setError('password', { type: 'server', message: msg });
              isSpecificFieldError = true;
            }
            if (lowerMsg.includes('username')) {
              setError('username', { type: 'server', message: msg });
              isSpecificFieldError = true;
            }
          });
        }
        else if (typeof backendMessage === 'string') {
          const lowerMsg = backendMessage.toLowerCase();
          if (lowerMsg.includes('email')) {
            setError('email', { type: 'server', message: backendMessage });
            isSpecificFieldError = true;
          } else if (lowerMsg.includes('password')) {
            setError('password', { type: 'server', message: backendMessage });
            isSpecificFieldError = true;
          } else if (lowerMsg.includes('username')) {
            setError('username', { type: 'server', message: backendMessage });
            isSpecificFieldError = true;
          } else {
            generalErrorMessage = backendMessage;
          }
        }
      } else if (error instanceof Error) {
        generalErrorMessage = error.message;
      }

      if (!isSpecificFieldError) {
        showToast(generalErrorMessage, 'error');
      }
    }
  });

  const onSubmit = (data: LoginFormData) => {
    if (!isLoginView && (!data.username || data.username.trim() === '')) {
      setError('username', { type: 'manual', message: 'validation.usernameRequired' });
      return;
    }
    authMutation.mutate(data);
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
          <Typography
            variant="h4" align="center" color={COLORS.primaryLight}
            sx={{ fontWeight: 900, letterSpacing: '-1.5px', textTransform: 'uppercase', textShadow: `2px 2px 0px ${COLORS.accentMid}` }}
          >
            Movieteque
          </Typography>

          <Typography variant="body2" align="center" color={COLORS.primaryMid} sx={{ mb: 1, fontFamily: 'monospace' }}>
            {isLoginView ? t('login.signInView') : t('login.signUpView')}
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {!isLoginView && (
              <RetroInput
                label={t('login.usernameLabel')}
                {...register('username')}
                error={!!errors.username}
                // Si incluye espacios, asumimos que viene del backend en duro y lo mostramos tal cual.
                helperText={errors.username?.message ? (errors.username.message.includes(' ') ? errors.username.message : t(errors.username.message)) : undefined}
                disabled={authMutation.isPending}
              />
            )}

            <RetroInput
              label={t('login.emailLabel')} type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message ? (errors.email.message.includes(' ') ? errors.email.message : t(errors.email.message)) : undefined}
              disabled={authMutation.isPending}
            />

            <RetroInput
              label={t('login.passwordLabel')} type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message ? (errors.password.message.includes(' ') ? errors.password.message : t(errors.password.message)) : undefined}
              disabled={authMutation.isPending}
            />
            {/* NUEVO */}
            {isLoginView && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                <Button
                  disableRipple
                  onClick={() => navigate('/forgotPassword')}
                  sx={{
                    color: COLORS.primaryMid, fontFamily: 'monospace', textTransform: 'none',
                    fontSize: '0.85rem', minWidth: 0, padding: 0,
                    '&:hover': { backgroundColor: 'transparent', color: COLORS.primaryLight, textDecoration: 'underline' }
                  }}
                >
                  {t('login.forgotPasswordBtn', '¿Olvidaste tu contraseña?')}
                </Button>
              </Box>
            )}

            <Button
              type="submit" fullWidth disableRipple disabled={authMutation.isPending}
              sx={{
                mt: 1, py: 1.5,
                backgroundColor: authMutation.isPending ? COLORS.primaryMid : COLORS.primaryLight,
                color: COLORS.primaryDark, borderRadius: 0,
                border: `2px solid ${authMutation.isPending ? COLORS.primaryMid : COLORS.primaryLight}`,
                boxShadow: authMutation.isPending ? 'none' : `5px 5px 0px ${COLORS.accentMid}`,
                fontWeight: '900', fontFamily: 'monospace', fontSize: '1.2rem', transition: 'all 0.05s linear',
                '&:hover': { backgroundColor: authMutation.isPending ? COLORS.primaryMid : '#ffffff' },
                '&:active': {
                  boxShadow: authMutation.isPending ? 'none' : `2px 2px 0px ${COLORS.accentMid}`,
                  transform: authMutation.isPending ? 'none' : 'translate(3px, 3px)'
                },
                '&.Mui-disabled': { color: COLORS.primaryDark, border: `2px solid ${COLORS.primaryDark}` }
              }}
            >
              {authMutation.isPending ? t('login.processing') : (isLoginView ? t('login.enterBtn') : t('login.registerBtn'))}
            </Button>
          </Box>

          <Button
            disableRipple onClick={toggleView} disabled={authMutation.isPending}
            sx={{
              mt: 1, color: COLORS.primaryLight, fontFamily: 'monospace', textTransform: 'none',
              borderRadius: 0, justifyContent: 'center', // Centrado para equilibrar el espacio extra
              '&:hover': { backgroundColor: 'transparent', color: '#fff', textDecoration: 'underline', textDecorationThickness: '2px' },
              '&.Mui-disabled': { opacity: 0.5 }
            }}
          >
            {isLoginView ? t('login.noAccount') : t('login.hasAccount')}
          </Button>

        </Paper>
      </Container>
    </Box>
  );
}
