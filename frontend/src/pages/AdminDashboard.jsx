import React, { useState, useEffect } from 'react';
import { adminLogin, fetchAdminProducts, fetchAdminReservations, fetchReports } from '../api/auth';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [email, setEmail] = useState('admin@angelshop.com');
  const [password, setPassword] = useState('admin2025');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalReservations: 0,
    pendingReservations: 0,
    totalRevenue: 0,
    expiredReservations: 0,
    activeProducts: 0
  });
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    setDashboardLoading(true);
    try {
      const [products, reservations, reports] = await Promise.all([
        fetchAdminProducts(token).catch(() => []),
        fetchAdminReservations(token).catch(() => []),
        fetchReports(token).catch(() => [])
      ]);

      // Calcular estadísticas
      const totalProducts = products?.length || 0;
      const activeProducts = products?.filter(p => p.isActive !== false).length || 0;
      const totalReservations = reservations?.length || 0;
      const pendingReservations = reservations?.filter(r => r.status === 'PENDING').length || 0;
      const expiredReservations = reservations?.filter(r => r.status === 'EXPIRED').length || 0;
      
      // Calcular ingresos totales (subtotal de todas las reservas)
      const totalRevenue = reservations?.reduce((sum, r) => {
        return sum + (r.totals?.subtotal || 0);
      }, 0) || 0;

      setStats({
        totalProducts,
        totalReservations,
        pendingReservations,
        totalRevenue,
        expiredReservations,
        activeProducts
      });
    } catch (err) {
      // Error silenciado, ya que cada llamada tiene su propio catch
    } finally {
      setDashboardLoading(false);
    }
  };

  const login = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await adminLogin(email, password);
      if (response && response.token) {
        localStorage.setItem('adminToken', response.token);
        window.location.reload();
      } else {
        setError('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        setError(err.response.data?.message || 'Credenciales incorrectas');
      } else if (err.request) {
        setError('Error de conexión. Verifica que el servidor esté corriendo.');
      } else {
        setError('Error inesperado. Por favor intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!token) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <h1>Ángel Shop Admin</h1>
          <form onSubmit={login}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" disabled={loading} className="btn-login">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Panel de Administración</h1>
          <p className="admin-subtitle">Resumen general del negocio</p>
        </div>
        <button onClick={logout} className="btn-logout">Cerrar sesión</button>
      </div>

      {dashboardLoading ? (
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          {/* Métricas principales */}
          <div className="admin-stats-grid">
            <div className="stat-card stat-card-primary">
              <div className="stat-card-header">
                <span className="stat-label">Productos Totales</span>
                <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7h-4V4c0-1.11-.89-2-2-2H6c-1.11 0-2 .89-2 2v3H0v2h2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V9h2V7h-4zM6 4h8v3H6V4zm12 16H6V9h12v11z"/>
                </svg>
              </div>
              <div className="stat-value">{stats.totalProducts}</div>
              <div className="stat-subtitle">{stats.activeProducts} activos</div>
            </div>

            <div className="stat-card stat-card-success">
              <div className="stat-card-header">
                <span className="stat-label">Reservas Pendientes</span>
                <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <div className="stat-value">{stats.pendingReservations}</div>
              <div className="stat-subtitle">Requieren atención</div>
            </div>

            <div className="stat-card stat-card-info">
              <div className="stat-card-header">
                <span className="stat-label">Total de Reservas</span>
                <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div className="stat-value">{stats.totalReservations}</div>
              <div className="stat-subtitle">{stats.expiredReservations} expiradas</div>
            </div>

            <div className="stat-card stat-card-warning">
              <div className="stat-card-header">
                <span className="stat-label">Ingresos Totales</span>
                <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
              <div className="stat-subtitle">Valor total de reservas</div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="admin-actions-section">
            <h2>Gestión</h2>
            <div className="admin-grid">
              <Link to="/admin/productos" className="admin-card">
                <div className="admin-card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7h-4V4c0-1.11-.89-2-2-2H6c-1.11 0-2 .89-2 2v3H0v2h2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V9h2V7h-4zM6 4h8v3H6V4zm12 16H6V9h12v11z"/>
                  </svg>
                </div>
                <h3>Productos</h3>
                <p>Gestionar inventario y productos</p>
              </Link>
              
              <Link to="/admin/reservas" className="admin-card">
                <div className="admin-card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <h3>Reservas</h3>
                <p>Ver y gestionar reservas</p>
              </Link>
              
              <Link to="/admin/reportes" className="admin-card">
                <div className="admin-card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <h3>Reportes</h3>
                <p>Estadísticas y análisis</p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
