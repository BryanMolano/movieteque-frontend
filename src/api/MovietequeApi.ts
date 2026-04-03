import axios from 'axios';

export const movietequeApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

movietequeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('movieteque-token'); 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

movietequeApi.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response && error.response.status === 401) {
      // console.warn('>>> [AUTH] JWT_EXPIRADO_O_INVÁLIDO._REDIRECCIONANDO...');
      localStorage.removeItem('movieteque-token');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);
