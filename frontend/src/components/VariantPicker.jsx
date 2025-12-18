import React from 'react';
import './VariantPicker.css';

const VariantPicker = ({ variants, selected, onSelect }) => (
  <div className="variant-picker">
    {variants.map((v) => {
      const isSelected = selected === v.sku;
      const isOutOfStock = v.stockAvailable === 0;
      
      return (
        <button
          key={v.sku}
          className={`variant-option ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
          onClick={() => !isOutOfStock && onSelect(v)}
          disabled={isOutOfStock}
          aria-label={`Talla ${v.size} color ${v.color} ${isOutOfStock ? 'sin stock' : ''}`}
        >
          <span className="variant-size">{v.size}</span>
          <span className="variant-color">{v.color}</span>
          <span className="variant-stock">({v.stockAvailable} disp.)</span>
        </button>
      );
    })}
  </div>
);

export default VariantPicker;
