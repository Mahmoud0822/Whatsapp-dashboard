const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log do erro
  logger.error(`${err.statusCode} - ${err.message}`, { 
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Erros operacionais conhecidos
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Erros de programação ou outros erros desconhecidos
  // Não vazamos detalhes do erro para o cliente
  return res.status(500).json({
    status: 'error',
    message: 'Algo deu errado!',
  });
};

module.exports = { AppError, errorHandler };