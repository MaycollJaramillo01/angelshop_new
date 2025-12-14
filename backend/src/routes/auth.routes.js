const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const AdminUser = require('../models/AdminUser');
const { JWT_ADMIN_SECRET } = require('../config/env');
const { validate } = require('../middleware/validate');

const loginSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(6) })
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validated.body;
    const user = await AdminUser.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_ADMIN_SECRET, {
      expiresIn: '12h'
    });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
