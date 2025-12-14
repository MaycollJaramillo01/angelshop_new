import React, { useState } from 'react';
import { adminLogin } from '../api/auth';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [email, setEmail] = useState('admin@angelshop.com');
  const [password, setPassword] = useState('admin123');
  const token = localStorage.getItem('adminToken');

  const login = async () => {
    const { data } = await adminLogin(email, password);
    localStorage.setItem('adminToken', data.token);
  };

  return (
    <section>
      <h2>Admin</h2>
      {!token && (
        <div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
          />
          <button onClick={login}>Ingresar</button>
        </div>
      )}
      {token && (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/admin/productos">Productos</Link>
          <Link to="/admin/reservas">Reservas</Link>
          <Link to="/admin/reportes">Reportes</Link>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
