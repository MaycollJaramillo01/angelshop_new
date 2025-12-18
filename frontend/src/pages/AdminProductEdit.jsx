import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  fetchProductById, 
  createProduct, 
  updateProduct, 
  updateProductStock 
} from '../api/auth';
import './AdminProductEdit.css';

const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('adminToken');
  const isNewProduct = id === 'nuevo';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    images: [],
    variants: [],
    isActive: true
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar producto si es edición
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => fetchProductById(token, id),
    enabled: !isNewProduct && !!token && !!id
  });

  useEffect(() => {
    if (product && !isNewProduct) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price || '',
        images: product.images || [],
        variants: product.variants || [],
        isActive: product.isActive !== false
      });
    }
  }, [product, isNewProduct]);

  const generateSlug = (name) => {
    return name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        sku: '',
        size: '',
        color: '',
        stockAvailable: 0,
        stockLocked: 0,
        lowStockThreshold: 2
      }]
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      
      // Auto-generar SKU si nombre, talla y color están disponibles
      if (field !== 'sku' && prev.name && newVariants[index].size && newVariants[index].color) {
        const baseSlug = generateSlug(prev.name);
        newVariants[index].sku = `${baseSlug.toUpperCase()}-${newVariants[index].size}-${newVariants[index].color.toUpperCase()}-${index}`;
      }
      
      return { ...prev, variants: newVariants };
    });
  };

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateStock = async (variantIndex, delta) => {
    // Actualizar el estado local primero para feedback inmediato
    const newVariants = [...formData.variants];
    const newStock = Math.max(0, newVariants[variantIndex].stockAvailable + delta);
    newVariants[variantIndex].stockAvailable = newStock;
    setFormData(prev => ({ ...prev, variants: newVariants }));

    // Si es producto existente, también actualizar en el backend
    if (!isNewProduct) {
      try {
        const variant = formData.variants[variantIndex];
        await updateProductStock(token, id, variant.sku, delta);
        queryClient.invalidateQueries(['admin-products']);
      } catch (error) {
        console.error('Error updating stock:', error);
        // Revertir el cambio local si falla
        const revertedVariants = [...formData.variants];
        revertedVariants[variantIndex].stockAvailable = formData.variants[variantIndex].stockAvailable;
        setFormData(prev => ({ ...prev, variants: revertedVariants }));
        alert('Error al actualizar el inventario. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones
      if (!formData.name.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (!formData.price || formData.price <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }
      if (formData.variants.length === 0) {
        throw new Error('Debe agregar al menos una variante');
      }

      // Validar variantes
      for (const variant of formData.variants) {
        if (!variant.size || !variant.color) {
          throw new Error('Todas las variantes deben tener talla y color');
        }
        if (variant.stockAvailable < 0) {
          throw new Error('El stock no puede ser negativo');
        }
      }

      const productData = {
        name: formData.name.trim(),
        slug: generateSlug(formData.name),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        images: formData.images,
        variants: formData.variants.map(v => ({
          sku: v.sku || `${generateSlug(formData.name).toUpperCase()}-${v.size}-${v.color.toUpperCase()}`,
          size: v.size,
          color: v.color,
          stockAvailable: Number(v.stockAvailable) || 0,
          stockLocked: Number(v.stockLocked) || 0,
          lowStockThreshold: Number(v.lowStockThreshold) || 2
        })),
        isActive: formData.isActive
      };

      if (isNewProduct) {
        await createProduct(token, productData);
        alert('Producto creado exitosamente');
      } else {
        await updateProduct(token, id, productData);
        alert('Producto actualizado exitosamente');
      }

      queryClient.invalidateQueries(['admin-products']);
      navigate('/admin/productos');
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{isNewProduct ? 'Nuevo Producto' : 'Editar Producto'}</h1>
          <p className="admin-subtitle">
            {isNewProduct ? 'Crear un nuevo producto en el catálogo' : 'Modificar información del producto'}
          </p>
        </div>
        <button 
          className="btn-secondary"
          onClick={() => navigate('/admin/productos')}
        >
          ← Volver a productos
        </button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        {error && <div className="error-message">{error}</div>}

        {/* Información básica */}
        <div className="form-section">
          <h2>Información Básica</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre del Producto *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ej: Pantalón de Vestir"
              />
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Ej: Pantalones"
              />
            </div>

            <div className="form-group">
              <label>Precio (₡) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="35000"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span>Producto activo</span>
              </label>
            </div>

            <div className="form-group full-width">
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Descripción del producto..."
              />
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="form-section">
          <h2>Imágenes</h2>
          <div className="image-manager">
            <div className="add-image-input">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="URL de la imagen"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
              />
              <button type="button" onClick={handleAddImage} className="btn-add">
                Agregar
              </button>
            </div>

            <div className="images-grid">
              {formData.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Imagen ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="btn-remove-image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Variantes */}
        <div className="form-section">
          <div className="section-header">
            <h2>Variantes (Tallas y Colores)</h2>
            <button type="button" onClick={handleAddVariant} className="btn-add-variant">
              + Agregar Variante
            </button>
          </div>

          {formData.variants.length === 0 ? (
            <p className="empty-message">No hay variantes. Agrega al menos una variante con talla y color.</p>
          ) : (
            <div className="variants-list">
              {formData.variants.map((variant, index) => (
                <div key={index} className="variant-card">
                  <div className="variant-header">
                    <span className="variant-number">Variante {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="btn-remove"
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="variant-form-grid">
                    <div className="form-group">
                      <label>Talla *</label>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                        required
                        placeholder="Ej: S, M, L, XL"
                      />
                    </div>

                    <div className="form-group">
                      <label>Color *</label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                        required
                        placeholder="Ej: Negro, Azul"
                      />
                    </div>

                    <div className="form-group">
                      <label>SKU</label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        placeholder="Auto-generado"
                      />
                    </div>

                    <div className="form-group">
                      <label>Stock Disponible *</label>
                      <div className="stock-controls">
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(index, -1)}
                          className="btn-stock"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={variant.stockAvailable}
                          onChange={(e) => handleVariantChange(index, 'stockAvailable', parseInt(e.target.value) || 0)}
                          min="0"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(index, 1)}
                          className="btn-stock"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/productos')} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : (isNewProduct ? 'Crear Producto' : 'Guardar Cambios')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductEdit;

