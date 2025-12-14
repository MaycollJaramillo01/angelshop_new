const jwt = require('jsonwebtoken');
const { JWT_OTP_SECRET } = require('../config/env');

function authOtp(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'OTP token required' });
  const token = header.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_OTP_SECRET);
    req.otpSession = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid OTP token' });
  }
}

module.exports = { authOtp };
