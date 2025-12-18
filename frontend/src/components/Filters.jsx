import React from 'react';

const Filters = ({ filters, onChange }) => (
  <div className="filters-container">
    <input
      className="filter-input"
      aria-label="Buscar"
      placeholder="Buscar productos..."
      value={filters.q || ''}
      onChange={(e) => onChange({ ...filters, q: e.target.value })}
    />
    <select
      className="filter-select"
      aria-label="Talla"
      value={filters.size || ''}
      onChange={(e) => onChange({ ...filters, size: e.target.value })}
    >
      <option value="">Todas las tallas</option>
      {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
    <select
      className="filter-select"
      aria-label="Color"
      value={filters.color || ''}
      onChange={(e) => onChange({ ...filters, color: e.target.value })}
    >
      <option value="">Todos los colores</option>
      {['Blanco', 'Negro', 'Rojo', 'Veish', 'Celeste', 'Verde', 'Azul', 'Dorado', 'Rosado', 'Morado'].map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
    <div className="price-filters">
      <input
        className="filter-input price-input"
        type="number"
        placeholder="Precio mínimo"
        value={filters.minPrice || ''}
        onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
      />
      <input
        className="filter-input price-input"
        type="number"
        placeholder="Precio máximo"
        value={filters.maxPrice || ''}
        onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
      />
    </div>
  </div>
);

export default Filters;
