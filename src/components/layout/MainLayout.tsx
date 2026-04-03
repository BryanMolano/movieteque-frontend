import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from './Navbar';
import { COLORS } from '../../theme/AppTheme';

export function MainLayout() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.primaryDark }}>
      <Navbar />
      <Box component="main" sx={{ p: 4 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
