import React, { useState } from 'react';
import { requestOtp, verifyOtp } from '../api/auth';

const OtpLogin = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);

  const send = async () => {
    await requestOtp(email);
    setSent(true);
  };

  const verify = async () => {
    const { data } = await verifyOtp(email, code);
    localStorage.setItem('otpToken', data.token);
    alert('Autenticado');
  };

  return (
    <section>
      <h2>Acceso por OTP</h2>
      <input aria-label="Email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={send}>Enviar código</button>
      {sent && (
        <div>
          <input
            aria-label="Código"
            placeholder="Código"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={verify}>Verificar</button>
        </div>
      )}
    </section>
  );
};

export default OtpLogin;
