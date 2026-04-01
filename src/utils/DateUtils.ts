
/**
 * Escudo protector: Convierte cualquier string de fecha (UTC o local)
 * en un objeto Date de JavaScript ajustado a la zona horaria del usuario.
 */
export const getSafeDate = (dateString: string | undefined | null): Date | null => {
  if (!dateString) return null;

  // 1. Si ya viene con formato ISO completo o con offset
  if (dateString.includes('Z') || dateString.includes('+') || (dateString.includes('-') && dateString.length > 10)) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  // 2. Si viene cruda (ej. "2026-03-20 15:47:26"), le forzamos el UTC
  let safeString = dateString.replace(' ', 'T');
  if (!safeString.endsWith('Z')) safeString += 'Z';

  const date = new Date(safeString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Reemplaza a formatTerminalDate, formatDate, etc.
 * Formato de salida: DD/MM/YYYY
 */
export const formatTerminalDate = (dateString: string | undefined | null, fallback = "??/??/????"): string => {
  const date = getSafeDate(dateString);
  if (!date) return fallback;

  // Usamos métodos locales para que respete la zona horaria calculada
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Exclusivo para los mensajes del chat.
 * Formato de salida: HH:MM AM/PM
 */
export const formatTime = (dateString: string | undefined | null): string => {
  const date = getSafeDate(dateString);
  if (!date) return '--:--';

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Compara si dos fechas caen en el mismo día (usado en el chat).
 */
export const isSameDay = (dateString1: string, dateString2: string): boolean => {
  const d1 = getSafeDate(dateString1);
  const d2 = getSafeDate(dateString2);

  if (!d1 || !d2) return false;

  return d1.toDateString() === d2.toDateString();
};

export const getDateDividerLabel = (dateString: string, t: any): string => {
  const date = getSafeDate(dateString);
  if (!date) return '[ ??/??/???? ]';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return t('chat.today', '[ HOY ]');
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return t('chat.yesterday', '[ AYER ]');
  }

  // Reutilizamos nuestra propia función brutalista para los días anteriores
  return `[ ${formatTerminalDate(dateString)} ]`;
};
