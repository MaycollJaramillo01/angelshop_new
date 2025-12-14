import React, { useEffect, useState } from 'react';
import socket from '../sockets/socket';

const Toast = () => {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const handler = (data) => setMessage(`Reserva ${data.code} -> ${data.status || ''}`);
    socket.on('reservation.updated', handler);
    socket.on('reservation.created', handler);
    return () => {
      socket.off('reservation.updated', handler);
      socket.off('reservation.created', handler);
    };
  }, []);

  if (!message) return null;
  return (
    <div
      role="status"
      style={{ position: 'fixed', bottom: 20, right: 20, background: '#0f766e', color: 'white', padding: '1rem' }}
    >
      {message}
    </div>
  );
};

export default Toast;
