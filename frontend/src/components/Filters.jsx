import React from 'react';

const Filters = ({ filters, onChange }) => (
  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
    <input
      aria-label="Buscar"
      placeholder="Buscar"
      value={filters.q || ''}
      onChange={(e) => onChange({ ...filters, q: e.target.value })}
    />
    <select
      aria-label="Talla"
      value={filters.size || ''}
      onChange={(e) => onChange({ ...filters, size: e.target.value })}
    >
      <option value="">Talla</option>
      {['S', 'M', 'L', 'XL'].map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
    <select
      aria-label="Color"
      value={filters.color || ''}
      onChange={(e) => onChange({ ...filters, color: e.target.value })}
    >
      <option value="">Color</option>
      {['Rojo', 'Azul', 'Negro', 'Blanco', 'Verde'].map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  </div>
);

export default Filters;
