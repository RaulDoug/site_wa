export const validateValues = (zodSchema) => {
  return (req, res, next) => {
    const validate = zodSchema.safeParse(req.body);

    if (!validate.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validate.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    req.body = validate.data;

    next();
  };
};
