import React from 'react';

const VariantPicker = ({ variants, selected, onSelect }) => (
  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
    {variants.map((v) => (
      <button
        key={v.sku}
        aria-label={`Talla ${v.size} color ${v.color}`}
        style={{
          border: selected === v.sku ? '2px solid #0f766e' : '1px solid #ccc',
          padding: '0.5rem'
        }}
        onClick={() => onSelect(v)}
      >
        {v.size} / {v.color} ({v.stockAvailable} disp.)
      </button>
    ))}
  </div>
);

export default VariantPicker;
