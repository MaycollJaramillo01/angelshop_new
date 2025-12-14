const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('./env');
const { logger } = require('../utils/logger');

async function connectMongo() {
  mongoose.set('strictQuery', true);
  const fallbackUri = 'mongodb://localhost:27017/angelshop';
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: NODE_ENV !== 'production'
    });
    logger.info(`Connected to MongoDB at ${MONGO_URI}`);
  } catch (err) {
    const shouldFallbackHost = MONGO_URI.includes('mongo:27017');
    const replicaSetMissing = err?.reason?.type === 'ReplicaSetNoPrimary';
    if (shouldFallbackHost || replicaSetMissing) {
      logger.error('Primary Mongo host unreachable, retrying on localhost');
      await mongoose.connect(fallbackUri, {
        autoIndex: NODE_ENV !== 'production'
      });
      logger.info(`Connected to MongoDB at ${fallbackUri}`);
    } else {
      throw err;
    }
  }
}

module.exports = { connectMongo };
