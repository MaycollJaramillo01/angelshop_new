import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './routes/router';
import './styles/index.css';

// Configurar QueryClient con manejo de errores silencioso
const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Solo reintentar una vez
      refetchOnWindowFocus: false, // No refetch automático
      onError: (error) => {
        // Solo loguear errores no relacionados con conexión
        if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
          console.error('Query error:', error);
        }
      }
    },
    mutations: {
      onError: (error) => {
        // Solo loguear errores no relacionados con conexión
        if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
          console.error('Mutation error:', error);
        }
      }
    }
  }
});

// Prevenir logs repetitivos de WebSocket y conexión
const originalError = console.error;
const originalWarn = console.warn;
const errorCache = new Map();
const MAX_ERROR_COUNT = 5;

let suppressedErrorCount = 0;

const shouldSuppressError = (errorMsg, stack) => {
  const suppressPatterns = [
    'WebSocket connection',
    'socket.io',
    'socket__io',
    'ERR_CONNECTION_REFUSED',
    'Failed to load resource',
    'net::ERR_CONNECTION_REFUSED',
    'Network Error',
    'ERR_NETWORK',
    'createSocket',
    'doOpen',
    'socket__io-client'
  ];
  
  const fullMsg = (errorMsg + ' ' + (stack || '')).toLowerCase();
  return suppressPatterns.some(pattern => fullMsg.includes(pattern.toLowerCase()));
};

// Función para normalizar mensajes de error similares
const normalizeError = (errorMsg) => {
  const lowerMsg = errorMsg.toLowerCase();
  if (lowerMsg.includes('websocket') || lowerMsg.includes('socket')) {
    return 'socket_connection_error';
  }
  if (lowerMsg.includes('connection_refused') || lowerMsg.includes('failed to load')) {
    return 'connection_refused_error';
  }
  return errorMsg;
};

console.error = (...args) => {
  const errorMsg = args[0]?.toString() || '';
  const stack = args[1]?.stack || (args[1]?.toString?.() || '');
  const fullMsg = args.map(arg => arg?.toString?.() || String(arg)).join(' ');
  
  if (shouldSuppressError(fullMsg, stack)) {
    suppressedErrorCount++;
    const normalizedMsg = normalizeError(fullMsg);
    const count = errorCache.get(normalizedMsg) || 0;
    errorCache.set(normalizedMsg, count + 1);
    
    // Solo mostrar el primer error de cada tipo, luego silenciar completamente
    if (count === 0 && suppressedErrorCount <= 2) {
      // Mostrar solo una vez al inicio para debugging
      originalError.apply(console, args);
    }
    
    // Limpiar cache periódicamente
    if (suppressedErrorCount % 50 === 0) {
      errorCache.clear();
      suppressedErrorCount = 0;
    }
    
    return; // Silenciar el error
  }
  
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const warnMsg = args.map(arg => arg?.toString?.() || String(arg)).join(' ').toLowerCase();
  if (warnMsg.includes('websocket') || warnMsg.includes('socket') || warnMsg.includes('connection')) {
    return; // Silenciar warnings relacionados
  }
  originalWarn.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
