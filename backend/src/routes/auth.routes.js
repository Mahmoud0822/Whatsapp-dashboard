const express = require('express');
const router = express.Router();
const { AppError } = require('../middleware/errorHandler');
const User = require('../models/User');
const logger = require('../utils/logger');

// Middleware para verificar token JWT
const authMiddleware = require('../middleware/auth');

// Registrar um novo usuário
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('Usuário já existe com este email', 400));
    }

    // Criar novo usuário
    const user = await User.create({
      name,
      email,
      password,
    });

    // Gerar token JWT
    const token = user.generateAuthToken();

    // Atualizar último login
    user.lastLogin = Date.now();
    await user.save();

    logger.info(`Novo usuário registrado: ${email}`);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login de usuário
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verificar se email e senha foram fornecidos
    if (!email || !password) {
      return next(new AppError('Por favor, forneça email e senha', 400));
    }

    // Verificar se o usuário existe
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Email ou senha incorretos', 401));
    }

    // Verificar se a senha está correta
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError('Email ou senha incorretos', 401));
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      return next(new AppError('Sua conta está desativada. Entre em contato com o administrador.', 401));
    }

    // Gerar token JWT
    const token = user.generateAuthToken();

    // Atualizar último login
    user.lastLogin = Date.now();
    await user.save();

    logger.info(`Usuário logado: ${email}`);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Obter usuário atual
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('Usuário não encontrado', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar senha
router.patch('/update-password', authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verificar se as senhas foram fornecidas
    if (!currentPassword || !newPassword) {
      return next(new AppError('Por favor, forneça a senha atual e a nova senha', 400));
    }

    // Verificar se a nova senha tem pelo menos 8 caracteres
    if (newPassword.length < 8) {
      return next(new AppError('A nova senha deve ter pelo menos 8 caracteres', 400));
    }

    // Obter usuário com senha
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next(new AppError('Usuário não encontrado', 404));
    }

    // Verificar se a senha atual está correta
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return next(new AppError('Senha atual incorreta', 401));
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    logger.info(`Senha atualizada para o usuário: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Senha atualizada com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

// Logout (apenas para fins de API, o token deve ser invalidado no cliente)
router.post('/logout', authMiddleware, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logout realizado com sucesso',
  });
});

module.exports = router;