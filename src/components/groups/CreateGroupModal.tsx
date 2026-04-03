import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { movietequeApi } from "../../api/MovietequeApi";
import { Box, Button, Dialog, DialogActions, DialogContent, MenuItem, TextField, Typography } from "@mui/material";
import { COLORS } from "../../theme/AppTheme";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  type?: string;
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
export function CreateGroupModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(); // Iniciamos el traductor
  const [name, setName] = useState('');
  //confirmar que el default si sea private
  const [type, setType] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const createGroupMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await movietequeApi.post('/group', formData)
      return response.data;
    },
    onSuccess: (dataFromServer) => {
      console.log("grupo con id", dataFromServer.id);
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      onClose();
      setName('')
      setImageFile(null)
      setType('PRIVATE')
    },
    onError: (error: any) => {
      // alert(error.message)
      const serverErrors = error.response?.data?.message;

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

    createGroupMutation.mutate(formData)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          border: `2px solid ${COLORS.primaryMid}`,
          boxShadow: `8px 8px 0px ${COLORS.accentDark}`, // Sombra del modal
        }
      }}
    >
      <form onSubmit={handleSubmit}>

        {/* ENCABEZADO */}
        <Box sx={{ p: 3, pb: 1, borderBottom: `2px solid ${COLORS.primaryMid}` }}>
          <Typography sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '1.5rem', fontFamily: 'sans-serif' }}>
            {t('createGroup.title')}
          </Typography>
        </Box>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 4 }}>

          <TextField
            label={t('createGroup.nameLabel')}
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
            label={t('createGroup.typeLabel')}
            fullWidth
            value={type}
            onChange={(e) => setType(e.target.value as 'PUBLIC' | 'PRIVATE')}
            sx={inputSx}
          >
            <MenuItem value="PUBLIC">{t('createGroup.typePublic')}</MenuItem>
            <MenuItem value="PRIVATE">{t('createGroup.typePrivate')}</MenuItem>
          </TextField>

          {/* BOTÓN DE ARCHIVO */}
          <Button component="label" sx={{ ...mechanicalBtnSx, py: 1.5, mt: 1, color: COLORS.primaryMid }}>
            {imageFile ? `[ ${imageFile.name} ]` : t('createGroup.selectImage')}
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>

        </DialogContent>

        {/* ACCIONES */}
        <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
          <Button onClick={onClose} sx={{ ...mechanicalBtnSx, color: COLORS.primaryMid }}>
            {t('createGroup.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={createGroupMutation.isPending}
            sx={{
              ...mechanicalBtnSx,
              bgcolor: COLORS.primaryLight,
              color: COLORS.primaryDark,
              borderColor: COLORS.primaryLight,
              '&:hover': { bgcolor: '#ffffff' }
            }}
          >
            {createGroupMutation.isPending ? t('createGroup.processing') : t('createGroup.execute')}
          </Button>
        </DialogActions>

      </form>
    </Dialog>
  );

}

