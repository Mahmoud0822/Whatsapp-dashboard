const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    chatId: {
      type: String,
      required: true,
      index: true,
    },
    body: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: [
        'text',
        'image',
        'video',
        'audio',
        'document',
        'sticker',
        'location',
        'contact',
        'reaction',
        'system',
      ],
      default: 'text',
    },
    fromMe: {
      type: Boolean,
      default: false,
    },
    author: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    hasMedia: {
      type: Boolean,
      default: false,
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    mediaType: {
      type: String,
      default: '',
    },
    mediaCaption: {
      type: String,
      default: '',
    },
    mediaSize: {
      type: Number,
      default: 0,
    },
    isForwarded: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    quotedMessageId: {
      type: String,
      default: null,
    },
    mentionedIds: [{
      type: String,
    }],
    location: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      description: {
        type: String,
        default: '',
      },
    },
    vcard: {
      type: String,
      default: '',
    },
    isScheduled: {
      type: Boolean,
      default: false,
    },
    scheduledTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
messageSchema.index({ chatId: 1, timestamp: -1 });
messageSchema.index({ messageId: 1 });
messageSchema.index({ fromMe: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ isScheduled: 1, scheduledTime: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;