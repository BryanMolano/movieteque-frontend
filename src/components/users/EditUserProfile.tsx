import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { movietequeApi } from "../../api/MovietequeApi";
import { Box, Button, Dialog, DialogActions, DialogContent, MenuItem, TextField, Typography } from "@mui/material";
import { COLORS } from "../../theme/AppTheme";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import type { User } from "../../interfaces/User";
import type { AxiosError } from "axios";
import axios from "axios";
import { useToast } from "../../contexts/ToastContext";

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null | undefined;
  groupId: string | null;
}

interface FormErrors {
  username?: string;
  description?: string;
  oldPassword?: string;
  newPassword?: string;
}
export function EditUserProfile({ open, onClose, user }: Props) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation(); // Iniciamos el traductor
  const [username, setUserName] = useState(user?.username || '');
  const [description, setDescription] = useState(user?.description || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const editUserProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await movietequeApi.patch('/user', formData)
      return response.data;
    },
    onSuccess: (dataFromServer) => {
      onClose();
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] })
      showToast('[OK] PERFIL ACTUALIZADO', 'success')
    },
    onError: (error) => {
      let serverErrors = {}
      if (axios.isAxiosError(error)) {
        serverErrors = (error.response?.data)?.message;
      }
      if (Array.isArray(serverErrors)) {
        const newErrors: FormErrors = {}
        serverErrors.forEach((msg: string) => {
          if (msg.includes('username'))
            newErrors.username = msg;
          if (msg.includes('description'))
            newErrors.description = msg;
          if (msg.includes('oldPassword'))
            newErrors.oldPassword = msg;
          if (msg.includes('newPassword'))
            newErrors.newPassword = msg;
        });
        setFormErrors(newErrors)
      }
      else if (typeof serverErrors === 'string') {
        showToast(`[ERROR DEL SERVIDOR] ${serverErrors}`, 'error')
      }
      else {
        showToast(`[ERROR CRIRICO] No se pudo completar la operacion`, 'error')
      }
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!username) return alert('the username is required')
    const formData = new FormData();
    formData.append('username', username)
    formData.append('description', description)
    if (oldPassword && newPassword) {
      formData.append('oldPassword', oldPassword)
      formData.append('newPassword', newPassword)
    }
    if (imageFile) {
      formData.append('image', imageFile)
    }

    editUserProfileMutation.mutate(formData)
  }



  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          border: `2px solid ${COLORS.primaryMid}`,
          boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
          backgroundColor: COLORS.primaryDark, // Fondo oscuro
          borderRadius: 0, // Brutalismo puro
          maxWidth: '500px',
          width: '100%'
        }
      }}
    >
      <form onSubmit={handleSubmit}>

        {/* ENCABEZADO */}
        <Box sx={{ p: 3, pb: 1, borderBottom: `2px solid ${COLORS.primaryMid}` }}>
          <Typography color={COLORS.primaryLight} sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '1.5rem', fontFamily: 'sans-serif' }}>
            [ EDITAR_PERFIL ]
          </Typography>
        </Box>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 4 }}>

          {/* INPUT: USERNAME */}
          <TextField
            label="USERNAME"
            fullWidth
            value={username}
            onChange={(e) => {
              setUserName(e.target.value);
              if (formErrors.username) setFormErrors({ ...formErrors, username: undefined });
            }}
            error={!!formErrors.username}
            helperText={formErrors.username}
            sx={inputSx}
          />

          {/* INPUT: DESCRIPCIÓN */}
          <TextField
            label="DESCRIPCIÓN (BIO)"
            multiline
            rows={3} // Lo hacemos más grande
            fullWidth
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (formErrors.description) setFormErrors({ ...formErrors, description: undefined });
            }}
            error={!!formErrors.description}
            helperText={formErrors.description}
            sx={inputSx}
          />

          {/* SECCIÓN DE CONTRASEÑA (Separador visual) */}
          <Box sx={{ borderTop: `1px dashed ${COLORS.primaryMid}`, mt: 1, pt: 3 }}>
            <Typography color={COLORS.primaryMid} sx={{ mb: 2, fontSize: '0.85rem' }}>
              {'>'} DEJAR EN BLANCO SI NO DESEA CAMBIAR LA CONTRASEÑA
            </Typography>

            {/* INPUT: OLD PASSWORD */}
            <TextField
              label="CONTRASEÑA ACTUAL"
              type="password"
              fullWidth
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                if (formErrors.oldPassword) setFormErrors({ ...formErrors, oldPassword: undefined });
              }}
              error={!!formErrors.oldPassword}
              helperText={formErrors.oldPassword}
              sx={{ ...inputSx, mb: 3 }}
            />

            {/* INPUT: NEW PASSWORD */}
            <TextField
              label="NUEVA CONTRASEÑA"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (formErrors.newPassword) setFormErrors({ ...formErrors, newPassword: undefined });
              }}
              error={!!formErrors.newPassword}
              helperText={formErrors.newPassword}
              sx={inputSx}
            />
          </Box>

          {/* BOTÓN DE ARCHIVO (IMAGEN) */}
          <Box sx={{ borderTop: `1px dashed ${COLORS.primaryMid}`, mt: 1, pt: 3 }}>
            <Typography color={COLORS.primaryMid} sx={{ mb: 1, fontSize: '0.85rem' }}>
              {'>'} ACTUALIZAR IMAGEN DE PERFIL
            </Typography>
            <Button component="label" sx={{ ...mechanicalBtnSx, py: 1.5, width: '100%', color: COLORS.primaryLight, backgroundColor: 'transparent' }}>
              {imageFile ? `[ ${imageFile.name} ]` : 'SELECCIONAR_NUEVA_IMAGEN'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
              />
            </Button>
          </Box>

        </DialogContent>

        {/* ACCIONES */}
        <DialogActions sx={{ p: 3, pt: 1, gap: 2, borderTop: `2px solid ${COLORS.primaryMid}` }}>
          <Button disableRipple onClick={onClose} sx={{ ...mechanicalBtnSx, color: COLORS.primaryMid, backgroundColor: 'transparent' }}>
            CANCELAR
          </Button>
          <Button
            disableRipple
            type="submit"
            disabled={editUserProfileMutation.isPending}
            sx={{
              ...mechanicalBtnSx,
              bgcolor: COLORS.primaryLight,
              color: COLORS.primaryDark,
              borderColor: COLORS.primaryLight,
              fontWeight: 900,
              '&:hover': { bgcolor: '#ffffff' }
            }}
          >
            {editUserProfileMutation.isPending ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </Button>
        </DialogActions>

      </form>
    </Dialog>
  );
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { border: `2px solid ${COLORS.primaryMid}` },
    '&:hover fieldset, &.Mui-focused fieldset': { borderColor: COLORS.primaryLight },
  },
  '& .MuiInputLabel-root': {
    color: COLORS.primaryMid,
    '&.Mui-focused': { color: COLORS.primaryLight },
  }
};

const mechanicalBtnSx = {
  border: `2px solid ${COLORS.primaryMid}`,
  boxShadow: `4px 4px 0px ${COLORS.accentMid}`,
  transition: 'all 0.05s linear',
  '&:active': {
    transform: 'translate(3px, 3px)',
    boxShadow: `1px 1px 0px ${COLORS.accentMid}`,
  }
};

