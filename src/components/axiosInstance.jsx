import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: 'https://pruebabackend-production-e215.up.railway.app'
});

// Interceptor para añadir el token a las solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401 (sin token o token inválido)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      // Redirigir al login si se recibe un error 401
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
