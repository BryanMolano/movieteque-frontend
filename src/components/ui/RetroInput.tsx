import { TextField, type TextFieldProps } from '@mui/material'; // <-- Agregamos 'type' aquí
import { COLORS } from '../../theme/AppTheme';

export const RetroInput = (props: TextFieldProps) => (
  <TextField
    {...props}
    variant="outlined"
    size="small"
    // Usamos la nueva API 'slotProps' en lugar de las obsoletas
    slotProps={{
      inputLabel: { sx: { color: COLORS.primaryMid, fontWeight: 'bold' } },
      input: { sx: { color: COLORS.primaryLight, fontSize: '1.1rem' } }
    }}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 0,
        '& fieldset': { border: `2px solid ${COLORS.primaryMid}` },
        '&:hover fieldset': { borderColor: COLORS.primaryLight },
        '&.Mui-focused fieldset': { borderColor: COLORS.primaryLight },
      },
    }}
  />
);
