const router = require('express').Router();
const { z } = require('zod');
const Product = require('../models/Product');
const Reservation = require('../models/Reservation');
const { authAdmin } = require('../middleware/authAdmin');
const { validate } = require('../middleware/validate');
const { adminAdjustStock } = require('../services/inventoryService');
const { updateStatus } = require('../services/reservationService');
const { summary } = require('../services/reportsService');

const productSchema = z.object({
  body: z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    price: z.number(),
    images: z.array(z.string()).default([]),
    variants: z
      .array(
        z.object({
          sku: z.string(),
          size: z.string(),
          color: z.string(),
          stockAvailable: z.number().int(),
          stockLocked: z.number().int().optional(),
          lowStockThreshold: z.number().int().optional()
        })
      )
      .nonempty(),
    isActive: z.boolean().optional()
  })
});

router.use(authAdmin);

router.post('/products', validate(productSchema), async (req, res, next) => {
  try {
    const product = await Product.create(req.validated.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.get('/products', async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id', validate(productSchema), async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.validated.body, {
      new: true
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/products/:id/stock',
  validate(
    z.object({
      body: z.object({ variantSku: z.string(), delta: z.number().int() })
    })
  ),
  async (req, res, next) => {
    try {
      const variant = await adminAdjustStock(
        req.params.id,
        req.validated.body.variantSku,
        req.validated.body.delta
      );
      res.json(variant);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/reservations', async (req, res, next) => {
  try {
    const { status, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (from) filter.createdAt = { ...filter.createdAt, $gte: new Date(from) };
    if (to) filter.createdAt = { ...filter.createdAt, $lte: new Date(to) };
    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/reservations/:code/status',
  validate(z.object({ body: z.object({ status: z.string() }) })),
  async (req, res, next) => {
    try {
      const reservation = await updateStatus(req.params.code, req.validated.body.status);
      res.json(reservation);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/reports/summary', async (req, res, next) => {
  try {
    const data = await summary(req.query.from, req.query.to);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
