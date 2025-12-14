import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMyReservations, cancelReservation } from '../api/reservations';
import ReservationTimer from '../components/ReservationTimer';

const MyReservations = () => {
  const token = localStorage.getItem('otpToken');
  const { data, refetch } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => fetchMyReservations(token),
    enabled: !!token
  });

  const cancel = async (code) => {
    await cancelReservation(token, code);
    refetch();
  };

  return (
    <section>
      <h2>Mis reservas</h2>
      {data?.data?.map((r) => (
        <article key={r.code} style={{ background: 'white', padding: '1rem', marginBottom: '0.5rem' }}>
          <div>
            <strong>{r.code}</strong> - {r.status} <ReservationTimer expiresAt={r.expiresAt} />
          </div>
          <div>{r.items.map((i) => `${i.nameSnapshot} ${i.variantSku} x${i.qty}`).join(', ')}</div>
          {['PENDING', 'CONFIRMED'].includes(r.status) && (
            <button onClick={() => cancel(r.code)}>Cancelar</button>
          )}
        </article>
      ))}
    </section>
  );
};

export default MyReservations;
