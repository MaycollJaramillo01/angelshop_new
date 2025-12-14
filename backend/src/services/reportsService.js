const Reservation = require('../models/Reservation');

async function summary(from, to) {
  const match = {};
  if (from) match.createdAt = { ...match.createdAt, $gte: new Date(from) };
  if (to) match.createdAt = { ...match.createdAt, $lte: new Date(to) };
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: { day: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } } },
        total: { $sum: '$totals.subtotal' },
        count: { $sum: 1 },
        expired: { $sum: { $cond: [{ $eq: ['$status', 'EXPIRED'] }, 1, 0] } }
      }
    },
    { $sort: { '_id.day': 1 } }
  ];
  return Reservation.aggregate(pipeline);
}

module.exports = { summary };
