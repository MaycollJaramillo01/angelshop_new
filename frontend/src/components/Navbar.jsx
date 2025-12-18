import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';


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

const Navbar = () => {
  const [showCatalogMenu, setShowCatalogMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const otpToken = localStorage.getItem('otpToken');
  const adminToken = localStorage.getItem('adminToken');

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowCatalogMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    if (showCatalogMenu || showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCatalogMenu, showMobileMenu]);

  // Cerrar menú móvil cuando se hace click en un link
  const handleMobileLinkClick = () => {
    setShowMobileMenu(false);
    setShowCatalogMenu(false);
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="Ángel Shop" onClick={handleMobileLinkClick}>
          <span className="brand-mark">Á</span>
          <div className="brand-text">
            <span className="brand-title">Ángel Shop</span>
            <span className="brand-subtitle">Reservas en tendencia</span>
          </div>
        </Link>
        
        {/* Botón menú móvil */}
        <button 
          className="mobile-menu-toggle"
          aria-label="Toggle menu"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <span className={showMobileMenu ? 'hamburger active' : 'hamburger'}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Navegación desktop */}
        <nav className="navbar__links" aria-label="Navegación principal">
          <NavLink to="/" className={linkClass} end>
            Inicio
          </NavLink>
          <div 
            ref={menuRef}
            className="nav-link-container"
            onMouseEnter={() => setShowCatalogMenu(true)}
            onMouseLeave={() => setShowCatalogMenu(false)}
          >
            <NavLink 
              to="/catalogo" 
              className={linkClass}
              onClick={() => setShowCatalogMenu(!showCatalogMenu)}
            >
              Catálogo {showCatalogMenu ? '▲' : '▼'}
            </NavLink>
            {showCatalogMenu && (
              <div 
                className="dropdown-menu"
                onMouseEnter={() => setShowCatalogMenu(true)}
                onMouseLeave={() => setShowCatalogMenu(false)}
              >
                {Object.keys(categoryStructure).map(category => (
                  <div key={category} className="dropdown-category">
                    <Link 
                      to={`/catalogo?category=${category}`} 
                      className="dropdown-category-title"
                      onClick={() => setShowCatalogMenu(false)}
                    >
                      {category}
                    </Link>
                    {categoryStructure[category].length > 0 && (
                      <div className="dropdown-subcategories">
                        {categoryStructure[category].map(subcat => (
                          <Link 
                            key={subcat}
                            to={`/catalogo?category=${category}&subcategory=${subcat}`}
                            className="dropdown-subcategory"
                            onClick={() => setShowCatalogMenu(false)}
                          >
                            {subcat}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/apartado" className={linkClass}>
            Apartado
          </NavLink>
          <NavLink to="/mis-reservas" className={linkClass}>
            Mis reservas
          </NavLink>
          <NavLink to="/admin" className={linkClass}>
            Admin
          </NavLink>
        </nav>
        <div className="navbar__actions">
          {otpToken && (
            <button type="button" className="ghost-button" aria-label="Salir cliente" onClick={() => localStorage.removeItem('otpToken')}>
              Salir cliente
            </button>
          )}
          {adminToken && (
            <button type="button" className="ghost-button" aria-label="Salir admin" onClick={() => localStorage.removeItem('adminToken')}>
              Salir admin
            </button>
          )}
        </div>
      </div>

      {/* Menú móvil */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={handleMobileLinkClick}>
          <nav 
            ref={mobileMenuRef}
            className="mobile-menu"
            onClick={(e) => e.stopPropagation()}
            aria-label="Navegación móvil"
          >
            <NavLink to="/" className={linkClass} end onClick={handleMobileLinkClick}>
              Inicio
            </NavLink>
            
            <div className="mobile-menu-catalog">
              <button 
                className={`mobile-menu-toggle-catalog ${showCatalogMenu ? 'active' : ''}`}
                onClick={() => setShowCatalogMenu(!showCatalogMenu)}
              >
                Catálogo {showCatalogMenu ? '▲' : '▼'}
              </button>
              {showCatalogMenu && (
                <div className="mobile-menu-catalog-dropdown">
                  {Object.keys(categoryStructure).map(category => (
                    <div key={category} className="mobile-menu-category">
                      <Link 
                        to={`/catalogo?category=${category}`} 
                        className="mobile-menu-category-title"
                        onClick={handleMobileLinkClick}
                      >
                        {category}
                      </Link>
                      {categoryStructure[category].length > 0 && (
                        <div className="mobile-menu-subcategories">
                          {categoryStructure[category].map(subcat => (
                            <Link 
                              key={subcat}
                              to={`/catalogo?category=${category}&subcategory=${subcat}`}
                              className="mobile-menu-subcategory"
                              onClick={handleMobileLinkClick}
                            >
                              {subcat}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/apartado" className={linkClass} onClick={handleMobileLinkClick}>
              Apartado
            </NavLink>
            <NavLink to="/mis-reservas" className={linkClass} onClick={handleMobileLinkClick}>
              Mis reservas
            </NavLink>
            <NavLink to="/admin" className={linkClass} onClick={handleMobileLinkClick}>
              Admin
            </NavLink>

            <div className="mobile-menu-actions">
              {otpToken && (
                <button 
                  type="button" 
                  className="ghost-button" 
                  aria-label="Salir cliente" 
                  onClick={() => {
                    localStorage.removeItem('otpToken');
                    handleMobileLinkClick();
                  }}
                >
                  Salir cliente
                </button>
              )}
              {adminToken && (
                <button 
                  type="button" 
                  className="ghost-button" 
                  aria-label="Salir admin" 
                  onClick={() => {
                    localStorage.removeItem('adminToken');
                    handleMobileLinkClick();
                  }}
                >
                  Salir admin
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
