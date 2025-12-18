const { readCollection, writeCollection, generateId, findById, findIndexById } = require('../db');

class Product {
  constructor(data) {
    this._id = data._id || generateId();
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description || '';
    this.category = data.category || '';
    this.subcategory = data.subcategory || '';
    this.collection = data.collection || '';
    this.price = data.price;
    this.images = data.images || [];
    this.variants = data.variants || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async find(filter = {}) {
    const products = await readCollection('products');
    return products.filter(p => {
      if (filter.isActive !== undefined && p.isActive !== filter.isActive) return false;
      if (filter.category && p.category !== filter.category) return false;
      if (filter.name && typeof filter.name === 'object') {
        // Regex search
        const regex = new RegExp(filter.name.$regex, filter.name.$options || '');
        if (!regex.test(p.name)) return false;
      } else if (filter.name && p.name !== filter.name) return false;
      if (filter.price) {
        if (filter.price.$gte && p.price < filter.price.$gte) return false;
        if (filter.price.$lte && p.price > filter.price.$lte) return false;
      }
      if (filter['variants.size']) {
        if (!p.variants.some(v => v.size === filter['variants.size'])) return false;
      }
      if (filter['variants.color']) {
        if (!p.variants.some(v => v.color === filter['variants.color'])) return false;
      }
      return true;
    });
  }

  static async findOne(filter) {
    const products = await readCollection('products');
    if (filter._id || filter.id) {
      return findById(products, filter._id || filter.id) || null;
    }
    return products.find(p => {
      if (filter.slug && p.slug !== filter.slug) return false;
      if (filter.isActive !== undefined && p.isActive !== filter.isActive) return false;
      return true;
    }) || null;
  }

  static async findById(id) {
    const products = await readCollection('products');
    return findById(products, id) || null;
  }

  static async countDocuments(filter = {}) {
    const items = await this.find(filter);
    return items.length;
  }

  async save() {
    const products = await readCollection('products');
    const index = findIndexById(products, this._id);
    this.updatedAt = new Date().toISOString();
    
    if (index >= 0) {
      products[index] = this;
    } else {
      products.push(this);
    }
    
    await writeCollection('products', products);
    return this;
  }

  static async create(data) {
    const product = new Product(data);
    await product.save();
    return product;
  }

  static async insertMany(dataArray) {
    const products = await readCollection('products');
    const newProducts = dataArray.map(data => new Product(data));
    products.push(...newProducts);
    await writeCollection('products', products);
    return newProducts;
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const products = await readCollection('products');
    const index = findIndexById(products, id);
    if (index < 0) return null;
    
    const product = { ...products[index], ...update };
    product.updatedAt = new Date().toISOString();
    products[index] = product;
    await writeCollection('products', products);
    return new Product(product);
  }

  static async findByIdAndDelete(id) {
    const products = await readCollection('products');
    const index = findIndexById(products, id);
    if (index < 0) return null;
    
    products.splice(index, 1);
    await writeCollection('products', products);
    return { ok: true };
  }

  static async deleteMany(filter = {}) {
    if (Object.keys(filter).length === 0) {
      await writeCollection('products', []);
      return { deletedCount: 0 };
    }
    const products = await readCollection('products');
    const initialLength = products.length;
    const filtered = products.filter(p => {
      for (const key in filter) {
        if (p[key] !== filter[key]) return true;
      }
      return false;
    });
    await writeCollection('products', filtered);
    return { deletedCount: initialLength - filtered.length };
  }
}

module.exports = Product;
