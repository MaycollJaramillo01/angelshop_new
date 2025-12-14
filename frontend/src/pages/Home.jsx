import React from 'react';
import { Link } from 'react-router-dom';

const seasonalDrops = [
  {
    title: 'Colección Resort 2024',
    description: 'Prendas ligeras inspiradas en la costa del Pacífico.',
    cta: 'Ver colección',
    badge: 'Nuevo',
  },
  {
    title: 'Ofertas de temporada',
    description: 'Hasta 35% en básicos esenciales para reservar hoy.',
    cta: 'Explorar ofertas',
    badge: 'Limitado',
  },
];

const curatedLines = [
  {
    name: 'Sastrería minimal',
    copy: 'Blazers estructurados y pantalones relajados para un look limpio.',
  },
  {
    name: 'Lino mediterráneo',
    copy: 'Texturas naturales en tonos arena para días cálidos.',
  },
  {
    name: 'Noches urbanas',
    copy: 'Vestidos y camisas con brillo sutil para eventos especiales.',
  },
];

const Home = () => (
  <div className="home">
    <section className="hero">
      <div className="hero__content">
        <p className="eyebrow">Nueva temporada</p>
        <h1>Reserva las piezas más deseadas antes que nadie</h1>
        <p className="lead">
          Inspirado en la estética limpia de Zara, curamos colecciones con siluetas modernas, tonos neutros
          y detalles minimalistas para cada ocasión.
        </p>
        <div className="hero__actions">
          <Link to="/catalogo" className="primary-button">
            Ver catálogo
          </Link>
          <Link to="/apartado" className="secondary-button">
            Apartar ahora
          </Link>
        </div>
      </div>
      <div className="hero__visual" aria-hidden="true">
        <div className="glass-card">
          <span className="tag">Tendencia</span>
          <p>Camisas fluidas · Vestidos satinados · Accesorios statement</p>
          <span className="muted">Colecciones inspiradas en Zara.com</span>
        </div>
      </div>
    </section>

    <section className="grid-two">
      {seasonalDrops.map((drop) => (
        <article key={drop.title} className="card">
          <div className="card__header">
            <span className="badge">{drop.badge}</span>
            <h2>{drop.title}</h2>
          </div>
          <p>{drop.description}</p>
          <Link to="/catalogo" className="text-link">
            {drop.cta}
          </Link>
        </article>
      ))}
    </section>

    <section className="section">
      <div className="section__header">
        <h2>Nuevas colecciones</h2>
        <Link to="/catalogo" className="text-link">
          Ver todo
        </Link>
      </div>
      <div className="pill-row">
        {curatedLines.map((line) => (
          <div key={line.name} className="pill-card">
            <span className="pill-title">{line.name}</span>
            <p>{line.copy}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="section highlight">
      <div className="highlight__content">
        <p className="eyebrow">Exclusivo para reservas</p>
        <h2>Entrega prioritaria y seguimiento en tiempo real</h2>
        <p className="lead">Aparta tus favoritos y asegura disponibilidad con confirmaciones instantáneas.</p>
      </div>
      <div className="highlight__cta">
        <Link to="/mis-reservas" className="primary-button ghost">
          Mis reservas
        </Link>
        <Link to="/admin" className="text-link">
          Administrar stock
        </Link>
      </div>
    </section>
  </div>
);

export default Home;
