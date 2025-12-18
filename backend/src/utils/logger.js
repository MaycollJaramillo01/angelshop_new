const logger = {
  info: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('[INFO]', ...args);
    }
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  }
};

module.exports = { logger };
