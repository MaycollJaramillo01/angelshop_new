import { io } from 'socket.io-client';

// Crear socket con autoConnect deshabilitado para evitar intentos repetitivos
let socket = null;
let connectionAttempts = 0;
let hasConnectionFailed = false;
const MAX_CONNECTION_ATTEMPTS = 1;

export function getSocket() {
  // Si ya falló la conexión, no intentar más
  if (hasConnectionFailed) {
    return null;
  }

  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
      transports: ['websocket', 'polling'],
      autoConnect: false, // No conectar automáticamente
      reconnection: false, // Desactivar reconexión automática
      timeout: 3000, // Timeout más corto
      forceNew: false
    });

    connectionAttempts++;

    // Manejar errores de conexión silenciosamente
    socket.on('connect_error', () => {
      hasConnectionFailed = true;
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    });

    // Manejar conexión exitosa
    socket.on('connect', () => {
      connectionAttempts = 0;
      hasConnectionFailed = false;
    });

    // Intentar conectar una sola vez
    socket.connect();
  }
  
  return socket;
}

// Función para resetear el estado (útil si el servidor vuelve a estar disponible)
export function resetSocket() {
  hasConnectionFailed = false;
  connectionAttempts = 0;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Exportar función lazy para compatibilidad con código existente
export default {
  on: (...args) => {
    const s = getSocket();
    return s ? s.on(...args) : undefined;
  },
  off: (...args) => {
    const s = getSocket();
    return s ? s.off(...args) : undefined;
  },
  emit: (...args) => {
    const s = getSocket();
    return s ? s.emit(...args) : undefined;
  },
  connected: false
};
