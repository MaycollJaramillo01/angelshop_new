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
          qty: z.union([z.number().int().positive(), z.string().transform(val => parseInt(val)).pipe(z.number().int().positive())])
        })
      )
      .nonempty()
  })
});

const createDirectSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre es demasiado largo'),
    email: z.string()
      .email('Email inválido')
      .toLowerCase()
      .trim(),
    phone: z.string()
      .min(8, 'El teléfono debe tener al menos 8 caracteres')
      .max(20, 'El teléfono es demasiado largo')
      .regex(/^[\d\s\-+()]+$/, 'El teléfono contiene caracteres inválidos'),
    address: z.string()
      .min(10, 'La dirección debe tener al menos 10 caracteres')
      .max(500, 'La dirección es demasiado larga')
      .trim(),
    items: z
      .array(
        z.object({
          productId: z.string()
            .min(1, 'productId es requerido')
            .trim(),
          variantSku: z.string()
            .min(1, 'variantSku es requerido')
            .trim(),
          qty: z.preprocess(
            (val) => {
              if (typeof val === 'string') {
                const num = parseInt(val, 10);
                return isNaN(num) ? val : num;
              }
              return val;
            },
            z.number()
              .int('La cantidad debe ser un número entero')
              .positive('La cantidad debe ser mayor a 0')
              .max(100, 'La cantidad no puede ser mayor a 100')
          )
        })
      )
      .min(1, 'Debe agregar al menos un producto')
      .max(50, 'No se pueden agregar más de 50 productos')
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

router.post('/direct', validate(createDirectSchema), async (req, res, next) => {
  try {
    const { name, email, phone, address, items } = req.validated.body;
    const reservation = await createReservation(email, items, { name, phone, address });
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
});

router.get('/my', authOtp, async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ customerEmail: req.otpSession.email });
    reservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(reservations);
  } catch (err) {
    next(err);
  }
});

router.get('/by-email/:email', async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ customerEmail: req.params.email });
    reservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
