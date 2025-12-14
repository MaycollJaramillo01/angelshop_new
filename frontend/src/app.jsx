import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from './components/Layout';

const App = () => (
  <Layout>
    <Outlet />
  </Layout>
);

export default App;
