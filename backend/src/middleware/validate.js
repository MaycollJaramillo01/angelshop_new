function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    if (!result.success) {
      const errors = result.error.flatten();
      const errorMessages = [];
      
      // Extraer mensajes de error de campos
      if (errors.fieldErrors) {
        Object.entries(errors.fieldErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            errorMessages.push(`${field}: ${messages[0]}`);
          }
        });
      }
      
      // Agregar errores de formulario
      if (errors.formErrors && errors.formErrors.length > 0) {
        errorMessages.push(...errors.formErrors);
      }
      
      return res.status(400).json({ 
        message: 'Error de validación',
        error: errorMessages.length > 0 ? errorMessages.join('; ') : 'Datos inválidos',
        errors: errors
      });
    }
    req.validated = result.data;
    next();
  };
}

module.exports = { validate };
