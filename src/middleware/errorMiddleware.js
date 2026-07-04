export const errorHandler = (err, req, res, next) => {
  console.log('Erro Capturado:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Erro de validação do banco de dados',
      details: err.message
    });
  }

  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    message: err.message || 'Ocorreu um erro interno no servidor'
  });
};
