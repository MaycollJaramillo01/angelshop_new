import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const otpToken = localStorage.getItem('otpToken');
  const adminToken = localStorage.getItem('adminToken');
  return (
    <nav style={{ display: 'flex', padding: '1rem', background: '#0f766e', color: 'white' }}>
      <Link to="/" style={{ color: 'white', fontWeight: 'bold', marginRight: '1rem' }}>
        Ángel Shop
      </Link>
      <Link to="/catalogo" style={{ color: 'white' }}>
        Catálogo
      </Link>
      <Link to="/apartado" style={{ color: 'white' }}>
        Apartado
      </Link>
      <Link to="/mis-reservas" style={{ color: 'white' }}>
        Mis reservas
      </Link>
      <Link to="/admin" style={{ color: 'white', marginLeft: 'auto' }}>
        Admin
      </Link>
      {otpToken && (
        <button aria-label="Salir" onClick={() => localStorage.removeItem('otpToken')} style={{ marginLeft: '0.5rem' }}>
          Salir cliente
        </button>
      )}
      {adminToken && (
        <button aria-label="Salir admin" onClick={() => localStorage.removeItem('adminToken')} style={{ marginLeft: '0.5rem' }}>
          Salir admin
        </button>
      )}
    </nav>
  );
};

export default Navbar;
