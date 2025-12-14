const { sendMail } = require('../config/mailer');
const { RESERVATION_TTL_HOURS } = require('../config/env');

async function sendReservationConfirmation(reservation) {
  const expires = reservation.expiresAt.toLocaleString();
  return sendMail({
    to: reservation.customerEmail,
    subject: `Reserva ${reservation.code} recibida`,
    text: `Tu reserva expira el ${expires}. Código: ${reservation.code}`
  });
}

async function sendReservationExpired(reservation) {
  return sendMail({
    to: reservation.customerEmail,
    subject: `Reserva ${reservation.code} expirada`,
    text: 'Tu reserva expiró y el stock fue liberado.'
  });
}

async function sendReservationCancelled(reservation) {
  return sendMail({
    to: reservation.customerEmail,
    subject: `Reserva ${reservation.code} cancelada`,
    text: 'Tu reserva fue cancelada y el stock liberado.'
  });
}

module.exports = {
  sendReservationConfirmation,
  sendReservationCancelled,
  sendReservationExpired
};
