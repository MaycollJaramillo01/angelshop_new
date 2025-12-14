import React from 'react';

const StockBadge = ({ available }) => (
  <span style={{ color: available > 0 ? 'green' : 'red', marginLeft: '0.5rem' }}>
    {available > 0 ? `${available} disponibles` : 'Sin stock'}
  </span>
);

export default StockBadge;
