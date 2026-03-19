import { Box, Typography } from '@mui/material';
import type { MovieDetails, MovieCast, CrewMember } from '../../interfaces/MovieDetails';
import { COLORS } from '../../theme/AppTheme';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

interface Props {
  movie: MovieDetails;
}

// ==========================================
// COMPONENTE 1: LA TARJETA INDIVIDUAL
// ==========================================
interface CreditCardProps {
  name: string;
  subtitle?: string; // character para cast, job para crew
  profilePath: string | null;
}

function CreditCard({ name, subtitle, profilePath }: CreditCardProps) {
  const { t } = useTranslation();
  const imageUrl = profilePath
    ? `https://image.tmdb.org/t/p/w185${profilePath}`
    : 'https://via.placeholder.com/150x225/0B2833/617B85?text=NO+PIC'; // Placeholder brutalista

  return (
    <Box
      sx={{
        width: '140px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {/* Foto Rígida */}
      <Box
        component="img"
        src={imageUrl}
        alt={name}
        sx={{
          width: '100%',
          height: '210px',
          objectFit: 'cover',
          border: `2px solid ${COLORS.primaryMid}`,
          backgroundColor: COLORS.primaryDark,
        }}
      />

      {/* Textos */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            fontFamily: 'monospace',
            color: COLORS.primaryLight,
            fontWeight: 900,
            fontSize: '0.9rem',
            lineHeight: 1.2
          }}
        >
          {name.toUpperCase()}
        </Typography>

        {subtitle && (
          <Typography
            sx={{
              fontFamily: 'monospace',
              color: COLORS.primaryMid,
              fontSize: '0.8rem',
              mt: 0.5
            }}
          >
            {`> ${subtitle.toUpperCase()}`}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ==========================================
// COMPONENTE 2: LA FILA SCROLLEABLE
// ==========================================
interface CreditRowProps {
  title: string;
  items: (MovieCast | CrewMember)[];
  isCast?: boolean; // Para saber si mostramos 'character' o 'job'
  showJob?: boolean; // Para el crew general
}

function CreditRow({ title, items, isCast, showJob }: CreditRowProps) {
  if (!items || items.length === 0) return null; // Si no hay nadie en este departamento, no mostramos la fila

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Título de la Fila estilo Consola */}
      <Typography
        sx={{
          fontFamily: 'monospace',
          color: COLORS.primaryLight,
          fontSize: '1.2rem',
          fontWeight: 900,
          borderBottom: `2px solid ${COLORS.primaryMid}`,
          pb: 0.5
        }}
      >
        {`[ ${title} ]`}
      </Typography>

      {/* Contenedor Horizontal con Scroll Personalizado */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2, // Espacio para la barra de scroll
          // Scrollbar brutalista (Solo para Webkit: Chrome, Safari, Edge)
          '&::-webkit-scrollbar': { height: '8px' },
          '&::-webkit-scrollbar-track': {
            backgroundColor: COLORS.primaryDark,
            border: `1px solid ${COLORS.primaryMid}`
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: COLORS.primaryMid,
            borderRadius: 0, // Cero curvas
            '&:hover': { backgroundColor: COLORS.primaryLight }
          },
        }}
      >
        {items.map((person) => {
          // Extraemos el subtítulo dependiendo de si es Cast o Crew
          let subtitle = undefined;
          if (isCast && 'character' in person) subtitle = person.character;
          if (showJob && 'job' in person) subtitle = person.job;

          return (
            <CreditCard
              key={person.id + (subtitle || '')} // Llave única combinada por si alguien tiene 2 roles
              name={person.name}
              profilePath={person.profile_path}
              subtitle={subtitle}
            />
          );
        })}
      </Box>
    </Box>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export function MovieCredits({ movie }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2 }}>

      {/* 1. Cast (Foto, Nombre, Personaje) */}
      <CreditRow title={t('movieCredits.cast')} items={movie.cast} isCast={true} />

      {/* 2. Directores (Foto, Nombre) */}
      <CreditRow title={t('movieCredits.directors')} items={movie.directors} />

      {/* 3. Escritores (Foto, Nombre) */}
      <CreditRow title={t('movieCredits.writers')} items={movie.writers} />

      {/* 4. Compositores (Foto, Nombre) */}
      <CreditRow title={t('movieCredits.composers')} items={movie.composers} />

      {/* 5. Crew General (Foto, Nombre, Trabajo) */}
      <CreditRow title={t('movieCredits.crew')} items={movie.crew} showJob={true} />
    </Box>
  );
}
