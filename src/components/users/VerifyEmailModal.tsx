import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';
import { RetroInput } from '../ui/RetroInput';
import { COLORS } from '../../theme/AppTheme';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { movietequeApi } from '../../api/MovietequeApi';
import { useToast } from '../../contexts/ToastContext';
import { useTranslation } from 'react-i18next';
import type { User } from '../../interfaces/User';

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null | undefined;
}

export function VerifyEmailModal({ open, onClose, user }: Props) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2>(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

  // // Reiniciamos el estado cada vez que se abre el modal
  // useEffect(() => {
  //   if (open) {
  //     setStep(1);
  //     setVerificationCode('');
  //     setErrorMsg(undefined);
  //   }
  // }, [open]);

  // --- MUTACIÓN 1: ENVIAR CÓDIGO ---
  const sendCodeMutation = useMutation({
    mutationFn: async () => {
      // No mandamos body porque el backend lee el usuario del JWT
      const response = await movietequeApi.post(`/user/verify-email`);
      return response.data;
    },
    onSuccess: () => {
      setStep(2);
      showToast(t('verifyEmail.codeSent', '[OK] CÓDIGO ENVIADO AL CORREO'), 'success');
    },
    onError: (error) => {
      let serverMessage = t('editUserProfile.serverError', '[ERROR DEL SERVIDOR]');
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.message;
        serverMessage = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage;
      }
      showToast(`${serverMessage}`, 'error');
    }
  });

  // --- MUTACIÓN 2: VERIFICAR CÓDIGO ---
  const verifyCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await movietequeApi.post(`/user/verify-email-code`, {
        verificationCode: verificationCode,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      showToast(t('verifyEmail.success', '[OK] CORREO VERIFICADO CON ÉXITO'), 'success');
      onClose(); // Cerramos el modal al terminar
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.message;
        const msgStr = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage;

        if (msgStr.toLowerCase().includes('code') || msgStr.toLowerCase().includes('código')) {
          setErrorMsg(msgStr);
        } else {
          showToast(`${t('editUserProfile.serverError', '[ERROR DEL SERVIDOR]')} ${msgStr}`, 'error');
        }
      } else {
        showToast(t('editUserProfile.serverError', '[ERROR DEL SERVIDOR]'), 'error');
      }
    }
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    sendCodeMutation.mutate();
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setErrorMsg(t('validation.required', 'Requerido'));
      return;
    }
    verifyCodeMutation.mutate();
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          border: `2px solid ${COLORS.primaryMid}`,
          boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
          backgroundColor: COLORS.primaryDark,
          borderRadius: 0,
          maxWidth: '400px',
          width: '100%'
        }
      }}
    >
      {/* ENCABEZADO */}
      <Box sx={{ p: 3, pb: 1, borderBottom: `2px solid ${COLORS.primaryMid}` }}>
        <Typography color={COLORS.primaryLight} sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '1.5rem', fontFamily: 'sans-serif' }}>
          {step === 1
            ? t('verifyEmail.titleStep1', '[ VERIFICAR CORREO ]')
            : t('verifyEmail.titleStep2', '[ VALIDAR CÓDIGO ]')}
        </Typography>
      </Box>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 4, pb: 4 }}>

        {step === 1 ? (
          // --- PASO 1: ENVIAR CÓDIGO ---
          <Box component="form" onSubmit={handleStep1Submit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ border: `1px dashed ${COLORS.primaryMid}`, p: 2, backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <Typography color={COLORS.primaryMid} sx={{ mb: 1, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                {t('verifyEmail.infoText', 'SE ENVIARÁ UN CÓDIGO DE 6 DÍGITOS A LA SIGUIENTE DIRECCIÓN:')}
              </Typography>
              <Typography color={COLORS.primaryLight} sx={{ fontWeight: 'bold', wordBreak: 'break-all' }}>
                {user.email}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button disableRipple onClick={onClose} sx={{ ...mechanicalBtnSx, flex: 1, color: COLORS.primaryMid, backgroundColor: 'transparent' }}>
                {t('verifyEmail.cancelBtn', 'CANCELAR')}
              </Button>
              <Button
                type="submit"
                disabled={sendCodeMutation.isPending}
                sx={{ ...mechanicalBtnSx, flex: 2, bgcolor: COLORS.primaryLight, color: COLORS.primaryDark }}
              >
                {sendCodeMutation.isPending ? t('verifyEmail.sendingBtn', 'ENVIANDO...') : t('verifyEmail.sendBtn', 'ENVIAR CÓDIGO')}
              </Button>
            </Box>
          </Box>
        ) : (
          // --- PASO 2: VALIDAR CÓDIGO ---
          <Box component="form" onSubmit={handleStep2Submit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography color={COLORS.primaryMid} sx={{ fontSize: '0.9rem' }}>
              {t('verifyEmail.descStep2', { email: user.email })}
            </Typography>

            <RetroInput
              label={t('verifyEmail.codeLabel', 'CÓDIGO DE 6 DÍGITOS')}
              type="text"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value);
                if (errorMsg) setErrorMsg(undefined);
              }}
              error={!!errorMsg}
              helperText={errorMsg}
              disabled={verifyCodeMutation.isPending}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button disableRipple onClick={onClose} sx={{ ...mechanicalBtnSx, flex: 1, color: COLORS.primaryMid, backgroundColor: 'transparent' }}>
                {t('verifyEmail.cancelBtn', 'CANCELAR')}
              </Button>
              <Button
                type="submit"
                disabled={verifyCodeMutation.isPending}
                sx={{ ...mechanicalBtnSx, flex: 2, bgcolor: COLORS.primaryLight, color: COLORS.primaryDark }}
              >
                {verifyCodeMutation.isPending ? t('verifyEmail.verifyingBtn', 'VERIFICANDO...') : t('verifyEmail.verifyBtn', 'VERIFICAR')}
              </Button>
            </Box>
          </Box>
        )}

      </DialogContent>
    </Dialog>
  );
}

const mechanicalBtnSx = {
  py: 1.5,
  border: `2px solid ${COLORS.primaryMid}`,
  boxShadow: `4px 4px 0px ${COLORS.accentMid}`,
  fontWeight: 900,
  fontFamily: 'monospace',
  fontSize: '0.9rem',
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
