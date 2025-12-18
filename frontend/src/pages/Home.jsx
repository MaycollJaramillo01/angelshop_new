import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import './Home.css';

// Helper para normalizar rutas de imágenes (codificar espacios para URLs locales)
const normalizeImagePath = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400';
  // Si es una URL externa, retornarla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Si es una ruta local, codificar espacios para que funcione correctamente
  return imagePath.replace(/ /g, '%20');
};

const Home = () => {
  const [collections, setCollections] = useState({
    'Nueva Colección': [],
    'Temporada': [],
    'Clásicos': []
  });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const { items } = await fetchProducts({ limit: 100 });
        
        // Función para verificar si un producto tiene imagen real (no placeholder)
        const hasRealImage = (product) => {
          const firstImage = product.images?.[0];
          if (!firstImage) return false;
          // Si es un placeholder, no tiene imagen real
          if (firstImage.includes('placeholder') || firstImage.includes('Sin+imagen')) {
            return false;
          }
          // Si tiene una ruta local a assets, tiene imagen real
          return firstImage.startsWith('/assets/');
        };

        // Filtrar solo productos con imágenes reales
        const productsWithImages = items.filter(hasRealImage);
        
        // Agrupar por colecciones solo productos con imágenes
        const grouped = productsWithImages.reduce((acc, product) => {
          const collection = product.collection || 'Clásicos';
          if (!acc[collection]) acc[collection] = [];
          if (acc[collection].length < 4) {
            acc[collection].push(product);
          }
          return acc;
        }, {});
        
        // Solo mantener colecciones que tengan al menos un producto
        const filteredCollections = Object.fromEntries(
          Object.entries(grouped).filter(([_, products]) => products.length > 0)
        );
        setCollections(filteredCollections);

        // Productos destacados (solo con imágenes reales, primeros 8)
        setFeaturedProducts(productsWithImages.slice(0, 8));

        // Categorías únicas
        const uniqueCategories = [...new Set(items.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories.slice(0, 6));
      } catch (error) {
        console.error('Error loading data:', error);
        setError('No se pudo cargar el contenido. Verifica que el servidor esté corriendo.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const featuredCategories = [
    { name: 'Vestidos', link: '/catalogo?category=Vestidos', icon: '👗' },
    { name: 'Blusas', link: '/catalogo?category=Blusas', icon: '👔' },
    { name: 'Pantalones', link: '/catalogo?category=Pantalones', icon: '👖' },
    { name: 'Joyería', link: '/catalogo?category=Joyería', icon: '💍' },
    { name: 'Bolsos', link: '/catalogo?category=Bolsos', icon: '👜' },
    { name: 'Perfumes', link: '/catalogo?category=Perfumes', icon: '🧴' }
  ];

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Error de conexión</h2>
          <p>{error}</p>
          <p className="error-hint">
            Asegúrate de que el backend esté corriendo en <code>http://localhost:4000</code>
          </p>
          <button onClick={() => window.location.reload()} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-minimal">
        <div className="hero-content-minimal">
          <p className="hero-eyebrow-minimal">Ángel Shop</p>
          <h1 className="hero-title-minimal">Moda Elegante</h1>
          <p className="hero-subtitle-minimal">
            Descubre nuestra selección exclusiva de prendas y accesorios
          </p>
          <div className="hero-actions-minimal">
            <Link to="/catalogo" className="btn-minimal-primary">
              Explorar Catálogo
            </Link>
            <Link to="/apartado" className="btn-minimal-secondary">
              Mi Apartado
            </Link>
          </div>
        </div>
      </section>

      {/* Banner Promocional */}
      <section className="promo-banner">
        <div className="promo-content">
          <h2>Reservas sin pago</h2>
          <p>Aparta tus productos favoritos y recógelos cuando estés listo</p>
          <Link to="/apartado" className="btn-promo">
            Ver cómo funciona
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="section-container">
            <div className="section-header-center">
              <h2 className="section-title-minimal">Productos Destacados</h2>
              <p className="section-subtitle">Selección especial para ti</p>
            </div>
            <div className="featured-grid">
              {featuredProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/producto/${product.slug}`}
                  className="product-card-minimal"
                >
                  <div className="product-image-wrapper">
                    <img
                      src={normalizeImagePath(product.images?.[0]) || 'https://via.placeholder.com/400'}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400?text=Sin+imagen';
                      }}
                    />
                    {product.collection && (
                      <span className="product-badge">{product.collection}</span>
                    )}
                  </div>
                  <div className="product-info-minimal">
                    <h3 className="product-name-minimal">{product.name}</h3>
                    {product.subcategory && (
                      <p className="product-subcategory">{product.subcategory}</p>
                    )}
                    <p className="product-price-minimal">₡{product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="section-footer">
              <Link to="/catalogo" className="btn-view-all">
                Ver todos los productos →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Collections Section */}
      {Object.entries(collections).map(([collectionName, products]) => {
        if (products.length === 0) return null;
        return (
          <section key={collectionName} className="collection-section">
            <div className="section-container">
              <div className="collection-header">
                <div>
                  <h2 className="collection-title">{collectionName}</h2>
                  <p className="collection-subtitle">
                    Explora nuestra {collectionName.toLowerCase()}
                  </p>
                </div>
                <Link 
                  to={`/catalogo?collection=${encodeURIComponent(collectionName)}`} 
                  className="collection-link"
                >
                  Ver todo →
                </Link>
              </div>
              <div className="collection-grid">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/producto/${product.slug}`}
                    className="product-card-minimal"
                  >
                  <div className="product-image-wrapper">
                    <img
                      src={normalizeImagePath(product.images?.[0]) || 'https://via.placeholder.com/400'}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400?text=Sin+imagen';
                      }}
                    />
                    </div>
                    <div className="product-info-minimal">
                      <h3 className="product-name-minimal">{product.name}</h3>
                      <p className="product-price-minimal">₡{product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Categories Section */}
      <section className="categories-section-minimal">
        <div className="section-container">
          <div className="section-header-center">
            <h2 className="section-title-minimal">Explorar Categorías</h2>
            <p className="section-subtitle">Encuentra lo que buscas</p>
          </div>
          <div className="categories-grid-minimal">
            {featuredCategories.map((category) => (
              <Link key={category.name} to={category.link} className="category-card-minimal">
                <span className="category-icon">{category.icon}</span>
                <span className="category-name-minimal">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter/CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Mantente al día</h2>
          <p>Recibe nuestras últimas novedades y ofertas especiales</p>
          <Link to="/catalogo" className="btn-cta">
            Explorar Ahora
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
