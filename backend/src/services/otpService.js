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
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e91e63, #f06292); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { background: #fff; border: 2px dashed #e91e63; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #e91e63; margin: 20px 0; border-radius: 5px; letter-spacing: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Ángel Shop</h1>
            <p>Tu código de acceso</p>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>Tu código de acceso para Ángel Shop es:</p>
            <div class="code">${code}</div>
            <p>Este código expira en ${OTP_TTL_MINUTES} minutos.</p>
            <p>Si no solicitaste este código, puedes ignorar este correo.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  await sendMail({ 
    to: email, 
    subject: 'Tu código Ángel Shop', 
    html: html,
    text: `Código: ${code}` 
  });
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
