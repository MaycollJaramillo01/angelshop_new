import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProduct } from '../api/products';
import { createReservationDirect } from '../api/reservations';
import './ReserveCart.css';

const ReserveCart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [cartDetails, setCartDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const loadCart = async () => {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(cartItems);
      
      // Cargar detalles de productos de forma segura
      const details = await Promise.all(
        cartItems.map(async (item) => {
          try {
            // Intentar obtener el producto por slug si existe
            if (item.slug) {
              const product = await fetchProduct(item.slug).catch(() => null);
              // Si la llamada falla, usar los datos del item almacenado
              return product ? { ...item, product } : item;
            }
            // Si no hay slug, usar los datos del item almacenado
            return item;
          } catch {
            // En caso de error, usar los datos del item almacenado
            return item;
          }
        })
      );
      setCartDetails(details);
    };
    loadCart();
  }, []);

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCartDetails(cartDetails.filter((_, i) => i !== index));
  };

  const updateQty = (index, newQty) => {
    const newCart = [...cart];
    newCart[index].qty = Math.max(1, newQty);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación frontend mejorada
    const errors = [];
    
    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      errors.push('Ingresa un email válido');
    }
    
    if (!formData.phone || formData.phone.trim().length < 8) {
      errors.push('El teléfono debe tener al menos 8 caracteres');
    }
    
    if (!formData.address || formData.address.trim().length < 10) {
      errors.push('La dirección debe tener al menos 10 caracteres');
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    if (cart.length === 0) {
      alert('No hay productos en tu apartado');
      return;
    }

    setLoading(true);
    try {
      // Preparar items con validación
      const items = cart
        .filter(item => {
          if (!item.productId || !item.variantSku) {
            console.warn('Item inválido:', item);
            return false;
          }
          return true;
        })
        .map(({ productId, variantSku, qty }) => {
          let qtyNum;
          if (typeof qty === 'string') {
            qtyNum = parseInt(qty, 10);
          } else {
            qtyNum = Number(qty);
          }
          
          if (isNaN(qtyNum) || qtyNum <= 0) {
            qtyNum = 1;
          }
          
          return {
            productId: String(productId).trim(),
            variantSku: String(variantSku).trim(),
            qty: qtyNum
          };
        });

      if (items.length === 0) {
        alert('No hay productos válidos en tu apartado. Por favor, elimina los productos inválidos y vuelve a agregarlos.');
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        items
      };

      const reservation = await createReservationDirect(payload);

      localStorage.removeItem('cart');
      alert(`¡Apartado confirmado exitosamente!\nCódigo de reserva: ${reservation.code}\nTe contactaremos pronto.`);
      navigate('/');
    } catch (error) {
      // Solo loguear si no es un error de conexión
      if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
        console.error('Error al crear reserva:', error);
      }
      
      let errorMessage = 'Error al confirmar el apartado';
      
      // Verificar si es error de conexión
      if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
        errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta de nuevo.';
      } else if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          // Manejar errores de Zod
          const errorList = [];
          if (errorData.errors.fieldErrors) {
            Object.entries(errorData.errors.fieldErrors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                errorList.push(`${field}: ${messages[0]}`);
              }
            });
          }
          if (errorData.errors.formErrors && errorData.errors.formErrors.length > 0) {
            errorList.push(...errorData.errors.formErrors);
          }
          errorMessage = errorList.length > 0 ? errorList.join('\n') : 'Error de validación';
        }
      } else if (error.message && error.message !== 'Network Error') {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="reserve-cart-page">
        <div className="empty-cart">
          <h2>Tu apartado está vacío</h2>
          <p>Agrega productos desde el catálogo</p>
          <button onClick={() => navigate('/catalogo')} className="btn-primary">
            Ver catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reserve-cart-page">
      <h1>Mi Apartado</h1>
      
      <div className="cart-container">
        <div className="cart-items">
          <h2>Productos apartados ({cart.length})</h2>
          {cartDetails.map((item, index) => (
            <div key={index} className="cart-item">
              <img 
                src={(item.image || item.product?.images?.[0] || 'https://via.placeholder.com/150').replace(/ /g, '%20')} 
                alt={item.name}
                className="cart-item-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=Sin+imagen';
                }}
              />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>Talla: {item.size} | Color: {item.color}</p>
                <p className="cart-item-price">₡{(item.price * item.qty).toLocaleString()}</p>
              </div>
              <div className="cart-item-controls">
                <div className="quantity-control">
                  <button onClick={() => updateQty(index, item.qty - 1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(index, item.qty + 1)}>+</button>
                </div>
                <button 
                  className="btn-remove"
                  onClick={() => removeFromCart(index)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Resumen</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₡{calculateTotal().toLocaleString()}</span>
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>₡{calculateTotal().toLocaleString()}</span>
          </div>

          {!showForm ? (
            <button 
              className="btn-checkout"
              onClick={() => setShowForm(true)}
            >
              Confirmar apartado
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="reservation-form">
              <h3>Datos de contacto</h3>
              <div className="form-group">
                <label>Nombre completo *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Tu nombre completo"
                />
              </div>
              <div className="form-group">
                <label>Correo electrónico *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="tu@email.com"
                />
              </div>
              <div className="form-group">
                <label>Número de teléfono *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="8888-8888"
                />
              </div>
              <div className="form-group">
                <label>Dirección *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="Dirección completa para entrega"
                  rows="3"
                  className="form-textarea"
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Confirmar apartado'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReserveCart;
