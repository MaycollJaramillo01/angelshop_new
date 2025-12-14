import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchReports } from '../api/auth';

const AdminReports = () => {
  const token = localStorage.getItem('adminToken');
  const { data } = useQuery({
    queryKey: ['reports'],
    queryFn: () => fetchReports(token),
    enabled: !!token
  });

  return (
    <section>
      <h2>Reportes</h2>
      {data?.data?.map((row) => (
        <div key={row._id.day}>
          {row._id.day}: {row.count} reservas, exp:{row.expired}
        </div>
      ))}
    </section>
  );
};

export default AdminReports;
