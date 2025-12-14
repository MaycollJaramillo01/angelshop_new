import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  const otpToken = localStorage.getItem('otpToken');
  const adminToken = localStorage.getItem('adminToken');

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="Ángel Shop">
          <span className="brand-mark">Á</span>
          <div className="brand-text">
            <span className="brand-title">Ángel Shop</span>
            <span className="brand-subtitle">Reservas en tendencia</span>
          </div>
        </Link>
        <nav className="navbar__links" aria-label="Navegación principal">
          <NavLink to="/" className={linkClass} end>
            Inicio
          </NavLink>
          <NavLink to="/catalogo" className={linkClass}>
            Catálogo
          </NavLink>
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
    </header>
  );
};

export default Navbar;
