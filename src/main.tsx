import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { appTheme } from './theme/AppTheme.ts';
import { Analytics } from '@vercel/analytics/react';

import './i18n/Config.ts';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <App />
        <Analytics />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
); 
