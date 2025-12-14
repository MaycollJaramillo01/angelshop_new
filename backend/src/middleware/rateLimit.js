const { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } = require('../config/env');

const rateLimiter = {
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false
};

module.exports = { rateLimiter };
