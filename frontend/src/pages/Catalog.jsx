import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import Filters from '../components/Filters';
import StockBadge from '../components/StockBadge';

const Catalog = () => {
  const [filters, setFilters] = useState({});
  const { data } = useQuery({ queryKey: ['products', filters], queryFn: () => fetchProducts(filters) });

  return (
    <section>
      <h2>Catálogo</h2>
      <Filters filters={filters} onChange={setFilters} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
        {data?.items?.map((p) => (
          <article key={p._id} style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
            <h3>
              <Link to={`/producto/${p.slug}`}>{p.name}</Link>
            </h3>
            <p>₡{p.price}</p>
            <StockBadge available={p.variants.reduce((a, v) => a + v.stockAvailable, 0)} />
          </article>
        ))}
      </div>
    </section>
  );
};

export default Catalog;
