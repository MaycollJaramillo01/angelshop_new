import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminReservations, updateReservationStatus } from '../api/auth';

const AdminReservations = () => {
  const token = localStorage.getItem('adminToken');
  const { data, refetch } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: () => fetchAdminReservations(token),
    enabled: !!token
  });

  const changeStatus = async (code, status) => {
    await updateReservationStatus(token, code, status);
    refetch();
  };

  return (
    <section>
      <h2>Reservas</h2>
      {data?.data?.map((r) => (
        <article key={r.code} style={{ background: 'white', padding: '1rem', marginBottom: '0.5rem' }}>
          <div>
            {r.code} - {r.status}
          </div>
          <button onClick={() => changeStatus(r.code, 'CONFIRMED')}>Confirmar</button>
          <button onClick={() => changeStatus(r.code, 'COMPLETED')}>Completar</button>
        </article>
      ))}
    </section>
  );
};

export default AdminReservations;
