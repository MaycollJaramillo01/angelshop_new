import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('otpToken');
  const location = useLocation();
  if (!token) return <Navigate to="/otp" state={{ from: location }} replace />;
  return children;
};

export default ProtectedRoute;
