import React from 'react';
import Navbar from './Navbar';
import Toast from './Toast';

const Layout = ({ children }) => (
  <div className="page">
    <Navbar />
    <main className="page__content">{children}</main>
    <Toast />
  </div>
);

export default Layout;
