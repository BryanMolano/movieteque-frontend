import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { movietequeApi } from "../../api/MovietequeApi";
import { Box, Button, Dialog, DialogActions, DialogContent, MenuItem, TextField, Typography } from "@mui/material";
import { COLORS } from "../../theme/AppTheme";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import type { Group } from "../../interfaces/Group";
import { useToast } from "../../contexts/ToastContext";
import axios from "axios";

interface Props {
  open: boolean;
  onClose: () => void;
  group: Group | null | undefined;
}

interface FormErrors {
  name?: string;
  type?: string;
}
export function EditGroupModal({ open, onClose, group }: Props) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [name, setName] = useState(group?.name || '');
  const [type, setType] = useState<'PUBLIC' | 'PRIVATE'>(group?.type || 'PRIVATE')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const editGroupMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await movietequeApi.patch(`/group/${group?.id}`, formData)
      return response.data;
    },
    onSuccess: () => {
      onClose()
      queryClient.invalidateQueries({ queryKey: ['group', group?.id] })
      showToast(t('editGroup.success'), 'success')
    },
    onError: (error) => {
      let serverErrors = {}
      if (axios.isAxiosError(error)) {
        serverErrors = (error.response?.data)?.message;
      }
      if (Array.isArray(serverErrors)) {
        const newErrors: FormErrors = {}
        serverErrors.forEach((msg: string) => {
          if (msg.includes('name'))
            newErrors.name = msg;
          if (msg.includes('type'))
            newErrors.type = msg;
        });
        setFormErrors(newErrors)
      }
      else if (typeof serverErrors === 'string') {
        showToast(`[ERROR] ${serverErrors}`, 'error')
      }
      else {
        showToast(t('editGroup.criticalError'), 'error')
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
    if (!name) return alert('the name is required')
    const formData = new FormData();
    formData.append('name', name)
    formData.append('type', type)
    if (imageFile) {
      formData.append('image', imageFile)
    }
    editGroupMutation.mutate(formData)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          border: `2px solid ${COLORS.primaryMid}`,
          boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
          backgroundColor: COLORS.primaryDark, // ✅ Fondo oscuro
          borderRadius: 0, // ✅ Brutalismo puro
          maxWidth: '500px',
          width: '100%'
        }
      }}
    >
      <form onSubmit={handleSubmit}>

        {/* ENCABEZADO */}
        <Box sx={{ p: 3, pb: 1, borderBottom: `2px solid ${COLORS.primaryMid}` }}>
          <Typography color={COLORS.primaryLight} sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '1.5rem', fontFamily: 'sans-serif' }}>
            {t('editGroup.title', '[ EDITAR_GRUPO ]')}
          </Typography>
        </Box>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 4 }}>

          <TextField
            label={t('createGroup.nameLabel', 'NOMBRE DEL GRUPO')}
            fullWidth
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
            }}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={inputSx}
          />

          <TextField
            select
            label={t('createGroup.typeLabel', 'TIPO DE GRUPO')}
            fullWidth
            value={type}
            onChange={(e) => setType(e.target.value as 'PUBLIC' | 'PRIVATE')}
            sx={inputSx}
          >
            <MenuItem value="PUBLIC">{t('createGroup.typePublic', 'PÚBLICO')}</MenuItem>
            <MenuItem value="PRIVATE">{t('createGroup.typePrivate', 'PRIVADO')}</MenuItem>
          </TextField>

          {/* BOTÓN DE ARCHIVO */}
          <Button component="label" disableRipple sx={{ ...mechanicalBtnSx, py: 1.5, mt: 1, color: COLORS.primaryLight, backgroundColor: 'transparent' }}>
            {imageFile ? `[ ${imageFile.name} ]` : t('createGroup.selectImage', 'ACTUALIZAR IMAGEN')}
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>

        </DialogContent>

        {/* ACCIONES */}
        <DialogActions sx={{ p: 3, pt: 1, gap: 2, borderTop: `2px solid ${COLORS.primaryMid}` }}>
          <Button disableRipple onClick={onClose} sx={{ ...mechanicalBtnSx, color: COLORS.primaryMid, backgroundColor: 'transparent' }}>
            {t('createGroup.cancel', 'CANCELAR')}
          </Button>
          <Button
            disableRipple
            type="submit"
            disabled={editGroupMutation.isPending}
            sx={{
              ...mechanicalBtnSx,
              bgcolor: COLORS.primaryLight,
              color: COLORS.primaryDark,
              borderColor: COLORS.primaryLight,
              fontWeight: 900,
              '&:hover': { bgcolor: '#ffffff' }
            }}
          >
            {editGroupMutation.isPending ? t('createGroup.processing', 'GUARDANDO...') : t('createGroup.execute', 'GUARDAR CAMBIOS')}
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

