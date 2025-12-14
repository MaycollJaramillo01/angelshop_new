const RESERVATION_TTL_HOURS = Number(process.env.RESERVATION_TTL_HOURS || 48);
module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/angelshop?replicaSet=rs0',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  JWT_ADMIN_SECRET: process.env.JWT_ADMIN_SECRET || 'dev-admin-secret',
  JWT_OTP_SECRET: process.env.JWT_OTP_SECRET || 'dev-otp-secret',
  OTP_TTL_MINUTES: Number(process.env.OTP_TTL_MINUTES || 10),
  RESERVATION_TTL_HOURS,
  SMTP_HOST: process.env.SMTP_HOST || 'localhost',
  SMTP_PORT: Number(process.env.SMTP_PORT || 1025),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || 'Angel Shop <no-reply@angelshop.com>',
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 120)
};
