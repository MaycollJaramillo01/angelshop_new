const jwt = require('jsonwebtoken');
const { JWT_ADMIN_SECRET } = require('../config/env');

function authAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Unauthorized' });
  const token = header.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_ADMIN_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { authAdmin };
