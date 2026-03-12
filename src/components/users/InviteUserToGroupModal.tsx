import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import { COLORS } from "../../theme/AppTheme"; // Ajusta la ruta
import type { Group } from "../../interfaces/Group"; // Ajusta la ruta
import { useTranslation } from "react-i18next";
import type { User } from "../../interfaces/User";

// Interfaz para las props del modal
interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | undefined;
  invitedUser: User | undefined;
}

export function InviteUserModal({ open, onClose, user, invitedUser }: InviteUserModalProps) {
  const { t } = useTranslation();


  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          border: `2px solid ${COLORS.primaryLight}`,
          boxShadow: `8px 8px 0px ${COLORS.accentDark}`,
          backgroundColor: COLORS.primaryDark,
          borderRadius: 0,
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh'
        }
      }}
    >
      {/* ENCABEZADO */}
      <Box sx={{ p: 3, pb: 2, borderBottom: `2px solid ${COLORS.primaryLight}` }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: '-1px', fontSize: '1.5rem', fontFamily: 'sans-serif', color: COLORS.primaryLight }}>
          {t('inviteModal.title')}
        </Typography>
      </Box>

      {/* CONTENIDO DEL MODAL (LISTA DE GRUPOS) */}
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3, p: 2 }}>

        {groups.length === 0 ? (
          <Typography sx={{ color: COLORS.primaryMid, fontFamily: 'monospace', fontSize: '0.9rem' }}>
            {t('inviteModal.noGroupsMsg')}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {groups.map((group) => {

              // 🧠 LÓGICA REQUERIDA AQUÍ: 
              // Determina si el usuario que estamos viendo ya está en 'group.members'
              const isAlreadyMember = false; // <-- Cambia esto por tu validación real

              return (
                <GroupRow
                  key={group.id}
                  group={group}
                  isAlreadyMember={isAlreadyMember}
                  onInvite={() => {
                    // 🧠 LÓGICA REQUERIDA AQUÍ: 
                    // Ejecuta tu mutación para invitar a este groupId
                    console.log('Invitar al grupo:', group.id);
                  }}
                />
              );
            })}
          </Box>
        )}
      </DialogContent>

      {/* ACCIONES DEL MODAL (CERRAR) */}
      <DialogActions sx={{ p: 2, borderTop: `2px solid ${COLORS.primaryMid}` }}>
        <Button
          disableRipple
          onClick={onClose}
          sx={{
            ...mechanicalBtnSx,
            width: '100%',
            borderColor: COLORS.primaryMid,
            color: COLORS.primaryMid,
            justifyContent: 'center'
          }}
        >
          {t('inviteModal.closeBtn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- SUB-COMPONENTE PARA LA FILA DEL GRUPO ---
function GroupRow({ group, isAlreadyMember, onInvite }: { group: Group, isAlreadyMember: boolean, onInvite: () => void }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
        border: `2px solid ${COLORS.primaryMid}`,
        backgroundColor: 'transparent',
        transition: 'border-color 0.1s linear',
        '&:hover': { borderColor: isAlreadyMember ? COLORS.primaryMid : COLORS.primaryLight }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flexGrow: 1, mr: 2 }}>
        {/* Foto del grupo cuadrada */}
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            border: `2px solid ${COLORS.primaryMid}`,
            backgroundImage: `url(${group.imgUrl || 'https://via.placeholder.com/40/0B2833/CBD3D6?text=G'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mr: 2,
            opacity: isAlreadyMember ? 0.5 : 1 // Efecto visual si ya es miembro
          }}
        />
        {/* Nombre del grupo */}
        <Typography noWrap sx={{
          fontFamily: 'monospace',
          color: isAlreadyMember ? COLORS.primaryMid : COLORS.primaryLight,
          fontSize: '1rem',
          fontWeight: 'bold'
        }}>
          {group.name}
        </Typography>
      </Box>

      {/* Botón de Acción (Invitar / Ya es miembro) */}
      <Button
        disableRipple
        onClick={onInvite}
        disabled={isAlreadyMember}
        sx={{
          minWidth: 'auto',
          p: '4px 8px',
          borderRadius: 0,
          fontFamily: 'monospace',
          fontWeight: 900,
          fontSize: '0.8rem',
          transition: 'all 0.05s linear',
          border: `2px solid ${COLORS.primaryLight}`,
          backgroundColor: 'transparent',
          color: COLORS.primaryLight,
          boxShadow: `2px 2px 0px ${COLORS.accentDark}`,
          '&:hover': {
            backgroundColor: COLORS.primaryLight,
            color: COLORS.primaryDark,
          },
          '&:active': {
            transform: 'translate(2px, 2px)',
            boxShadow: `0px 0px 0px transparent`,
          },
          '&.Mui-disabled': {
            borderColor: COLORS.primaryMid,
            color: COLORS.primaryMid,
            boxShadow: 'none',
            backgroundColor: 'rgba(203, 211, 214, 0.05)'
          }
        }}
      >
        {isAlreadyMember ? t('inviteModal.alreadyMemberBtn') : t('inviteModal.inviteBtn')}
      </Button>
    </Box>
  );
}

// --- ESTILO BASE PARA BOTONES ---
const mechanicalBtnSx = {
  borderRadius: 0,
  border: `2px solid ${COLORS.primaryLight}`,
  backgroundColor: 'transparent',
  fontFamily: 'sans-serif',
  fontWeight: 900,
  fontSize: '1rem',
  letterSpacing: '-1px',
  padding: '8px 16px',
  boxShadow: `3px 3px 0px ${COLORS.accentDark}`,
  transition: 'all 0.05s linear',
  '&:hover': {
    backgroundColor: 'rgba(203, 211, 214, 0.05)',
  },
  '&:active': {
    transform: 'translate(3px, 3px)',
    boxShadow: `0px 0px 0px transparent`,
  },
};
