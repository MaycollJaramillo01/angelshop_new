const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('./env');
const { logger } = require('../utils/logger');

async function connectMongo() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGO_URI, {
    autoIndex: NODE_ENV !== 'production'
  });
  logger.info('Connected to MongoDB');
}

module.exports = { connectMongo };
