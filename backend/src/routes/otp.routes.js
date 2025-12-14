const router = require('express').Router();
const { z } = require('zod');
const { requestOtp, verifyOtp } = require('../services/otpService');
const { validate } = require('../middleware/validate');

router.post(
  '/request',
  validate(
    z.object({
      body: z.object({ email: z.string().email() })
    })
  ),
  async (req, res, next) => {
    try {
      const { email } = req.validated.body;
      await requestOtp(email);
      res.json({ message: 'OTP enviado' });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/verify',
  validate(
    z.object({
      body: z.object({ email: z.string().email(), code: z.string().min(4) })
    })
  ),
  async (req, res, next) => {
    try {
      const { email, code } = req.validated.body;
      const token = await verifyOtp(email, code);
      res.json({ token });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
