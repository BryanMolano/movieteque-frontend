import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout'; // Importa el Layout
import { Group } from './pages/Group';
import { ToastProvider } from './contexts/ToastContext';
import { UserProfile } from './pages/UserProfile';
import { Users } from './pages/Users';
import { Movies } from './pages/Movies';
import { MovieDetails } from './pages/MovieDetails';
import { Recommendation } from './pages/Recommendation';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            {/* Todas las rutas dentro de MainLayout tendrán el Navbar automáticamente */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/groups/:id" element={<Group />} />
              <Route path="/userProfile/:id" element={<UserProfile />} />
              <Route path="/users" element={<Users />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/recommendation/:id" element={<Recommendation />} />

              {/* Agrega aquí /movies, /users, etc. */}
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
