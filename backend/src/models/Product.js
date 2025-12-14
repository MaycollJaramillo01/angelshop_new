const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    size: { type: String, enum: ['S', 'M', 'L', 'XL'], required: true },
    color: { type: String, required: true },
    stockAvailable: { type: Number, default: 0 },
    stockLocked: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 2 }
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    category: String,
    price: { type: Number, required: true },
    images: [String],
    variants: [VariantSchema],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ProductSchema.index({ 'variants.sku': 1 });

module.exports = mongoose.model('Product', ProductSchema);
