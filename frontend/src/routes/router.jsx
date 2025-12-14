import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../app';
import Home from '../pages/Home';
import Catalog from '../pages/Catalog';
import ProductDetail from '../pages/ProductDetail';
import ReserveCart from '../pages/ReserveCart';
import OtpLogin from '../pages/OtpLogin';
import MyReservations from '../pages/MyReservations';
import AdminDashboard from '../pages/AdminDashboard';
import AdminProducts from '../pages/AdminProducts';
import AdminReservations from '../pages/AdminReservations';
import AdminReports from '../pages/AdminReports';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'catalogo', element: <Catalog /> },
      { path: 'producto/:slug', element: <ProductDetail /> },
      {
        path: 'apartado',
        element: (
          <ProtectedRoute>
            <ReserveCart />
          </ProtectedRoute>
        )
      },
      { path: 'otp', element: <OtpLogin /> },
      {
        path: 'mis-reservas',
        element: (
          <ProtectedRoute>
            <MyReservations />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        )
      },
      {
        path: 'admin/productos',
        element: (
          <AdminRoute>
            <AdminProducts />
          </AdminRoute>
        )
      },
      {
        path: 'admin/reservas',
        element: (
          <AdminRoute>
            <AdminReservations />
          </AdminRoute>
        )
      },
      {
        path: 'admin/reportes',
        element: (
          <AdminRoute>
            <AdminReports />
          </AdminRoute>
        )
      }
    ]
  }
]);

export default router;
