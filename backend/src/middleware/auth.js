const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // 1) Verificar se o token existe
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Você não está logado. Por favor, faça login para obter acesso.', 401)
      );
    }

    // 2) Verificar se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // 3) Verificar se o usuário ainda existe
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('O usuário pertencente a este token não existe mais.', 401)
      );
    }

    // 4) Verificar se o usuário está ativo
    if (!currentUser.isActive) {
      return next(
        new AppError('Sua conta está desativada. Entre em contato com o administrador.', 401)
      );
    }

    // 5) Conceder acesso à rota protegida
    req.user = {
      id: currentUser._id,
      email: currentUser.email,
      role: currentUser.role,
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido. Por favor, faça login novamente.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Seu token expirou. Por favor, faça login novamente.', 401));
    }
    next(error);
  }
};

// Middleware para verificar permissões de admin
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Você não tem permissão para realizar esta ação.', 403)
      );
    }
    next();
  };
};

module.exports = authMiddleware;
module.exports.restrictTo = restrictTo;