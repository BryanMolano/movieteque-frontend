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
  groupId: string;
}

interface FormErrors {
  nickname?: string;
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

export function ChangeMemberNicknameModal({ open, onClose, groupId }: Props) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [nickname, setNickname] = useState('');
  //confirmar que el default si sea private

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const createGroupMutation = useMutation({
    mutationFn: async (data: { id: string, nickname: string }) => {
      const response = await movietequeApi.patch(`/group/${data.id}/changeNickname`, { nickname: data.nickname });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      onClose();
    },
    onError: (error: any) => {
      alert(error.message)
      const serverErrors = error.response?.data?.message;

      if (Array.isArray(serverErrors)) {
        const newErrors: FormErrors = {}
        serverErrors.forEach((msg: string) => {
          if (msg.includes('nickname'))
            newErrors.nickname = msg;
        });
        setFormErrors(newErrors)
      }
    }
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!nickname) return alert('the nickname is required')
    createGroupMutation.mutate({ id: groupId, nickname })
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
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              if (formErrors.nickname) setFormErrors({ ...formErrors, nickname: undefined });
            }}
            error={!!formErrors.nickname}
            helperText={formErrors.nickname}
            sx={inputSx}
          />

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


