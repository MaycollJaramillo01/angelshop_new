const fs = require('fs').promises;
const path = require('path');

const DB_DIR = path.join(__dirname, '../../data');
const COLLECTIONS = {
  products: path.join(DB_DIR, 'products.json'),
  reservations: path.join(DB_DIR, 'reservations.json'),
  adminUsers: path.join(DB_DIR, 'adminUsers.json'),
  otpCodes: path.join(DB_DIR, 'otpCodes.json')
};

// Asegurar que el directorio existe
async function ensureDbDir() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

// Leer colección
async function readCollection(name) {
  await ensureDbDir();
  const filePath = COLLECTIONS[name];
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

// Escribir colección
async function writeCollection(name, data) {
  try {
    await ensureDbDir();
    const filePath = COLLECTIONS[name];
    if (!filePath) {
      throw new Error(`Collection "${name}" not found in COLLECTIONS`);
    }
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, 'utf8');
  } catch (err) {
    const { logger } = require('../utils/logger');
    logger.error(`Error writing collection "${name}":`, {
      error: err.message,
      stack: err.stack,
      collection: name
    });
    throw err;
  }
}

// Generar ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Helper para encontrar por ID
function findById(arr, id) {
  return arr.find(item => item._id === id || item.id === id);
}

// Helper para encontrar índice por ID
function findIndexById(arr, id) {
  return arr.findIndex(item => item._id === id || item.id === id);
}

module.exports = {
  readCollection,
  writeCollection,
  generateId,
  findById,
  findIndexById,
  ensureDbDir
};
