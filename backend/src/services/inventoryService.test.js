jest.mock('../models/Product');
const Product = require('../models/Product');
const { adjustStock } = require('./inventoryService');

describe('inventoryService.adjustStock', () => {
  it('locks and unlocks stock correctly', async () => {
    const variant = { sku: 'SKU1', stockAvailable: 5, stockLocked: 0 };
    const product = {
      variants: [variant],
      save: jest.fn()
    };
    Product.findById = jest.fn().mockResolvedValue(product);

    const session = { some: 'session' };
    await adjustStock(session, [{ productId: '1', variantSku: 'SKU1', qty: 2 }], 'lock');
    expect(variant.stockAvailable).toBe(3);
    expect(variant.stockLocked).toBe(2);

    await adjustStock(session, [{ productId: '1', variantSku: 'SKU1', qty: 1 }], 'unlock');
    expect(variant.stockAvailable).toBe(4);
    expect(variant.stockLocked).toBe(1);
  });
});
