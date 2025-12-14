const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Product = require('../models/Product');
const { adjustStock } = require('./inventoryService');
const { shortCode } = require('../utils/id');
const { addHours } = require('../utils/time');
const { RESERVATION_TTL_HOURS } = require('../config/env');
const { sendReservationConfirmation, sendReservationCancelled, sendReservationExpired } = require('./notificationService');
const { emitStockUpdate, emitReservationEvent } = require('../sockets/events');

async function createReservation(customerEmail, items) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const enriched = [];
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error('Producto no encontrado');
      const variant = product.variants.find((v) => v.sku === item.variantSku);
      if (!variant) throw new Error('Variante no encontrada');
      if (item.qty <= 0) throw new Error('Cantidad inválida');
      if (variant.stockAvailable < item.qty) throw new Error('Stock insuficiente');
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

    await adjustStock(session, enriched, 'lock');

    const code = shortCode();
    const expiresAt = addHours(new Date(), RESERVATION_TTL_HOURS);
    const totals = {
      itemsCount: enriched.reduce((a, b) => a + b.qty, 0),
      subtotal: enriched.reduce((a, b) => a + b.qty * b.priceSnapshot, 0)
    };

    const reservation = await Reservation.create(
      [
        {
          code,
          customerEmail,
          status: 'PENDING',
          expiresAt,
          items: enriched,
          totals,
          events: [{ type: 'CREATED', at: new Date(), meta: {} }]
        }
      ],
      { session }
    );

    await session.commitTransaction();
    const created = reservation[0];
    await sendReservationConfirmation(created);
    enriched.forEach((i) => emitStockUpdate(i.productId.toString(), i.variantSku));
    emitReservationEvent('reservation.created', created.code, created.status);
    return created;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function cancelReservation(code, email) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const reservation = await Reservation.findOne({ code }).session(session);
    if (!reservation) throw new Error('Reserva no encontrada');
    if (email && reservation.customerEmail !== email) throw new Error('No autorizado');
    if (!['PENDING', 'CONFIRMED'].includes(reservation.status)) throw new Error('No se puede cancelar');
    await adjustStock(session, reservation.items, 'unlock');
    reservation.status = 'CANCELLED';
    reservation.events.push({ type: 'CANCELLED', at: new Date(), meta: {} });
    await reservation.save({ session });
    await session.commitTransaction();
    await sendReservationCancelled(reservation);
    reservation.items.forEach((i) => emitStockUpdate(i.productId.toString(), i.variantSku));
    emitReservationEvent('reservation.updated', reservation.code, reservation.status);
    return reservation;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function expireReservation(reservation) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const fresh = await Reservation.findById(reservation._id).session(session);
    if (!fresh || !['PENDING', 'CONFIRMED'].includes(fresh.status)) {
      await session.abortTransaction();
      return null;
    }
    await adjustStock(session, fresh.items, 'unlock');
    fresh.status = 'EXPIRED';
    fresh.events.push({ type: 'EXPIRED', at: new Date(), meta: {} });
    await fresh.save({ session });
    await session.commitTransaction();
    await sendReservationExpired(fresh);
    fresh.items.forEach((i) => emitStockUpdate(i.productId.toString(), i.variantSku));
    emitReservationEvent('reservation.updated', fresh.code, fresh.status);
    return fresh;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function updateStatus(code, status) {
  const reservation = await Reservation.findOne({ code });
  if (!reservation) throw new Error('Reserva no encontrada');
  if (status === 'COMPLETED') {
    if (['CANCELLED', 'EXPIRED'].includes(reservation.status)) throw new Error('No se puede completar');
    reservation.items.forEach((item) => {
      item.qty = item.qty; // no-op
    });
    reservation.status = 'COMPLETED';
  } else {
    reservation.status = status;
  }
  reservation.events.push({ type: status, at: new Date(), meta: {} });
  await reservation.save();
  emitReservationEvent('reservation.updated', reservation.code, reservation.status);
  return reservation;
}

module.exports = { createReservation, cancelReservation, expireReservation, updateStatus };
