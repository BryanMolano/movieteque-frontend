import axios from 'axios';

export const movietequeApi = axios.create({
  baseURL: 'http://localhost:3000/api', 
});
movietequeApi.interceptors.request.use(
  (config)=>
    {
    const token = localStorage.getItem('movieteque-token');
    if(token){
      config.headers['Authorization']=`Bearer ${token}`;
    }
      return config;
    },
    (error)=>{
    if (error.response && error.response.status === 401) {
      console.warn('>>> [AUTH] JWT_EXPIRADO_O_INVÁLIDO. INICIANDO_PURGA..._');
      localStorage.removeItem('token'); 
      window.location.href = '/login'; 
    }
    return Promise.reject(error);

  }
  );

