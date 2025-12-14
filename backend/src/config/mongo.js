const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('./env');
const { logger } = require('../utils/logger');

async function connectMongo() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: NODE_ENV !== 'production'
    });
    logger.info(`Connected to MongoDB at ${MONGO_URI}`);
  } catch (err) {
    if (MONGO_URI.includes('mongo:27017')) {
      logger.error('Primary Mongo host unreachable, retrying on localhost');
      await mongoose.connect('mongodb://localhost:27017/angelshop?replicaSet=rs0', {
        autoIndex: NODE_ENV !== 'production'
      });
      logger.info('Connected to MongoDB at localhost fallback');
    } else {
      throw err;
    }
  }
}

module.exports = { connectMongo };
