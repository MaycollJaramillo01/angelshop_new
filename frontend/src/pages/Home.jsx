import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <section>
    <h1>Ángel Shop Orotina</h1>
    <p>Catálogo con reservaciones en tiempo real.</p>
    <Link to="/catalogo">Ver catálogo</Link>
  </section>
);

export default Home;
