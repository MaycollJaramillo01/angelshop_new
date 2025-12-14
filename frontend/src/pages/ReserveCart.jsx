import React, { useState } from 'react';
import { createReservation } from '../api/reservations';

const ReserveCart = () => {
  const [message, setMessage] = useState('');
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const token = localStorage.getItem('otpToken');

  const submit = async () => {
    if (!token) return alert('Inicia sesión con OTP');
    const { data } = await createReservation(token, cart.map(({ productId, variantSku, qty }) => ({
      productId,
      variantSku,
      qty: Number(qty)
    })));
    setMessage(`Reserva creada: ${data.code}`);
    localStorage.removeItem('cart');
  };

  return (
    <section>
      <h2>Carrito de apartado</h2>
      {cart.map((item, idx) => (
        <div key={idx}>
          {item.name} - {item.variantSku} x {item.qty}
        </div>
      ))}
      <button aria-label="Crear reserva" onClick={submit} disabled={!cart.length}>
        Confirmar reserva
      </button>
      {message && <p>{message}</p>}
    </section>
  );
};

export default ReserveCart;
