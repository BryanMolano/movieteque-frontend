import { Box, Typography, TextField, Button, InputAdornment } from '@mui/material';
import { COLORS } from '../theme/AppTheme';
import { useNavigate } from 'react-router-dom';

export function Movies() {
  const navigate = useNavigate();

  // Variables temporales
  const searchBar = '';
  const isLoading = false;
  const movies = [
    { id: 1, title: 'Memento', release_date: '2000-09-05', poster_path: null },
    { id: 2, title: 'Inception', release_date: '2010-07-15', poster_path: null }
  ];

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
            onChange={() => { }}
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
          {movies?.map((movie) => (
            <Box
              key={movie.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2, // Aumenté el padding general de la tarjeta
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
                    width: 90,  // Mucho más ancho
                    height: 135, // Proporción perfecta 2:3
                    flexShrink: 0,
                    border: `2px solid ${COLORS.primaryMid}`,
                    backgroundImage: `url('https://via.placeholder.com/90x135/0B2833/CBD3D6?text=P')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    mr: 3
                  }}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: 0.5 }}>
                  <Typography noWrap sx={{ fontFamily: 'sans-serif', color: COLORS.primaryLight, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                    {movie.title}
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', color: COLORS.primaryMid, fontSize: '1rem' }}>
                    AÑO: [{movie.release_date ? movie.release_date.substring(0, 4) : '????'}]
                  </Typography>
                </Box>
              </Box>

              {/* Botón Discreto ">" */}
              <Button
                disableRipple
                onClick={() => navigate(`/movies/${movie.id}`)}
                sx={{
                  minWidth: 'auto',
                  width: 40,
                  height: 40,
                  p: 0,
                  borderRadius: 0,
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '1.5rem',
                  border: `2px solid transparent`, // Borde invisible por defecto
                  color: COLORS.primaryMid, // Color apagado
                  transition: 'all 0.1s linear',
                  '&:hover': {
                    borderColor: COLORS.primaryLight,
                    color: COLORS.primaryLight,
                    backgroundColor: 'rgba(203, 211, 214, 0.05)',
                  },
                  '&:active': { transform: 'translate(2px, 2px)' }
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
