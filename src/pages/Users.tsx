import { Box, Typography, TextField, Button, InputAdornment } from '@mui/material';
import { COLORS } from '../theme/AppTheme'; // Ajusta la ruta a tu AppTheme
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { movietequeApi } from '../api/MovietequeApi';
import type { Group } from '../interfaces/Group';
import type { User } from '../interfaces/User';
import { useSearchUser } from '../hooks/useSearchUser';
import { useTranslation } from 'react-i18next';
import { useUser } from '../hooks/useUser';


export function Users() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient()
  const { data: currentUser } = useUser();
  const [searchBar, setSearchBar] = useState('')
  const [textToSearch, setTextToSearch] = useState('')
  const { data: users, isLoading, isError } = useSearchUser(textToSearch)

  useEffect(() => {
    const timer = setTimeout(() => {
      setTextToSearch(searchBar)
    }, 500);

    return () => {
      clearTimeout(timer)
    }
  }, [searchBar])

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: COLORS.primaryDark,
      p: { xs: 2, md: 4 },
      display: 'flex',
      justifyContent: 'center'
    }}>

      {/* 1. Mientras carga, mostramos el mensaje pero el input sigue ahí arriba */}
      {/* Contenedor central limitado a 600px para que parezca una terminal limpia */}
      <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 4 }}>

        {/* ENCABEZADO Y BUSCADOR */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* --- INICIO CAMBIOS: Contenedor flex para alinear título y botón --- */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '2rem', fontFamily: 'sans-serif', color: COLORS.primaryLight, textTransform: 'uppercase' }}>
              {t('usersSearch.title', '[ BUSCAR_USUARIOS ]')}
            </Typography>

            {currentUser && (
              <Button
                disableRipple
                onClick={() => navigate(`/userProfile/${currentUser.id}`)}
                sx={{
                  minWidth: 'auto',
                  p: '4px 12px',
                  borderRadius: 0,
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  transition: 'all 0.1s linear',
                  border: `1px solid ${COLORS.primaryMid}`,
                  backgroundColor: 'transparent',
                  color: COLORS.primaryMid,
                  '&:hover': {
                    borderColor: COLORS.primaryLight,
                    color: COLORS.primaryLight,
                    backgroundColor: 'rgba(203, 211, 214, 0.05)',
                  }
                }}
              >
                {t('usersSearch.myProfile', '[ MI_PERFIL ]')}
              </Button>
            )}
          </Box>
          {/* --- FIN CAMBIOS --- */}

          <TextField
            fullWidth
            placeholder={t('usersSearch.placeholder', 'Escribe un nombre de usuario...')}
            value={searchBar} // Lo conectaremos en la lógica
            onChange={(e) => setSearchBar(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: COLORS.primaryMid, fontFamily: 'monospace', fontWeight: 'bold' }}>{'>'}</Typography>
                </InputAdornment>
              ),
            }}
            sx={inputTerminalSx}
          />
        </Box>

        {/* CONTENEDOR DE RESULTADOS */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

          {isLoading && (
            <Typography color={COLORS.primaryLight} sx={{ fontFamily: 'monospace', py: 2 }}>
              {t('usersSearch.searching', 'BUSCANDO...')}
            </Typography>
          )}
          {/* Mensaje de estado (Cargando / Sin resultados / Escriba para buscar) */}
          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, mb: 1 }}>
            {`${t('usersSearch.resultsFound', 'RESULTADOS ENCONTRADOS')} [ ${users?.length || 0} ]`}
          </Typography>

          {/* LISTA DE USUARIOS */}
          {users?.map((user) => (
            <Box
              key={user.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                border: `2px solid ${COLORS.primaryMid}`,
                backgroundColor: 'transparent',
                transition: 'all 0.1s linear',
                '&:hover': {
                  borderColor: COLORS.primaryLight,
                  backgroundColor: 'rgba(203, 211, 214, 0.05)'
                }
              }}
            >
              {/* Foto + Username */}
              <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flexGrow: 1, mr: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    border: `2px solid ${COLORS.primaryMid}`,
                    backgroundImage: `url(${user.imgUrl || 'https://via.placeholder.com/40/0B2833/CBD3D6?text=?'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    mr: 2
                  }}
                />
                <Typography noWrap sx={{ fontFamily: 'monospace', color: COLORS.primaryLight, fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {user.username}
                </Typography>
              </Box>

              {/* Botón Ver Perfil */}
              <Button
                disableRipple
                onClick={() => navigate(`/userProfile/${user.id}`)}
                sx={mechanicalBtnSx}
              >
                {t('usersSearch.viewProfile', '[ VER_PERFIL ]')}
              </Button>
            </Box>
          ))}

        </Box>
      </Box>
    </Box>
  );
}

const inputTerminalSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(0,0,0,0.2)',
    fontFamily: 'monospace',
    color: COLORS.primaryLight,
    fontSize: '1.2rem',
    '& fieldset': { border: `2px solid ${COLORS.primaryMid}`, borderRadius: 0 },
    '&:hover fieldset, &.Mui-focused fieldset': { borderColor: COLORS.primaryLight },
  },
};

const mechanicalBtnSx = {
  minWidth: 'auto',
  p: '6px 12px',
  borderRadius: 0,
  fontFamily: 'monospace',
  fontWeight: 900,
  fontSize: '0.85rem',
  transition: 'all 0.05s linear',
  border: `2px solid ${COLORS.primaryLight}`,
  backgroundColor: COLORS.primaryLight,
  color: COLORS.primaryDark,
  boxShadow: `3px 3px 0px ${COLORS.accentDark}`,
  '&:hover': {
    backgroundColor: '#ffffff',
  },
  '&:active': {
    transform: 'translate(3px, 3px)',
    boxShadow: `0px 0px 0px transparent`,
  }
};
