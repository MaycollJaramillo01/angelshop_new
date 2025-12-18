import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAdminProducts, deleteProduct } from '../api/auth';
import './AdminProducts.css';

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('adminToken');
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => fetchAdminProducts(token),
    enabled: !!token,
    retry: 1,
    retryOnMount: false
  });

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${productName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteProduct(token, productId);
      queryClient.invalidateQueries(['admin-products']);
      alert('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredProducts = products?.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalStock = (variants) => {
    return variants?.reduce((sum, v) => sum + (v.stockAvailable || 0), 0) || 0;
  };

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Productos</h1>
          <p className="admin-subtitle">Gestionar inventario y productos ({products?.length || 0} total)</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/admin/productos/nuevo')}
          >
            + Agregar Producto
          </button>
          <Link to="/admin" className="btn-secondary">
            ← Volver al dashboard
          </Link>
        </div>
      </div>

      <div className="admin-content-card">
        <div className="admin-filters">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar productos por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="products-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="product-cell">
                        {product.images && product.images.length > 0 && (
                          <img 
                            src={(product.images[0] || '').replace(/ /g, '%20')} 
                            alt={product.name}
                            className="product-thumbnail"
                          />
                        )}
                        <div>
                          <div className="product-name">{product.name}</div>
                          {product.description && (
                            <div className="product-description">{product.description.substring(0, 50)}...</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-category">{product.category || 'Sin categoría'}</span>
                    </td>
                    <td>
                      <span className="product-price">{formatCurrency(product.price || 0)}</span>
                    </td>
                    <td>
                      <span className={`stock-badge ${totalStock(product.variants) === 0 ? 'stock-empty' : totalStock(product.variants) < 10 ? 'stock-low' : 'stock-ok'}`}>
                        {totalStock(product.variants)} unidades
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${product.isActive === false ? 'badge-inactive' : 'badge-active'}`}>
                        {product.isActive === false ? 'Inactivo' : 'Activo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/admin/productos/${product._id}`} className="btn-link">
                          Editar
                        </Link>
                        <button 
                          className="btn-link btn-link-danger"
                          onClick={() => handleDelete(product._id, product.name)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos disponibles'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
