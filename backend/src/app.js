require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const morgan = require('morgan');
const { corsOptions } = require('./config/cors');
const { rateLimiter } = require('./middleware/rateLimit');
const { errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health.routes');
const otpRoutes = require('./routes/otp.routes');
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const reservationsRoutes = require('./routes/reservations.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimit(rateLimiter));
app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize());
app.use(hpp());
app.use(morgan('tiny'));

app.use('/api/health', healthRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;
