const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trigger: {
      type: {
        type: String,
        enum: [
          'keyword',
          'newChat',
          'scheduled',
          'noReply',
          'custom',
        ],
        required: true,
      },
      keywords: [{
        type: String,
        lowercase: true,
        trim: true,
      }],
      schedule: {
        time: Date,
        repeat: {
          type: String,
          enum: ['once', 'daily', 'weekly', 'monthly'],
          default: 'once',
        },
        days: [{
          type: Number,
          min: 0,
          max: 6,
        }],
      },
      noReplyTimeout: {
        type: Number, // em minutos
        default: 60,
      },
      customCondition: {
        type: String,
        default: '',
      },
    },
    actions: [{
      type: {
        type: String,
        enum: [
          'sendMessage',
          'sendMedia',
          'addTag',
          'removeTag',
          'webhook',
          'delay',
        ],
        required: true,
      },
      message: {
        type: String,
        default: '',
      },
      mediaUrl: {
        type: String,
        default: '',
      },
      mediaType: {
        type: String,
        enum: ['image', 'video', 'audio', 'document'],
        default: 'image',
      },
      mediaCaption: {
        type: String,
        default: '',
      },
      tag: {
        type: String,
        default: '',
      },
      webhookUrl: {
        type: String,
        default: '',
      },
      delay: {
        type: Number, // em segundos
        default: 0,
      },
    }],
    filters: {
      chatTypes: [{
        type: String,
        enum: ['individual', 'group'],
        default: 'individual',
      }],
      tags: [{
        type: String,
      }],
      excludeTags: [{
        type: String,
      }],
    },
    stats: {
      timesTriggered: {
        type: Number,
        default: 0,
      },
      lastTriggered: {
        type: Date,
        default: null,
      },
      successCount: {
        type: Number,
        default: 0,
      },
      failureCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
automationSchema.index({ isActive: 1 });
automationSchema.index({ createdBy: 1 });
automationSchema.index({ 'trigger.type': 1 });
automationSchema.index({ 'trigger.keywords': 1 });
automationSchema.index({ 'trigger.schedule.time': 1 });

const Automation = mongoose.model('Automation', automationSchema);

module.exports = Automation;