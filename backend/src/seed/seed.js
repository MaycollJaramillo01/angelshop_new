require('dotenv').config();
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const AdminUser = require('../models/AdminUser');
const { ensureDbDir } = require('../db');

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
const colors = ['Blanco', 'Negro', 'Rojo', 'Veish', 'Celeste', 'Verde', 'Azul', 'Dorado', 'Rosado', 'Morado'];

// Mapeo de categorías/subcategorías a carpetas de assets
const categoryFolderMap = {
  'Blusas': {
    'Blazer': 'Blazers',
    'Chalecos': 'chalecos'
  },
  'Enterizos': {
    'Enterizos Cortos': 'Enterizos_cortos'
  },
  'Conjuntos': {
    'Conjunto Largo': 'Sets_largos'
  },
  'Shorts': 'shorts'
};

// Conteo de imágenes disponibles por carpeta
const imageCounts = {
  'Blazers': 18,
  'chalecos': 11,
  'Enterizos_cortos': 9, // 8 .jpg + 1 .jpeg
  'Sets_largos': 20,
  'shorts': 7
};

// Función para obtener la carpeta de assets según categoría/subcategoría
function getAssetFolder(category, subcategory = '') {
  if (categoryFolderMap[category]) {
    if (typeof categoryFolderMap[category] === 'object' && subcategory) {
      return categoryFolderMap[category][subcategory] || null;
    }
    if (typeof categoryFolderMap[category] === 'string') {
      return categoryFolderMap[category];
    }
  }
  return null;
}

// Función para generar imágenes locales desde assets
function getLocalImages(category, subcategory = '', productIndex = 0) {
  const folder = getAssetFolder(category, subcategory);
  
  if (!folder) {
    // Si no hay carpeta mapeada, usar placeholder
    return ['https://via.placeholder.com/800?text=Sin+imagen'];
  }

  const imageCount = imageCounts[folder] || 0;
  if (imageCount === 0) {
    return ['https://via.placeholder.com/800?text=Sin+imagen'];
  }

  // Obtener índice de imagen única para este producto (evitar repeticiones)
  const imageIndex = (productIndex % imageCount) + 1;
  
  // Determinar extensión según la carpeta
  // Enterizos_cortos: la mayoría son .jpg, pero el 2.jpeg es especial
  let extension = 'jpeg';
  if (folder === 'Enterizos_cortos') {
    // Para Enterizos_cortos, usar .jpg excepto para la imagen 2 que es .jpeg
    extension = imageIndex === 2 ? 'jpeg' : 'jpg';
  }
  
  // Generar ruta para servir imágenes estáticas desde public/assets
  // En Vite, las imágenes en public/ se sirven desde la raíz con /assets/
  const imagePath = `/assets/${folder}/${imageIndex}.${extension}`;
  
  // Retornar solo una imagen por producto para evitar repeticiones
  return [imagePath];
}

// Función para generar imágenes apropiadas según el tipo de producto
// productIndex: índice del producto dentro de su categoría (0-9 para cada grupo de 10)
function getProductImages(category, subcategory = '', productIndex = 0) {
  // Intentar obtener imágenes locales primero
  const localImages = getLocalImages(category, subcategory, productIndex);
  
  // Si encontramos imágenes locales, usarlas
  if (localImages && localImages[0] && !localImages[0].includes('placeholder')) {
    return localImages;
  }

  // Fallback a imágenes por defecto si no hay carpeta mapeada
  return ['https://via.placeholder.com/800?text=Sin+imagen'];
}

// Productos organizados por categorías
const productsData = [
  // PANTALONES - Pantalón de vestir (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Pantalón de Vestir ${i + 1}`,
    category: 'Pantalones',
    subcategory: 'Pantalón de vestir',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 35000 + (i * 2000),
    images: getProductImages('Pantalones', 'Pantalón de vestir'),
    description: `Pantalón de vestir elegante ${i + 1}, perfecto para ocasiones formales y casuales.`
  })),
  
  // PANTALONES - Palazzo (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Pantalón Palazzo ${i + 1}`,
    category: 'Pantalones',
    subcategory: 'Palazzo',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 32000 + (i * 1500),
    images: getProductImages('Pantalones', 'Palazzo'),
    description: `Pantalón palazzo cómodo ${i + 1}, ideal para el verano.`
  })),
  
  // PANTALONES - Jeans (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Jeans ${i + 1}`,
    category: 'Pantalones',
    subcategory: 'Jeans',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 28000 + (i * 1000),
    images: getProductImages('Pantalones', 'Jeans'),
    description: `Jeans clásico ${i + 1}, versátil y duradero.`
  })),
  
  // SHORTS (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Short ${i + 1}`,
    category: 'Shorts',
    subcategory: '',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 18000 + (i * 1000),
    images: getProductImages('Shorts', '', i),
    description: `Short cómodo ${i + 1}, perfecto para el verano.`
  })),
  
  // ENAGUAS (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Enagua ${i + 1}`,
    category: 'Enaguas',
    subcategory: '',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 15000 + (i * 800),
    images: getProductImages('Enaguas'),
    description: `Enagua elegante ${i + 1}, ideal para ocasiones especiales.`
  })),
  
  // CONJUNTOS - Largo (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Conjunto Largo ${i + 1}`,
    category: 'Conjuntos',
    subcategory: 'Conjunto Largo',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 45000 + (i * 2000),
    images: getProductImages('Conjuntos', 'Conjunto Largo', i),
    description: `Conjunto largo elegante ${i + 1}, perfecto para ocasiones formales.`
  })),
  
  // CONJUNTOS - Corto (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Conjunto Corto ${i + 1}`,
    category: 'Conjuntos',
    subcategory: 'Conjunto Corto',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 38000 + (i * 1500),
    images: getProductImages('Conjuntos', 'Conjunto Corto'),
    description: `Conjunto corto moderno ${i + 1}, ideal para el día a día.`
  })),
  
  // ENTERIZOS - Largos (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Enterizo Largo ${i + 1}`,
    category: 'Enterizos',
    subcategory: 'Enterizos Largos',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 42000 + (i * 1800),
    images: getProductImages('Enterizos', 'Enterizos Largos'),
    description: `Enterizo largo elegante ${i + 1}, cómodo y versátil.`
  })),
  
  // ENTERIZOS - Cortos (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Enterizo Corto ${i + 1}`,
    category: 'Enterizos',
    subcategory: 'Enterizos Cortos',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 35000 + (i * 1500),
    images: getProductImages('Enterizos', 'Enterizos Cortos', i),
    description: `Enterizo corto moderno ${i + 1}, perfecto para el verano.`
  })),
  
  // VESTIDOS - Largo (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Vestido Largo ${i + 1}`,
    category: 'Vestidos',
    subcategory: 'Vestidos Largo',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 48000 + (i * 2000),
    images: getProductImages('Vestidos', 'Vestidos Largo'),
    description: `Vestido largo elegante ${i + 1}, perfecto para ocasiones especiales.`
  })),
  
  // VESTIDOS - Cortos (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Vestido Corto ${i + 1}`,
    category: 'Vestidos',
    subcategory: 'Vestidos Cortos',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 38000 + (i * 1500),
    images: getProductImages('Vestidos', 'Vestidos Cortos'),
    description: `Vestido corto moderno ${i + 1}, ideal para el día a día.`
  })),
  
  // VESTIDOS - Fiesta (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Vestido de Fiesta ${i + 1}`,
    category: 'Vestidos',
    subcategory: 'Fiesta',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 55000 + (i * 2500),
    images: getProductImages('Vestidos', 'Fiesta'),
    description: `Vestido de fiesta elegante ${i + 1}, perfecto para eventos especiales.`
  })),
  
  // BLUSAS - Camisera (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Blusa Camisera ${i + 1}`,
    category: 'Blusas',
    subcategory: 'Camisera',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 28000 + (i * 1200),
    images: getProductImages('Blusas', 'Camisera'),
    description: `Blusa camisera elegante ${i + 1}, perfecta para ocasiones formales.`
  })),
  
  // BLUSAS - Blazer (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Blazer ${i + 1}`,
    category: 'Blusas',
    subcategory: 'Blazer',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 45000 + (i * 2000),
    images: getProductImages('Blusas', 'Blazer', i),
    description: `Blazer elegante ${i + 1}, perfecto para ocasiones formales.`
  })),
  
  // BLUSAS - Plus (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Blusa Plus ${i + 1}`,
    category: 'Blusas',
    subcategory: 'Plus',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 32000 + (i * 1500),
    images: getProductImages('Blusas', 'Plus'),
    description: `Blusa plus cómoda ${i + 1}, ideal para todos los días.`
  })),
  
  // BLUSAS - Blusas (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Blusa ${i + 1}`,
    category: 'Blusas',
    subcategory: 'Blusas',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 25000 + (i * 1000),
    images: getProductImages('Blusas', 'Blusas'),
    description: `Blusa elegante ${i + 1}, versátil y cómoda.`
  })),
  
  // BLUSAS - Camisa (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Camisa ${i + 1}`,
    category: 'Blusas',
    subcategory: 'Camisa',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 27000 + (i * 1200),
    images: getProductImages('Blusas', 'Camisa'),
    description: `Camisa clásica ${i + 1}, perfecta para ocasiones formales.`
  })),
  
  // BLUSAS - Blusas Cortas (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Blusa Corta ${i + 1}`,
    category: 'Blusas',
    subcategory: 'Blusas Cortas',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 22000 + (i * 1000),
    images: getProductImages('Blusas', 'Blusas Cortas'),
    description: `Blusa corta moderna ${i + 1}, ideal para el verano.`
  })),
  
  // BLUSAS - Chalecos (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Chaleco ${i + 1}`,
    category: 'Blusas',
    subcategory: 'Chalecos',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 30000 + (i * 1500),
    images: getProductImages('Blusas', 'Chalecos', i),
    description: `Chaleco elegante ${i + 1}, perfecto para capas.`
  })),
  
  // BLUSAS - Budy (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Budy ${i + 1}`,
    category: 'Blusas',
    subcategory: 'Budy',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 35000 + (i * 1800),
    images: getProductImages('Blusas', 'Budy'),
    description: `Budy elegante ${i + 1}, perfecto para ocasiones especiales.`
  })),
  
  // BOLSOS (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Bolso ${i + 1}`,
    category: 'Bolsos',
    subcategory: '',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 25000 + (i * 2000),
    images: getProductImages('Bolsos'),
    description: `Bolso elegante ${i + 1}, perfecto para todos los días.`
  })),
  
  // JOYERÍA - Coyares (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Collar ${i + 1}`,
    category: 'Joyería',
    subcategory: 'Coyares',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 15000 + (i * 1000),
    images: getProductImages('Joyería', 'Coyares'),
    description: `Collar elegante ${i + 1}, perfecto para complementar tu look.`
  })),
  
  // JOYERÍA - Pulseras (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Pulsera ${i + 1}`,
    category: 'Joyería',
    subcategory: 'Pulseras',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 12000 + (i * 800),
    images: getProductImages('Joyería', 'Pulseras'),
    description: `Pulsera elegante ${i + 1}, perfecta para complementar tu look.`
  })),
  
  // JOYERÍA - Aretes (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Aretes ${i + 1}`,
    category: 'Joyería',
    subcategory: 'Aretes',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 10000 + (i * 700),
    images: getProductImages('Joyería', 'Aretes'),
    description: `Aretes elegantes ${i + 1}, perfectos para complementar tu look.`
  })),
  
  // JOYERÍA - Earcuff (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Earcuff ${i + 1}`,
    category: 'Joyería',
    subcategory: 'Earcuff',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 13000 + (i * 900),
    images: getProductImages('Joyería', 'Earcuff'),
    description: `Earcuff elegante ${i + 1}, perfecto para complementar tu look.`
  })),
  
  // JOYERÍA - Llaveros (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Llavero ${i + 1}`,
    category: 'Joyería',
    subcategory: 'Llaveros',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 8000 + (i * 500),
    images: getProductImages('Joyería', 'Llaveros'),
    description: `Llavero elegante ${i + 1}, perfecto para tus llaves.`
  })),
  
  // PERFUMES - Mujer (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Perfume Mujer ${i + 1}`,
    category: 'Perfumes',
    subcategory: 'Mujer',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 35000 + (i * 2000),
    images: getProductImages('Perfumes', 'Mujer'),
    description: `Perfume para mujer ${i + 1}, fragancia elegante y duradera.`
  })),
  
  // PERFUMES - Hombre (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Perfume Hombre ${i + 1}`,
    category: 'Perfumes',
    subcategory: 'Hombre',
    collection: i < 3 ? 'Nueva Colección' : i < 6 ? 'Temporada' : 'Clásicos',
    price: 38000 + (i * 2200),
    images: getProductImages('Perfumes', 'Hombre'),
    description: `Perfume para hombre ${i + 1}, fragancia elegante y duradera.`
  }))
];

function buildProducts() {
  return productsData.map((product, index) => {
    const slug = product.name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const variants = sizes.map((size, i) => {
      const color = colors[(index + i) % colors.length];
      return {
        sku: `${slug.toUpperCase()}-${size}-${color.toUpperCase()}-${i}`,
      size,
        color,
        stockAvailable: 3 + ((index + i) % 4),
      stockLocked: 0,
      lowStockThreshold: 2
      };
    });

    return {
      name: product.name,
      slug,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory || '',
      collection: product.collection,
      price: product.price,
      images: product.images,
      variants,
      isActive: true
    };
  });
}

async function seed() {
  await ensureDbDir();
  await Product.deleteMany({});
  await AdminUser.deleteMany({});
  const products = buildProducts();
  await Product.insertMany(products);
  
  // Asegurar que el hash se genera correctamente
  const adminPass = await bcrypt.hash('admin2025', 10);
  console.log('Hash generado:', adminPass);
  await AdminUser.create({ 
    email: 'admin@angelshop.com', 
    passwordHash: adminPass, 
    role: 'ADMIN' 
  });
  console.log(`Seed completado - ${products.length} productos creados y usuario admin`);
  console.log('Credenciales: admin@angelshop.com / admin2025');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
