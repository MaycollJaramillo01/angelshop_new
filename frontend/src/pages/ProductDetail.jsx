import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProduct } from '../api/products';
import VariantPicker from '../components/VariantPicker';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['product', slug], 
    queryFn: () => fetchProduct(slug),
    retry: 1,
    retryOnMount: false
  });
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [qty, setQty] = useState(1);

  if (isLoading) return <div className="product-detail-loading">Cargando...</div>;
  if (error) return <div className="product-detail-error">Error al cargar el producto. Verifica que el servidor esté corriendo.</div>;
  if (!data) return <div className="product-detail-error">Producto no encontrado</div>;

  const availableStock = selectedVariant?.stockAvailable || 0;
  const maxQty = Math.min(availableStock, 10);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Por favor selecciona una talla y color');
      return;
    }
    if (availableStock === 0) {
      alert('Este producto no tiene stock disponible');
      return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex(
      item => item.productId === data._id && item.variantSku === selectedVariant.sku
    );

    if (existingIndex >= 0) {
      cart[existingIndex].qty = Math.min(cart[existingIndex].qty + qty, maxQty);
    } else {
      cart.push({
        productId: data._id,
        variantSku: selectedVariant.sku,
        qty: qty,
        name: data.name,
        price: data.price,
        image: data.images[0]?.replace(/ /g, '%20') || 'https://via.placeholder.com/400',
        size: selectedVariant.size,
        color: selectedVariant.color,
        slug: data.slug  // Agregar slug para poder cargar el producto después
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/apartado');
  };

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Galería de imágenes */}
        <div className="product-images-section">
          <div className="product-main-image">
            <img 
              src={(data.images[selectedImageIndex] || data.images[0] || 'https://via.placeholder.com/600').replace(/ /g, '%20')} 
              alt={data.name}
              className="main-product-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600?text=Sin+imagen';
              }}
            />
          </div>
          {data.images.length > 1 && (
            <div className="product-thumbnails">
              {data.images.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img 
                    src={img?.replace(/ /g, '%20') || 'https://via.placeholder.com/100'} 
                    alt={`Vista ${index + 1}`}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100?text=Sin+imagen';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-title">{data.name}</h1>
            {data.collection && (
              <span className={`product-collection-badge ${data.collection.toLowerCase().replace(/\s+/g, '-').replace('ó', 'o')}`}>
                {data.collection}
              </span>
            )}
          </div>

          <div className="product-price-section">
            <span className="product-price-main">₡{data.price.toLocaleString()}</span>
          </div>

          <div className="product-description">
            <h3>Descripción</h3>
            <p>{data.description}</p>
          </div>

          <div className="product-variants-section">
            <h3>Selecciona talla y color</h3>
            <VariantPicker 
              variants={data.variants} 
              selected={selectedVariant?.sku} 
              onSelect={setSelectedVariant} 
            />
            {selectedVariant && (
              <div className="variant-info">
                <p>
                  <strong>Talla:</strong> {selectedVariant.size} | 
                  <strong> Color:</strong> {selectedVariant.color} | 
                  <strong> Disponible:</strong> {selectedVariant.stockAvailable} unidades
                </p>
              </div>
            )}
          </div>

          <div className="product-quantity-section">
            <label htmlFor="qty"><strong>Cantidad:</strong></label>
            <div className="quantity-controls">
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
                className="qty-btn"
              >
                −
              </button>
              <input
                id="qty"
                type="number"
                min={1}
                max={maxQty}
                value={qty}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1));
                  setQty(val);
                }}
                className="qty-input"
              />
              <button 
                onClick={() => setQty(Math.min(maxQty, qty + 1))}
                disabled={qty >= maxQty}
                className="qty-btn"
              >
                +
              </button>
            </div>
          </div>

          <div className="product-actions">
            <button
              className="btn-add-to-cart"
              onClick={handleAddToCart}
              disabled={!selectedVariant || availableStock === 0}
            >
              {availableStock === 0 ? 'Sin stock' : 'Agregar al apartado'}
            </button>
            <button
              className="btn-buy-now"
              onClick={() => {
                handleAddToCart();
                navigate('/apartado');
              }}
              disabled={!selectedVariant || availableStock === 0}
            >
              Apartar ahora
            </button>
          </div>

          <div className="product-specs">
            <div className="spec-item">
              <strong>Categoría:</strong> {data.category}
            </div>
            <div className="spec-item">
              <strong>Stock total:</strong> {data.variants.reduce((a, v) => a + v.stockAvailable, 0)} unidades
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
