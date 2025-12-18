const cron = require('node-cron');
const Reservation = require('../models/Reservation');
const { expireReservation } = require('../services/reservationService');
const { logger } = require('../utils/logger');

function scheduleExpirationJob() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const toExpire = await Reservation.find({
        status: { $in: ['PENDING', 'CONFIRMED'] }
      });
      const expired = toExpire.filter(r => new Date(r.expiresAt) <= now).slice(0, 50);
      for (const resv of expired) {
        await expireReservation(resv);
      }
    } catch (err) {
      logger.error('Error expirando reservas', err);
    }
  });
}

module.exports = { scheduleExpirationJob };
