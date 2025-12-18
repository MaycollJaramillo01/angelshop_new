import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const location = useLocation();
  
  // Si no hay token y estamos intentando acceder a /admin, permitir acceso
  // porque AdminDashboard maneja el login
  if (!token && location.pathname === '/admin') {
    return children;
  }
  
  // Para otras rutas admin, requerir token
  if (!token) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }
  
  return children;
};

export default AdminRoute;
