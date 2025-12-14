import React, { useEffect, useState } from 'react';

const ReservationTimer = ({ expiresAt }) => {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) {
        setRemaining('Expirada');
        clearInterval(timer);
      } else {
        const mins = Math.floor(diff / 60000);
        setRemaining(`${mins} min`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  return <span>{remaining}</span>;
};

export default ReservationTimer;
