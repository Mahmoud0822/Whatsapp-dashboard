const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: '',
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    tags: [{
      type: String,
    }],
    notes: {
      type: String,
      default: '',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    profilePicUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
chatSchema.index({ chatId: 1 });
chatSchema.index({ isArchived: 1 });
chatSchema.index({ tags: 1 });
chatSchema.index({ createdAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;