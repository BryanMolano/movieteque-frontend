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
      return Promise.reject(error);
    },

  );
