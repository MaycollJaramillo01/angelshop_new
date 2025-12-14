const { CORS_ORIGIN } = require('./env');

const corsOptions = {
  origin: CORS_ORIGIN.split(',').map((o) => o.trim()),
  optionsSuccessStatus: 200
};

module.exports = { corsOptions };
