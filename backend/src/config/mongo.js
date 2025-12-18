const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('./env');
const { logger } = require('../utils/logger');

async function connectMongo() {
  mongoose.set('strictQuery', true);
  const fallbackUriWithReplicaSet = 'mongodb://localhost:27017/angelshop?replicaSet=rs0';
  const fallbackUriWithoutReplicaSet = 'mongodb://localhost:27017/angelshop';
  
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000
    });
    logger.info(`Connected to MongoDB at ${MONGO_URI}`);
  } catch (err) {
    const shouldFallbackHost = MONGO_URI.includes('mongo:27017');
    const replicaSetMissing = err?.reason?.type === 'ReplicaSetNoPrimary';
    const hostNotFound = err?.message?.includes('ENOTFOUND') || err?.message?.includes('getaddrinfo');
    
    if (shouldFallbackHost || replicaSetMissing || hostNotFound) {
      logger.error('Primary Mongo host unreachable, retrying on localhost');
      
      try {
        // Try with replicaSet first (if MongoDB is configured with replica set)
        await mongoose.connect(fallbackUriWithReplicaSet, {
          autoIndex: NODE_ENV !== 'production',
          serverSelectionTimeoutMS: 5000
        });
        logger.info(`Connected to MongoDB at ${fallbackUriWithReplicaSet}`);
      } catch (fallbackErr) {
        // If replicaSet fails, try without it (for standalone MongoDB)
        if (fallbackErr?.reason?.type === 'ReplicaSetNoPrimary') {
          logger.warn('Replica set not available, trying without replicaSet parameter');
          await mongoose.connect(fallbackUriWithoutReplicaSet, {
            autoIndex: NODE_ENV !== 'production',
            serverSelectionTimeoutMS: 5000
          });
          logger.info(`Connected to MongoDB at ${fallbackUriWithoutReplicaSet}`);
        } else {
          logger.error('Failed to connect to MongoDB on localhost', fallbackErr);
          throw fallbackErr;
        }
      }
    } else {
      throw err;
    }
  }
}

module.exports = { connectMongo };
