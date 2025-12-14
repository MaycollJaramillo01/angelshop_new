let ioInstance;

function registerEmitters(io) {
  ioInstance = io;
}

function emitStockUpdate(productId, variantSku) {
  if (!ioInstance) return;
  ioInstance.emit('stock.updated', { productId, variantSku });
}

function emitReservationEvent(event, code, status) {
  if (!ioInstance) return;
  ioInstance.emit(event, { code, status });
}

module.exports = { registerEmitters, emitStockUpdate, emitReservationEvent };
