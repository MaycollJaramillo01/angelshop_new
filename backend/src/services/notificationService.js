const { sendMail } = require('../config/mailer');
const { RESERVATION_TTL_HOURS } = require('../config/env');
const { logger } = require('../utils/logger');

async function sendReservationConfirmation(reservation) {
  try {
    // expiresAt puede ser string ISO o Date
    const expiresAt = reservation.expiresAt instanceof Date 
      ? reservation.expiresAt 
      : new Date(reservation.expiresAt);
    
    const expires = expiresAt.toLocaleString('es-CR', {
      dateStyle: 'long',
      timeStyle: 'short'
    });

    const itemsList = reservation.items.map(item => 
      `- ${item.nameSnapshot} (${item.size}, ${item.color}) x${item.qty} - ₡${(item.priceSnapshot * item.qty).toLocaleString()}`
    ).join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e91e63, #f06292); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { background: #fff; border: 2px dashed #e91e63; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #e91e63; margin: 20px 0; border-radius: 5px; }
            .items { background: #fff; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .item { padding: 10px 0; border-bottom: 1px solid #eee; }
            .item:last-child { border-bottom: none; }
            .total { font-size: 18px; font-weight: bold; color: #e91e63; text-align: right; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Ángel Shop</h1>
              <p>Tu reserva ha sido confirmada</p>
            </div>
            <div class="content">
              <p>Hola ${reservation.customerName || 'Cliente'},</p>
              <p>Tu reserva ha sido confirmada exitosamente. Aquí están los detalles:</p>
              
              <div class="code">
                Código: ${reservation.code}
              </div>

              <div class="items">
                <h3>Productos reservados:</h3>
                ${reservation.items.map(item => `
                  <div class="item">
                    <strong>${item.nameSnapshot}</strong><br>
                    Talla: ${item.size} | Color: ${item.color} | Cantidad: ${item.qty}<br>
                    Precio: ₡${(item.priceSnapshot * item.qty).toLocaleString()}
                  </div>
                `).join('')}
                <div class="total">
                  Total: ₡${reservation.totals.subtotal.toLocaleString()}
                </div>
              </div>

              <p><strong>Fecha de expiración:</strong> ${expires}</p>
              
              <p>Te contactaremos pronto para coordinar la entrega.</p>
              
              <div class="footer">
                <p>Gracias por elegir Ángel Shop 💕</p>
                <p>Este es un correo automático, por favor no responder.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendMail({
      to: reservation.customerEmail,
      subject: `Reserva ${reservation.code} recibida - Ángel Shop`,
      html: html,
      text: `Tu reserva expira el ${expires}. Código: ${reservation.code}\n\nProductos:\n${itemsList}\n\nTotal: ₡${reservation.totals.subtotal.toLocaleString()}`
    });
  } catch (error) {
    logger.error('Failed to send reservation confirmation:', error);
    return { error: error.message };
  }
}

async function sendReservationExpired(reservation) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Ángel Shop</h1>
              <p>Reserva Expirada</p>
            </div>
            <div class="content">
              <p>Hola ${reservation.customerName || 'Cliente'},</p>
              <p>Tu reserva con código <strong>${reservation.code}</strong> ha expirado y el stock ha sido liberado.</p>
              <p>Si aún estás interesado en estos productos, puedes realizar una nueva reserva desde nuestro catálogo.</p>
              <p>Gracias por tu interés en Ángel Shop.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendMail({
      to: reservation.customerEmail,
      subject: `Reserva ${reservation.code} expirada - Ángel Shop`,
      html: html,
      text: 'Tu reserva expiró y el stock fue liberado.'
    });
  } catch (error) {
    logger.error('Failed to send reservation expired notification:', error);
    return { error: error.message };
  }
}

async function sendReservationCancelled(reservation) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff9800; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Ángel Shop</h1>
              <p>Reserva Cancelada</p>
            </div>
            <div class="content">
              <p>Hola ${reservation.customerName || 'Cliente'},</p>
              <p>Tu reserva con código <strong>${reservation.code}</strong> ha sido cancelada y el stock ha sido liberado.</p>
              <p>Esperamos verte pronto en Ángel Shop.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendMail({
      to: reservation.customerEmail,
      subject: `Reserva ${reservation.code} cancelada - Ángel Shop`,
      html: html,
      text: 'Tu reserva fue cancelada y el stock liberado.'
    });
  } catch (error) {
    logger.error('Failed to send reservation cancelled notification:', error);
    return { error: error.message };
  }
}

async function sendReservationStatusUpdate(reservation, previousStatus, newStatus) {
  try {
    const statusLabels = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'IN_DELIVERY': 'En Proceso de Entrega',
      'COMPLETED': 'Entregada',
      'CANCELLED': 'Cancelada',
      'EXPIRED': 'Expirada'
    };

    const statusDescriptions = {
      'PENDING': 'Tu reserva está pendiente de confirmación.',
      'CONFIRMED': 'Tu reserva ha sido confirmada y está lista para ser procesada.',
      'IN_DELIVERY': 'Tu reserva está en proceso de entrega. Te contactaremos pronto para coordinar la entrega.',
      'COMPLETED': '¡Tu reserva ha sido entregada exitosamente! Gracias por elegir Ángel Shop.',
      'CANCELLED': 'Tu reserva ha sido cancelada.',
      'EXPIRED': 'Tu reserva ha expirado.'
    };

    const statusColors = {
      'PENDING': '#ff9800',
      'CONFIRMED': '#2196f3',
      'IN_DELIVERY': '#9c27b0',
      'COMPLETED': '#4caf50',
      'CANCELLED': '#f44336',
      'EXPIRED': '#757575'
    };

    const itemsList = reservation.items.map(item => 
      `- ${item.nameSnapshot} (${item.size}, ${item.color}) x${item.qty} - ₡${(item.priceSnapshot * item.qty).toLocaleString()}`
    ).join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, ${statusColors[newStatus] || '#e91e63'}, ${statusColors[newStatus] || '#f06292'}); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { background: ${statusColors[newStatus] || '#e91e63'}; color: white; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; border-radius: 5px; }
            .items { background: #fff; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .item { padding: 10px 0; border-bottom: 1px solid #eee; }
            .item:last-child { border-bottom: none; }
            .total { font-size: 18px; font-weight: bold; color: #e91e63; text-align: right; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .info-box { background: #e3f2fd; border-left: 4px solid ${statusColors[newStatus] || '#2196f3'}; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Ángel Shop</h1>
              <p>Actualización de tu Reserva</p>
            </div>
            <div class="content">
              <p>Hola ${reservation.customerName || 'Cliente'},</p>
              
              <div class="status-badge">
                Estado: ${statusLabels[newStatus] || newStatus}
              </div>

              <div class="info-box">
                <p><strong>${statusDescriptions[newStatus] || 'El estado de tu reserva ha cambiado.'}</strong></p>
              </div>

              <p>Tu reserva con código <strong>${reservation.code}</strong> ha sido actualizada.</p>

              <div class="items">
                <h3>Productos reservados:</h3>
                ${reservation.items.map(item => `
                  <div class="item">
                    <strong>${item.nameSnapshot}</strong><br>
                    Talla: ${item.size} | Color: ${item.color} | Cantidad: ${item.qty}<br>
                    Precio: ₡${(item.priceSnapshot * item.qty).toLocaleString()}
                  </div>
                `).join('')}
                <div class="total">
                  Total: ₡${reservation.totals.subtotal.toLocaleString()}
                </div>
              </div>

              ${newStatus === 'IN_DELIVERY' ? '<p><strong>Nos pondremos en contacto contigo pronto para coordinar la entrega.</strong></p>' : ''}
              ${newStatus === 'COMPLETED' ? '<p><strong>¡Gracias por tu compra! Esperamos verte de nuevo en Ángel Shop.</strong></p>' : ''}
              
              <div class="footer">
                <p>Gracias por elegir Ángel Shop 💕</p>
                <p>Este es un correo automático, por favor no responder.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendMail({
      to: reservation.customerEmail,
      subject: `Actualización de Reserva ${reservation.code} - ${statusLabels[newStatus] || newStatus} - Ángel Shop`,
      html: html,
      text: `Tu reserva ${reservation.code} ha cambiado de estado a: ${statusLabels[newStatus] || newStatus}.\n\n${statusDescriptions[newStatus] || ''}\n\nProductos:\n${itemsList}\n\nTotal: ₡${reservation.totals.subtotal.toLocaleString()}`
    });
  } catch (error) {
    logger.error('Failed to send reservation status update:', error);
    return { error: error.message };
  }
}

module.exports = {
  sendReservationConfirmation,
  sendReservationCancelled,
  sendReservationExpired,
  sendReservationStatusUpdate
};
