const { Resend } = require('resend');
const { RESEND_API_KEY, MAIL_FROM, NODE_ENV } = require('./env');
const { logger } = require('../utils/logger');

// Inicializar Resend con la API key según la documentación oficial
const resend = new Resend(RESEND_API_KEY);

async function sendMail(options) {
  try {
    // Verificar que tenemos la API key de Resend
    if (!RESEND_API_KEY || RESEND_API_KEY === '' || RESEND_API_KEY === 're_xxxxxxxxx') {
      logger.warn('RESEND_API_KEY no está configurada correctamente. Email no enviado:', {
        to: options.to,
        subject: options.subject
      });
      return { 
        id: null,
        accepted: Array.isArray(options.to) ? options.to : [options.to],
        message: 'Email no enviado - API key no configurada',
        error: 'RESEND_API_KEY no configurada'
      };
    }

    // Preparar el array de destinatarios
    const toArray = Array.isArray(options.to) ? options.to : [options.to];

    // Determinar el remitente: usar el dominio de prueba de Resend en desarrollo
    // o si detectamos un dominio no verificado (angelshop.com)
    let fromEmail = MAIL_FROM;
    
    // En desarrollo o si el dominio no está verificado, usar el dominio de prueba
    const isDevelopment = NODE_ENV !== 'production';
    const hasUnverifiedDomain = fromEmail && fromEmail.includes('angelshop.com');
    
    if (isDevelopment || hasUnverifiedDomain) {
      fromEmail = 'Angel Shop <onboarding@resend.dev>';
      if (hasUnverifiedDomain) {
        logger.warn('Dominio angelshop.com no verificado. Usando dominio de prueba de Resend.');
      }
    }

    // Preparar el objeto de email según la documentación oficial de Resend
    const emailData = {
      from: fromEmail, // Formato: "Name <email@domain.com>" o "email@domain.com"
      to: toArray,
      subject: options.subject,
    };

    // Agregar contenido HTML o texto
    if (options.html) {
      emailData.html = options.html;
    }
    if (options.text) {
      emailData.text = options.text;
    }

    // Enviar el correo usando la API de Resend
    // La API retorna { data, error } según la documentación
    const { data, error } = await resend.emails.send(emailData);

    // Manejar errores de la API de Resend
    if (error) {
      logger.error('Error de Resend API:', {
        error: error,
        to: options.to,
        subject: options.subject
      });
      return { 
        id: null,
        accepted: [],
        error: error.message || JSON.stringify(error)
      };
    }

    // Si hay data, el email fue enviado exitosamente
    if (data && data.id) {
      logger.info('Email enviado exitosamente:', {
        to: options.to,
        subject: options.subject,
        id: data.id
      });

      return {
        id: data.id,
        accepted: toArray,
        message: 'Email enviado exitosamente'
      };
    }

    // Caso inesperado: no hay data ni error
    logger.warn('Respuesta inesperada de Resend API:', {
      data: data,
      error: error,
      to: options.to,
      subject: options.subject
    });
    return {
      id: null,
      accepted: toArray,
      message: 'Email procesado (respuesta inesperada)',
      warning: 'Respuesta inesperada de Resend API'
    };

  } catch (error) {
    // Error inesperado en el proceso
    logger.error('Error inesperado al enviar email:', {
      message: error.message,
      stack: error.stack,
      to: options.to,
      subject: options.subject,
      errorDetails: error
    });
    // Retornar un objeto con error para que el código pueda manejarlo
    return { 
      id: null,
      accepted: [],
      error: error.message || 'Error desconocido al enviar email'
    };
  }
}

module.exports = { resend, sendMail };
