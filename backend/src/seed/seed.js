require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const AdminUser = require('../models/AdminUser');
const { MONGO_URI } = require('../config/env');

const sizes = ['S', 'M', 'L', 'XL'];
const colors = ['Rojo', 'Azul', 'Negro', 'Blanco', 'Verde'];

const baseProducts = [
  'Camiseta deportiva',
  'Pantalón casual',
  'Blusa elegante',
  'Vestido veraniego',
  'Chaqueta ligera',
  'Sudadera con capucha',
  'Jeans ajustados',
  'Short playero',
  'Camisa manga larga',
  'Falda midi',
  'Top básico',
  'Polo clásico',
  'Leggings',
  'Chaleco acolchado',
  'Abrigo impermeable',
  'Camisa lino',
  'Blazer',
  'Cardigan',
  'Pijama algodón',
  'Traje de baño',
  'Camiseta gráfica',
  'Tank top',
  'Jogger',
  'Gorra',
  'Bufanda',
  'Guantes',
  'Calcetines',
  'Bolso tote',
  'Cinturón',
  'Zapatos deportivos'
];

function buildProducts() {
  return baseProducts.map((name, index) => {
    const price = 10000 + index * 500;
    const variants = sizes.slice(0, 4).map((size, i) => ({
      sku: `${name.replace(/\s+/g, '').toUpperCase()}-${size}-${i}`,
      size,
      color: colors[(index + i) % colors.length],
      stockAvailable: 5 + ((index + i) % 5),
      stockLocked: 0,
      lowStockThreshold: 2
    }));
    return {
      name: `${name} ${index + 1}`,
      slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
      description: `${name} de Ángel Shop en Orotina, Costa Rica. Calidad garantizada.`,
      category: index % 2 === 0 ? 'Ropa' : 'Accesorios',
      price,
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=60'
      ],
      variants,
      isActive: true
    };
  });
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  await Product.deleteMany({});
  await AdminUser.deleteMany({});
  const products = buildProducts();
  await Product.insertMany(products);
  const adminPass = await bcrypt.hash('admin123', 10);
  await AdminUser.create({ email: 'admin@angelshop.com', passwordHash: adminPass, role: 'ADMIN' });
  console.log('Seed completado');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
