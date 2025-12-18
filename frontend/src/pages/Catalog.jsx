import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import Filters from '../components/Filters';
import StockBadge from '../components/StockBadge';
import './Catalog.css';

const categoryStructure = {
  'Pantalones': ['Pantalón de vestir', 'Palazzo', 'Jeans'],
  'Shorts': [],
  'Enaguas': [],
  'Conjuntos': ['Conjunto Largo', 'Conjunto Corto'],
  'Enterizos': ['Enterizos Largos', 'Enterizos Cortos'],
  'Vestidos': ['Vestidos Largo', 'Vestidos Cortos', 'Fiesta'],
  'Blusas': ['Camisera', 'Blazer', 'Plus', 'Blusas', 'Camisa', 'Blusas Cortas', 'Chalecos', 'Budy'],
  'Bolsos': [],
  'Joyería': ['Coyares', 'Pulseras', 'Aretes', 'Earcuff', 'Llaveros'],
  'Perfumes': ['Mujer', 'Hombre']
};

const Catalog = () => {
  const [filters, setFilters] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['products', filters], 
    queryFn: () => fetchProducts(filters),
    retry: 1,
    retryOnMount: false
  });

  const collections = ['Nueva Colección', 'Temporada', 'Clásicos'];

  const filteredProducts = data?.items?.filter(p => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (selectedSubcategory && p.subcategory !== selectedSubcategory) return false;
    if (selectedCollection && p.collection !== selectedCollection) return false;
    return true;
  }) || [];

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
    setSidebarOpen(false);
  };

  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSidebarOpen(false);
  };

  return (
    <div className="catalog-page-amazon">
      <div className="catalog-header-amazon">
        <h1>Catálogo de Productos</h1>
        <p className="catalog-breadcrumb">
          {selectedCategory && <span>Inicio / {selectedCategory}</span>}
          {selectedSubcategory && <span> / {selectedSubcategory}</span>}
        </p>
      </div>

      <div className="catalog-layout-amazon">
        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar de categorías */}
        <aside className={`catalog-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2>Departamentos</h2>
            <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>×</button>
          </div>
          <nav className="category-nav">
            <button
              className={`category-nav-item ${!selectedCategory ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory('');
                setSelectedSubcategory('');
              }}
            >
              Todos los productos
            </button>
            {Object.keys(categoryStructure).map(category => (
              <div key={category} className="category-group">
                <button
                  className={`category-nav-item ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                  {categoryStructure[category].length > 0 && ' ▼'}
                </button>
                {selectedCategory === category && categoryStructure[category].length > 0 && (
                  <div className="subcategory-list">
                    {categoryStructure[category].map(subcat => (
                      <button
                        key={subcat}
                        className={`subcategory-item ${selectedSubcategory === subcat ? 'active' : ''}`}
                        onClick={() => handleSubcategoryClick(subcat)}
                      >
                        {subcat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="catalog-main">
          <div className="catalog-toolbar">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰ Filtros
            </button>
            <div className="results-info">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
              {selectedCategory && ` en ${selectedCategory}`}
              {selectedSubcategory && ` > ${selectedSubcategory}`}
            </div>
            <select
              className="sort-select"
              value={filters.sort || ''}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="">Ordenar por</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name-asc">Nombre: A-Z</option>
              <option value="name-desc">Nombre: Z-A</option>
            </select>
          </div>

          <div className="filters-bar-amazon">
            <Filters filters={filters} onChange={setFilters} />
            <div className="collection-filters-amazon">
              {collections.map(col => (
                <button
                  key={col}
                  className={`collection-filter-amazon ${selectedCollection === col ? 'active' : ''}`}
                  onClick={() => setSelectedCollection(selectedCollection === col ? '' : col)}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="loading-amazon">Cargando productos...</div>
          ) : error ? (
            <div className="no-results">
              <p>No se pudo cargar el catálogo. Verifica que el servidor esté corriendo.</p>
            </div>
          ) : (
            <div className="products-grid-amazon">
              {filteredProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && !isLoading && (
            <div className="no-results">
              <p>No se encontraron productos con los filtros seleccionados.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const totalStock = product.variants.reduce((a, v) => a + v.stockAvailable, 0);
  // Normalizar rutas de imágenes locales - codificar espacios para URLs locales
  const normalizeImagePath = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/400';
    // Si es una URL externa, retornarla tal cual
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Si es una ruta local, codificar espacios para que funcione correctamente
    return imagePath.replace(/ /g, '%20');
  };
  const mainImage = normalizeImagePath(product.images?.[0]) || 'https://via.placeholder.com/400';

  return (
    <div className="product-card-amazon">
      <Link to={`/producto/${product.slug}`} className="product-link-amazon">
        <div className="product-image-amazon">
          <img 
            src={mainImage} 
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400?text=Sin+imagen';
            }}
          />
          {product.collection && (
            <span className={`product-badge-amazon ${product.collection.toLowerCase().replace(/\s+/g, '-').replace('ó', 'o')}`}>
              {product.collection}
            </span>
          )}
        </div>
        <div className="product-info-amazon">
          <h3 className="product-title-amazon">{product.name}</h3>
          {product.subcategory && (
            <p className="product-subcategory-amazon">{product.subcategory}</p>
          )}
          <div className="product-rating-amazon">
            <span className="stars">★★★★★</span>
            <span className="rating-count">({Math.floor(Math.random() * 100) + 10})</span>
          </div>
          <div className="product-price-amazon">
            <span className="price-main">₡{product.price.toLocaleString()}</span>
          </div>
          <div className="product-stock-amazon">
            <StockBadge available={totalStock} />
          </div>
          {product.subcategory && (
            <p className="product-category-amazon">{product.category} • {product.subcategory}</p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Catalog;
