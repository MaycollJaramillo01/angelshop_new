import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const location = useLocation();
  if (!token) return <Navigate to="/otp" state={{ from: location }} replace />;
  return children;
};

export default AdminRoute;
