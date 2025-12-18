const router = require('express').Router();
const { z } = require('zod');
const Product = require('../models/Product');
const { validate } = require('../middleware/validate');

const querySchema = z.object({
  query: z.object({
    category: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    q: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional()
  })
});

router.get('/', validate(querySchema), async (req, res, next) => {
  try {
    const { category, size, color, minPrice, maxPrice, q, page = '1', limit = '20' } =
      req.validated.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (size) filter['variants.size'] = size;
    if (color) filter['variants.color'] = color;
    
    const allItems = await Product.find(filter);
    const skip = (Number(page) - 1) * Number(limit);
    const items = allItems.slice(skip, skip + Number(limit));
    const total = allItems.length;
    
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
