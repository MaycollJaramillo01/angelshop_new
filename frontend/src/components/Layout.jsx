import React from 'react';
import Navbar from './Navbar';
import Toast from './Toast';

const Layout = ({ children }) => (
  <div>
    <Navbar />
    <main style={{ padding: '1rem 2rem' }}>{children}</main>
    <Toast />
  </div>
);

export default Layout;
