const Reservation = require('../models/Reservation');
const Product = require('../models/Product');
const { adjustStock } = require('./inventoryService');
const { shortCode } = require('../utils/id');
const { addHours } = require('../utils/time');
const { RESERVATION_TTL_HOURS } = require('../config/env');
const { sendReservationConfirmation, sendReservationCancelled, sendReservationExpired, sendReservationStatusUpdate } = require('./notificationService');
const { emitStockUpdate, emitReservationEvent } = require('../sockets/events');
const { logger } = require('../utils/logger');

async function createReservation(customerEmail, items, customerData = {}) {
  try {
    logger.info('Creating reservation:', { customerEmail, itemsCount: items.length });
    
    const enriched = [];
    for (const item of items) {
      const productData = await Product.findById(item.productId);
      if (!productData) {
        logger.error('Product not found:', { productId: item.productId });
        throw new Error('Producto no encontrado');
      }
      
      // Convertir a instancia de Product para acceder a métodos si es necesario
      const product = new Product(productData);
      
      const variant = product.variants.find((v) => v.sku === item.variantSku);
      if (!variant) {
        logger.error('Variant not found:', { productId: item.productId, variantSku: item.variantSku });
        throw new Error('Variante no encontrada');
      }
      if (item.qty <= 0) throw new Error('Cantidad inválida');
      if (variant.stockAvailable < item.qty) {
        logger.error('Insufficient stock:', { variantSku: item.variantSku, available: variant.stockAvailable, requested: item.qty });
        throw new Error('Stock insuficiente');
      }
      enriched.push({
        productId: product._id,
        variantSku: variant.sku,
        qty: item.qty,
        priceSnapshot: product.price,
        nameSnapshot: product.name,
        size: variant.size,
        color: variant.color
      });
    }

    logger.info('Enriched items:', enriched.length);
    await adjustStock(null, enriched, 'lock');
    logger.info('Stock adjusted successfully');

    const code = shortCode();
    const expiresAt = addHours(new Date(), RESERVATION_TTL_HOURS);
    const totals = {
      itemsCount: enriched.reduce((a, b) => a + b.qty, 0),
      subtotal: enriched.reduce((a, b) => a + b.qty * b.priceSnapshot, 0)
    };

    logger.info('Creating reservation object:', { code, customerEmail, totals });
    
    const reservation = await Reservation.create({
      code,
      customerEmail,
      customerPhone: customerData.phone || '',
      customerName: customerData.name || '',
      customerAddress: customerData.address || '',
      status: 'PENDING',
      expiresAt: expiresAt.toISOString(),
      items: enriched,
      totals,
      events: [{ type: 'CREATED', at: new Date().toISOString(), meta: {} }]
    });

    logger.info('Reservation created successfully:', { code: reservation.code, _id: reservation._id });

    // Enviar notificación de forma asíncrona sin bloquear
    sendReservationConfirmation(reservation).catch(err => {
      logger.error('Error sending reservation confirmation email:', err);
    });

    // Emitir eventos de stock y reserva
    try {
      enriched.forEach((i) => emitStockUpdate(i.productId.toString(), i.variantSku));
      emitReservationEvent('reservation.created', reservation.code, reservation.status);
    } catch (err) {
      logger.error('Error emitting socket events:', err);
      // No bloquear por errores de socket
    }

    return reservation;
  } catch (err) {
    logger.error('Error creating reservation:', {
      error: err.message,
      stack: err.stack,
      customerEmail,
      itemsCount: items?.length
    });
    throw err;
  }
}

async function cancelReservation(code, email) {
  try {
    const reservationData = await Reservation.findOne({ code });
    if (!reservationData) throw new Error('Reserva no encontrada');
    
    // Convertir a instancia de Reservation
    const reservation = new Reservation(reservationData);
    
    if (email && reservation.customerEmail !== email) throw new Error('No autorizado');
    if (!['PENDING', 'CONFIRMED'].includes(reservation.status)) throw new Error('No se puede cancelar');
    
    await adjustStock(null, reservation.items, 'unlock');
    reservation.status = 'CANCELLED';
    reservation.events.push({ type: 'CANCELLED', at: new Date().toISOString(), meta: {} });
    await reservation.save();
    
    // Enviar notificación de forma asíncrona sin bloquear
    sendReservationCancelled(reservation).catch(err => {
      logger.error('Error sending cancellation email:', err);
    });
    
    try {
      reservation.items.forEach((i) => emitStockUpdate(i.productId.toString(), i.variantSku));
      emitReservationEvent('reservation.updated', reservation.code, reservation.status);
    } catch (err) {
      logger.error('Error emitting socket events:', err);
    }
    
    return reservation;
  } catch (err) {
    throw err;
  }
}

async function expireReservation(reservation) {
  try {
    const freshData = await Reservation.findById(reservation._id);
    if (!freshData || !['PENDING', 'CONFIRMED'].includes(freshData.status)) {
      return null;
    }
    
    // Convertir a instancia de Reservation
    const fresh = new Reservation(freshData);
    
    await adjustStock(null, fresh.items, 'unlock');
    fresh.status = 'EXPIRED';
    fresh.events.push({ type: 'EXPIRED', at: new Date().toISOString(), meta: {} });
    await fresh.save();
    
    // Enviar notificación de forma asíncrona sin bloquear
    sendReservationExpired(fresh).catch(err => {
      logger.error('Error sending expiration email:', err);
    });
    
    try {
      fresh.items.forEach((i) => emitStockUpdate(i.productId.toString(), i.variantSku));
      emitReservationEvent('reservation.updated', fresh.code, fresh.status);
    } catch (err) {
      logger.error('Error emitting socket events:', err);
    }
    
    return fresh;
  } catch (err) {
    throw err;
  }
}

async function updateStatus(code, status) {
  const reservationData = await Reservation.findOne({ code });
  if (!reservationData) throw new Error('Reserva no encontrada');
  
  // Convertir a instancia de Reservation
  const reservation = new Reservation(reservationData);
  
  // Validar estados permitidos
  const validStatuses = ['PENDING', 'CONFIRMED', 'IN_DELIVERY', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Estado inválido: ${status}`);
  }
  
  // Validaciones de transición de estado
  if (status === 'COMPLETED') {
    if (['CANCELLED', 'EXPIRED'].includes(reservation.status)) {
      throw new Error('No se puede completar una reserva cancelada o expirada');
    }
  }
  
  if (status === 'CANCELLED') {
    // Si se cancela, liberar el stock
    if (!['CANCELLED', 'EXPIRED', 'COMPLETED'].includes(reservation.status)) {
      await adjustStock(null, reservation.items, 'unlock');
    }
  }
  
  const previousStatus = reservation.status;
  reservation.status = status;
  reservation.events.push({ 
    type: 'STATUS_CHANGED', 
    at: new Date().toISOString(), 
    meta: { from: previousStatus, to: status } 
  });
  await reservation.save();
  
  // Enviar notificación de actualización de estado
  if (previousStatus !== status) {
    try {
      let emailResult;
      if (status === 'CANCELLED') {
        // Para cancelaciones usar la función específica
        emailResult = await sendReservationCancelled(reservation);
        logger.info(`Email de cancelación enviado para reserva ${reservation.code}`);
      } else {
        // Para otros cambios de estado usar la función de actualización
        emailResult = await sendReservationStatusUpdate(reservation, previousStatus, status);
        logger.info(`Email de actualización de estado enviado para reserva ${reservation.code}: ${previousStatus} -> ${status}`);
      }
      
      // Log del resultado
      if (emailResult?.error) {
        logger.warn(`Email no enviado para reserva ${reservation.code}:`, emailResult.error);
      } else if (emailResult?.id) {
        logger.info(`Email enviado exitosamente para reserva ${reservation.code}, ID: ${emailResult.id}`);
      }
    } catch (err) {
      logger.error(`Error enviando email para reserva ${reservation.code}:`, {
        error: err.message,
        stack: err.stack,
        status: status,
        previousStatus: previousStatus
      });
      // No lanzar error para que el cambio de estado se complete
    }
  }
  
  try {
    emitReservationEvent('reservation.updated', reservation.code, reservation.status);
  } catch (err) {
    logger.error('Error emitting socket events:', err);
  }
  
  return reservation;
}

module.exports = { createReservation, cancelReservation, expireReservation, updateStatus };
