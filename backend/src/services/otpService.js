const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomInt } = require('crypto');
const OtpCode = require('../models/OtpCode');
const { OTP_TTL_MINUTES, JWT_OTP_SECRET } = require('../config/env');
const { sendMail } = require('../config/mailer');

async function requestOtp(email) {
  const code = String(randomInt(100000, 999999));
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60000);
  await OtpCode.deleteMany({ email });
  await OtpCode.create({ email, codeHash, expiresAt });
  await sendMail({ to: email, subject: 'Tu código Ángel Shop', text: `Código: ${code}` });
  return true;
}

async function verifyOtp(email, code) {
  const otp = await OtpCode.findOne({ email });
  if (!otp) throw new Error('OTP no encontrado');
  if (otp.expiresAt < new Date()) throw new Error('OTP expirado');
  const valid = await bcrypt.compare(code, otp.codeHash);
  if (!valid) {
    otp.attempts += 1;
    await otp.save();
    throw new Error('Código inválido');
  }
  await OtpCode.deleteMany({ email });
  const token = jwt.sign({ email }, JWT_OTP_SECRET, { expiresIn: `${OTP_TTL_MINUTES}m` });
  return token;
}

module.exports = { requestOtp, verifyOtp };
