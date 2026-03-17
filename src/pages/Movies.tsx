import { Box, Typography, TextField, Button, InputAdornment } from '@mui/material';
import { COLORS } from '../theme/AppTheme';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSearchMovie } from '../hooks/useSearchMovie';
import type { MovieBasic } from '../interfaces/MovieBasic';

export function Movies() {
  const navigate = useNavigate();
  const [searchBar, setSearchBar] = useState('');
  const [textToSearch, setTextToSearch] = useState('');
  const { data: movies, isLoading, isError } = useSearchMovie(textToSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTextToSearch(searchBar);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchBar]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.primaryDark, p: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: 4 }}>

        {/* ENCABEZADO Y BUSCADOR */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '2rem', fontFamily: 'sans-serif', color: COLORS.primaryLight, textTransform: 'uppercase' }}>
            [ BUSCAR_PELÍCULAS ]
          </Typography>

          <TextField
            fullWidth
            placeholder="INGRESE TÍTULO..."
            value={searchBar}
            onChange={(e) => setSearchBar(e.target.value)} // <-- Conectado al estado
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
              {`>>> ESCANEANDO_BASE_DE_DATOS..._`}
            </Typography>
          )}

          <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, mb: 1 }}>
            {`>>> COINCIDENCIAS_ENCONTRADAS [ ${movies?.length || 0} ]`}
          </Typography>

          {/* LISTA DE PELÍCULAS */}
          {movies?.map((movie: MovieBasic) => (
            <Box
              key={movie.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                border: `2px solid ${COLORS.primaryMid}`,
                backgroundColor: 'transparent',
                transition: 'all 0.1s linear',
                '&:hover': {
                  borderColor: COLORS.primaryLight,
                  backgroundColor: 'rgba(203, 211, 214, 0.05)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flexGrow: 1, mr: 2 }}>

                {/* 🎞️ PÓSTER GIGANTE */}
                <Box
                  sx={{
                    width: 90,
                    height: 135,
                    flexShrink: 0,
                    border: `2px solid ${COLORS.primaryMid}`,
                    // 👇 Lógica visual para armar la URL de TMDB o usar placeholder
                    backgroundImage: movie.poster_path
                      ? `url('https://image.tmdb.org/t/p/w342${movie.poster_path}')`
                      : `url('https://via.placeholder.com/90x135/0B2833/CBD3D6?text=NO+POSTER')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    mr: 3
                  }}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: 0.5 }}>
                  <Typography noWrap sx={{ fontFamily: 'sans-serif', color: COLORS.primaryLight, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                    {movie.title}
                  </Typography>

                  {/* 👇 Título original sutil (Solo se muestra si es diferente al título principal) */}
                  {movie.original_title !== movie.title && (
                    <Typography noWrap sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '0.85rem', fontStyle: 'italic' }}>
                      AKA: {movie.original_title}
                    </Typography>
                  )}

                  <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '1rem', mt: 0.5 }}>
                    AÑO: [{movie.release_date ? movie.release_date.substring(0, 4) : '????'}]
                  </Typography>
                </Box>
              </Box>

              {/* Botón ">" Explícito y Brutalista */}
              <Button
                disableRipple
                onClick={() => navigate(`/movies/${movie.id}`)}
                sx={{
                  minWidth: 'auto',
                  width: 44,
                  height: 44,
                  p: 0,
                  borderRadius: 0,
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '1.5rem',
                  border: `2px solid ${COLORS.primaryMid}`, // Borde visible
                  color: COLORS.primaryLight,
                  boxShadow: `3px 3px 0px ${COLORS.primaryMid}`, // Sombra rígida
                  transition: 'all 0.05s linear',
                  '&:hover': {
                    borderColor: COLORS.primaryLight,
                    backgroundColor: COLORS.primaryLight,
                    color: COLORS.primaryDark,
                    boxShadow: `3px 3px 0px transparent`, // Al hacer hover se "hunde" un poco
                    transform: 'translate(1px, 1px)'
                  },
                  '&:active': {
                    transform: 'translate(3px, 3px)',
                    boxShadow: `0px 0px 0px transparent`, // Al hacer click se hunde del todo
                  }
                }}
              >
                {'>'}
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
