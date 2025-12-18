const Reservation = require('../models/Reservation');

async function summary(from, to) {
  const reservations = await Reservation.find({});
  
  let filtered = reservations;
  if (from || to) {
    filtered = reservations.filter(r => {
      const createdAt = new Date(r.createdAt);
      if (from && createdAt < new Date(from)) return false;
      if (to && createdAt > new Date(to)) return false;
      return true;
    });
  }
  
  const grouped = {};
  filtered.forEach(r => {
    const day = r.createdAt.split('T')[0];
    if (!grouped[day]) {
      grouped[day] = { _id: { day }, total: 0, count: 0, expired: 0 };
    }
    grouped[day].total += r.totals.subtotal || 0;
    grouped[day].count += 1;
    if (r.status === 'EXPIRED') grouped[day].expired += 1;
  });
  
  return Object.values(grouped).sort((a, b) => a._id.day.localeCompare(b._id.day));
}

module.exports = { summary };
