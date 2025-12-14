import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProduct } from '../api/products';
import VariantPicker from '../components/VariantPicker';

const ProductDetail = () => {
  const { slug } = useParams();
  const { data } = useQuery({ queryKey: ['product', slug], queryFn: () => fetchProduct(slug) });
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);

  if (!data) return <p>Cargando...</p>;

  return (
    <section>
      <h2>{data.name}</h2>
      <p>{data.description}</p>
      <VariantPicker variants={data.variants} selected={selected?.sku} onSelect={setSelected} />
      <div>
        <label htmlFor="qty">Cantidad</label>
        <input
          id="qty"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          style={{ width: '80px' }}
        />
      </div>
      <button
        aria-label="Agregar a apartado"
        onClick={() => {
          if (!selected) return alert('Selecciona variante');
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          cart.push({ productId: data._id, variantSku: selected.sku, qty, name: data.name });
          localStorage.setItem('cart', JSON.stringify(cart));
          alert('Agregado al apartado');
        }}
      >
        Apartar
      </button>
    </section>
  );
};

export default ProductDetail;
