const express = require('express');
const router = express.Router();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const authMiddleware = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const logger = require('../utils/logger');

// Referência ao cliente WhatsApp do arquivo index.js
let client;

// Middleware para verificar se o cliente WhatsApp está pronto
const checkWhatsAppClient = (req, res, next) => {
  client = req.app.get('whatsappClient');
  
  if (!client) {
    return next(new AppError('Cliente WhatsApp não inicializado', 500));
  }
  
  if (!client.info) {
    return next(new AppError('Cliente WhatsApp não está conectado', 400));
  }
  
  next();
};

// Obter status do WhatsApp
router.get('/status', authMiddleware, (req, res) => {
  client = req.app.get('whatsappClient');
  
  const status = {
    connected: !!client?.info,
    info: client?.info ? {
      wid: client.info.wid._serialized,
      platform: client.info.platform,
      phone: client.info.phone,
    } : null,
  };
  
  res.status(200).json({
    status: 'success',
    data: status,
  });
});

// Obter QR Code
router.get('/qr', authMiddleware, async (req, res, next) => {
  try {
    client = req.app.get('whatsappClient');
    
    if (client?.info) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cliente WhatsApp já está conectado',
      });
    }
    
    // Se o cliente não estiver inicializado, inicialize-o
    if (!client) {
      return next(new AppError('Cliente WhatsApp não inicializado', 500));
    }
    
    // Verificar se há um QR code armazenado
    const qrCode = req.app.get('whatsappQR');
    
    if (!qrCode) {
      return res.status(202).json({
        status: 'pending',
        message: 'Aguardando QR code...',
      });
    }
    
    // Gerar imagem do QR code
    const qrImage = await qrcode.toDataURL(qrCode);
    
    res.status(200).json({
      status: 'success',
      data: {
        qrImage,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logout do WhatsApp
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    client = req.app.get('whatsappClient');
    
    if (!client) {
      return next(new AppError('Cliente WhatsApp não inicializado', 500));
    }
    
    if (!client.info) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cliente WhatsApp não está conectado',
      });
    }
    
    await client.logout();
    
    res.status(200).json({
      status: 'success',
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

// Reiniciar cliente WhatsApp
router.post('/restart', authMiddleware, async (req, res, next) => {
  try {
    client = req.app.get('whatsappClient');
    
    if (client) {
      try {
        await client.destroy();
      } catch (error) {
        logger.error(`Erro ao destruir cliente WhatsApp: ${error.message}`);
      }
    }
    
    // Inicializar novo cliente
    req.app.set('whatsappClient', null);
    req.app.set('whatsappQR', null);
    req.app.emit('whatsapp-restart');
    
    res.status(200).json({
      status: 'success',
      message: 'Cliente WhatsApp reiniciado com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

// Obter todas as conversas
router.get('/chats', authMiddleware, checkWhatsAppClient, async (req, res, next) => {
  try {
    const chats = await client.getChats();
    
    // Mapear chats para o formato desejado
    const formattedChats = chats.map(chat => ({
      id: chat.id._serialized,
      name: chat.name,
      isGroup: chat.isGroup,
      timestamp: chat.timestamp ? new Date(chat.timestamp * 1000) : null,
      unreadCount: chat.unreadCount,
    }));
    
    res.status(200).json({
      status: 'success',
      results: formattedChats.length,
      data: {
        chats: formattedChats,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Obter mensagens de uma conversa
router.get('/chats/:chatId/messages', authMiddleware, checkWhatsAppClient, async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { limit = 50 } = req.query;
    
    // Verificar se o chat existe
    const chat = await client.getChatById(chatId);
    if (!chat) {
      return next(new AppError('Conversa não encontrada', 404));
    }
    
    // Obter mensagens
    const messages = await chat.fetchMessages({ limit: parseInt(limit) });
    
    // Mapear mensagens para o formato desejado
    const formattedMessages = messages.map(msg => ({
      id: msg.id._serialized,
      body: msg.body,
      type: msg.type,
      fromMe: msg.fromMe,
      author: msg.author || '',
      timestamp: msg.timestamp ? new Date(msg.timestamp * 1000) : null,
      hasMedia: msg.hasMedia,
    }));
    
    res.status(200).json({
      status: 'success',
      results: formattedMessages.length,
      data: {
        messages: formattedMessages,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Enviar mensagem
router.post('/send', authMiddleware, checkWhatsAppClient, async (req, res, next) => {
  try {
    const { chatId, message } = req.body;
    
    if (!chatId || !message) {
      return next(new AppError('Por favor, forneça chatId e message', 400));
    }
    
    // Enviar mensagem
    const result = await client.sendMessage(chatId, message);
    
    // Salvar mensagem no banco de dados
    await Message.create({
      messageId: result.id._serialized,
      chatId,
      body: message,
      type: 'text',
      fromMe: true,
      timestamp: new Date(),
      status: 'sent',
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        messageId: result.id._serialized,
        message,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Enviar mensagem com mídia
router.post('/send-media', authMiddleware, checkWhatsAppClient, async (req, res, next) => {
  try {
    const { chatId, mediaUrl, caption, mediaType } = req.body;
    
    if (!chatId || !mediaUrl) {
      return next(new AppError('Por favor, forneça chatId e mediaUrl', 400));
    }
    
    // Verificar tipo de mídia
    const validMediaTypes = ['image', 'video', 'audio', 'document'];
    if (mediaType && !validMediaTypes.includes(mediaType)) {
      return next(new AppError(`Tipo de mídia inválido. Tipos válidos: ${validMediaTypes.join(', ')}`, 400));
    }
    
    // Enviar mídia
    const media = await client.sendMessage(chatId, {
      url: mediaUrl,
      caption: caption || '',
      sendMediaAsDocument: mediaType === 'document',
    });
    
    // Salvar mensagem no banco de dados
    await Message.create({
      messageId: media.id._serialized,
      chatId,
      body: caption || '',
      type: mediaType || 'image',
      fromMe: true,
      timestamp: new Date(),
      hasMedia: true,
      mediaUrl,
      mediaCaption: caption || '',
      status: 'sent',
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        messageId: media.id._serialized,
        mediaUrl,
        caption,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Marcar conversa como lida
router.post('/chats/:chatId/read', authMiddleware, checkWhatsAppClient, async (req, res, next) => {
  try {
    const { chatId } = req.params;
    
    // Verificar se o chat existe
    const chat = await client.getChatById(chatId);
    if (!chat) {
      return next(new AppError('Conversa não encontrada', 404));
    }
    
    // Marcar como lida
    await chat.sendSeen();
    
    res.status(200).json({
      status: 'success',
      message: 'Conversa marcada como lida',
    });
  } catch (error) {
    next(error);
  }
});

// Arquivar/desarquivar conversa
router.patch('/chats/:chatId/archive', authMiddleware, checkWhatsAppClient, async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { archive } = req.body;
    
    if (archive === undefined) {
      return next(new AppError('Por favor, forneça o parâmetro archive (true/false)', 400));
    }
    
    // Verificar se o chat existe
    const chat = await client.getChatById(chatId);
    if (!chat) {
      return next(new AppError('Conversa não encontrada', 404));
    }
    
    // Arquivar/desarquivar
    if (archive) {
      await chat.archive();
    } else {
      await chat.unarchive();
    }
    
    // Atualizar no banco de dados
    await Chat.findOneAndUpdate(
      { chatId },
      { isArchived: archive },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      status: 'success',
      message: archive ? 'Conversa arquivada' : 'Conversa desarquivada',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;