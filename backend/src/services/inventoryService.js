const Product = require('../models/Product');

async function adjustStock(session, items, direction = 'lock') {
  for (const item of items) {
    const product = await Product.findById(item.productId).session(session);
    if (!product) throw new Error('Product not found');
    const variant = product.variants.find((v) => v.sku === item.variantSku);
    if (!variant) throw new Error('Variant not found');
    if (direction === 'lock') {
      if (variant.stockAvailable < item.qty) throw new Error('Insufficient stock');
      variant.stockAvailable -= item.qty;
      variant.stockLocked += item.qty;
    } else if (direction === 'unlock') {
      variant.stockLocked = Math.max(0, variant.stockLocked - item.qty);
      variant.stockAvailable += item.qty;
    } else if (direction === 'release') {
      variant.stockLocked = Math.max(0, variant.stockLocked - item.qty);
    }
    await product.save({ session });
  }
}

async function adminAdjustStock(productId, variantSku, deltaAvailable, session) {
  const product = await Product.findById(productId).session(session || null);
  if (!product) throw new Error('Product not found');
  const variant = product.variants.find((v) => v.sku === variantSku);
  if (!variant) throw new Error('Variant not found');
  variant.stockAvailable = Math.max(0, variant.stockAvailable + deltaAvailable);
  await product.save({ session });
  return variant;
}

module.exports = { adjustStock, adminAdjustStock };
