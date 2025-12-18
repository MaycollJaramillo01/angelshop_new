import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 10000 // 10 segundos de timeout
});

http.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`;
  return config;
});

// Interceptor de respuesta para manejar errores silenciosamente
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo loguear errores de conexión una vez para evitar spam
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      // No hacer nada aquí, dejar que cada componente maneje su propio error
      // Esto previene logs repetitivos
    }
    return Promise.reject(error);
  }
);

export default http;
