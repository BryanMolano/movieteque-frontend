import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const token = localStorage.getItem('movieteque-token');

  // Si no hay token, lo mandamos al login y usamos 'replace' para que 
  // no pueda usar el botón de "Atrás" del navegador para volver
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, '<Outlet />' renderiza la página que el usuario quería ver (ej. Dashboard)
  return <Outlet />;
}
