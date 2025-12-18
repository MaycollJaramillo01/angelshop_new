import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchReservationByEmail } from '../api/reservations';
import ReservationTimer from '../components/ReservationTimer';
import './MyReservations.css';

const MyReservations = () => {
  const [email, setEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  
  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ['my-reservations', searchEmail],
    queryFn: () => fetchReservationByEmail(searchEmail),
    enabled: !!searchEmail,
    retry: 1,
    retryOnMount: false
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (email) {
      setSearchEmail(email);
    }
  };

  return (
    <div className="my-reservations-page">
      <h1>Mis Reservas</h1>
      
      <div className="reservations-search">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="email"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="email-input"
          />
          <button type="submit" className="search-button">
            Buscar reservas
          </button>
        </form>
      </div>

      {isLoading && <div className="loading">Buscando reservas...</div>}
      
      {error && searchEmail && (
        <div className="no-reservations">
          <p>Error al buscar reservas. Verifica que el servidor esté corriendo.</p>
        </div>
      )}
      
      {data && data.length > 0 ? (
        <div className="reservations-list">
          {data.map((r) => (
            <article key={r.code} className="reservation-card">
              <div className="reservation-header">
                <div>
                  <strong className="reservation-code">Código: {r.code}</strong>
                  <span className={`status-badge status-${r.status.toLowerCase()}`}>
                    {r.status}
                  </span>
                </div>
                {r.expiresAt && <ReservationTimer expiresAt={r.expiresAt} />}
              </div>
              <div className="reservation-items">
                <h3>Productos:</h3>
                <ul>
                  {r.items.map((i, idx) => (
                    <li key={idx}>
                      {i.nameSnapshot} - Talla: {i.size} | Color: {i.color} | Cantidad: {i.qty}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="reservation-totals">
                <p><strong>Total: ₡{r.totals?.subtotal?.toLocaleString() || 0}</strong></p>
                <p>Items: {r.totals?.itemsCount || 0}</p>
              </div>
              {r.customerName && (
                <div className="reservation-customer">
                  <p>Cliente: {r.customerName}</p>
                  {r.customerPhone && <p>Teléfono: {r.customerPhone}</p>}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : searchEmail && !isLoading && (
        <div className="no-reservations">
          <p>No se encontraron reservas para este correo electrónico.</p>
        </div>
      )}
    </div>
  );
};

export default MyReservations;
