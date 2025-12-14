const mongoose = require('mongoose');

const ReservationItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, required: true },
    qty: { type: Number, required: true },
    priceSnapshot: { type: Number, required: true },
    nameSnapshot: { type: String, required: true },
    size: String,
    color: String
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema(
  {
    type: String,
    at: Date,
    meta: Object
  },
  { _id: false }
);

const ReservationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    customerEmail: { type: String, required: true },
    customerPhone: String,
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'COMPLETED'],
      default: 'PENDING'
    },
    expiresAt: { type: Date, required: true },
    items: [ReservationItemSchema],
    totals: {
      itemsCount: Number,
      subtotal: Number
    },
    events: [EventSchema]
  },
  { timestamps: true }
);

ReservationSchema.index({ code: 1 }, { unique: true });
ReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Reservation', ReservationSchema);
