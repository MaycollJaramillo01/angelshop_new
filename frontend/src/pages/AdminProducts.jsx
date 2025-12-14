import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminProducts } from '../api/auth';

const AdminProducts = () => {
  const token = localStorage.getItem('adminToken');
  const { data } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => fetchAdminProducts(token),
    enabled: !!token
  });

  return (
    <section>
      <h2>Productos</h2>
      {data?.data?.map((p) => (
        <article key={p._id} style={{ background: 'white', padding: '1rem', marginBottom: '0.5rem' }}>
          <div>
            {p.name} - ₡{p.price}
          </div>
          <div>{p.variants.map((v) => `${v.sku}:${v.stockAvailable}`).join(', ')}</div>
        </article>
      ))}
    </section>
  );
};

export default AdminProducts;
