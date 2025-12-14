const router = require('express').Router();
const { z } = require('zod');
const { authOtp } = require('../middleware/authOtp');
const { validate } = require('../middleware/validate');
const { createReservation, cancelReservation } = require('../services/reservationService');
const Reservation = require('../models/Reservation');
const jwt = require('jsonwebtoken');
const { JWT_ADMIN_SECRET } = require('../config/env');

const createSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string(),
          variantSku: z.string(),
          qty: z.number().int().positive()
        })
      )
      .nonempty()
  })
});

router.post('/', authOtp, validate(createSchema), async (req, res, next) => {
  try {
    const reservation = await createReservation(req.otpSession.email, req.validated.body.items);
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
});

router.get('/my', authOtp, async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ customerEmail: req.otpSession.email }).sort({
      createdAt: -1
    });
    res.json(reservations);
  } catch (err) {
    next(err);
  }
});

router.get('/:code', authOtp, async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({ code: req.params.code });
    if (!reservation) return res.status(404).json({ message: 'No encontrada' });
    const adminHeader = req.headers['x-admin-token'];
    let isAdmin = false;
    if (adminHeader) {
      try {
        jwt.verify(adminHeader, JWT_ADMIN_SECRET);
        isAdmin = true;
      } catch (e) {
        isAdmin = false;
      }
    }
    if (!isAdmin && reservation.customerEmail !== req.otpSession.email)
      return res.status(403).json({ message: 'No permitida' });
    res.json(reservation);
  } catch (err) {
    next(err);
  }
});

router.post('/:code/cancel', authOtp, async (req, res, next) => {
  try {
    const reservation = await cancelReservation(req.params.code, req.otpSession.email);
    res.json(reservation);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
