const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { restrictTo } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const User = require('../models/User');
const logger = require('../utils/logger');

// Obter todos os usuários (apenas admin)
router.get('/', authMiddleware, restrictTo('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-__v');
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Obter um usuário específico (admin ou próprio usuário)
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário é admin ou está acessando seu próprio perfil
    if (req.user.role !== 'admin' && req.user.id.toString() !== id) {
      return next(new AppError('Você não tem permissão para acessar este recurso', 403));
    }
    
    const user = await User.findById(id).select('-__v');
    if (!user) {
      return next(new AppError('Usuário não encontrado', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Criar um novo usuário (apenas admin)
router.post('/', authMiddleware, restrictTo('admin'), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
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
      role: role || 'user',
    });
    
    logger.info(`Novo usuário criado pelo admin: ${email}`);
    
    res.status(201).json({
      status: 'success',
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

// Atualizar um usuário (admin ou próprio usuário)
router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;
    
    // Verificar se o usuário é admin ou está atualizando seu próprio perfil
    const isAdmin = req.user.role === 'admin';
    const isSelfUpdate = req.user.id.toString() === id;
    
    if (!isAdmin && !isSelfUpdate) {
      return next(new AppError('Você não tem permissão para atualizar este usuário', 403));
    }
    
    // Verificar se o usuário existe
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('Usuário não encontrado', 404));
    }
    
    // Preparar dados para atualização
    const updateData = {};
    
    if (name) updateData.name = name;
    
    // Apenas admin pode atualizar email, role e status
    if (isAdmin) {
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }
    
    // Atualizar usuário
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-__v');
    
    logger.info(`Usuário atualizado: ${updatedUser.email}`);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Excluir um usuário (apenas admin)
router.delete('/:id', authMiddleware, restrictTo('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('Usuário não encontrado', 404));
    }
    
    // Impedir a exclusão do próprio usuário admin
    if (user._id.toString() === req.user.id.toString()) {
      return next(new AppError('Você não pode excluir seu próprio usuário', 400));
    }
    
    // Excluir usuário
    await User.findByIdAndDelete(id);
    
    logger.info(`Usuário excluído: ${user.email}`);
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;