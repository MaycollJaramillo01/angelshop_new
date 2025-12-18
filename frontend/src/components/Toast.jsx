import React, { useEffect, useState } from 'react';
import { getSocket } from '../sockets/socket';

const Toast = () => {
  const [message, setMessage] = useState('');
  useEffect(() => {
    let mounted = true;
    
    try {
      const socket = getSocket();
      
      // Si no hay socket disponible, salir silenciosamente
      if (!socket) {
        return;
      }
      
      // Handler para eventos de reservas
      const handler = (data) => {
        if (mounted) {
          setMessage(`Reserva ${data.code} -> ${data.status || ''}`);
          // Auto-ocultar después de 5 segundos
          setTimeout(() => {
            if (mounted) setMessage('');
          }, 5000);
        }
      };
      
      // Suscribirse a eventos solo si está conectado
      if (socket.connected) {
        socket.on('reservation.updated', handler);
        socket.on('reservation.created', handler);
      } else {
        // Esperar a que se conecte (con timeout)
        const onConnect = () => {
          socket.on('reservation.updated', handler);
          socket.on('reservation.created', handler);
        };
        socket.on('connect', onConnect);
        
        // Limpiar listener después de 10 segundos si no se conecta
        const timeout = setTimeout(() => {
          socket.off('connect', onConnect);
        }, 10000);
        
        return () => {
          clearTimeout(timeout);
          mounted = false;
          if (socket) {
            socket.off('connect');
            socket.off('reservation.updated');
            socket.off('reservation.created');
          }
        };
      }
      
      return () => {
        mounted = false;
        if (socket) {
          socket.off('connect');
          socket.off('reservation.updated');
          socket.off('reservation.created');
        }
      };
    } catch (error) {
      // Silenciar errores de socket si el servidor no está disponible
    }
    
    return () => {
      mounted = false;
    };
  }, []);

  if (!message) return null;
  return (
    <div
      role="status"
      style={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        background: '#0f766e', 
        color: 'white', 
        padding: '1rem 1.5rem', 
        borderRadius: '8px', 
        zIndex: 10000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer'
      }}
      onClick={() => setMessage('')}
    >
      {message}
    </div>
  );
};

export default Toast;
