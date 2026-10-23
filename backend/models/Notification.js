const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  clickUrl: {
    type: String,
    default: '/',
    trim: true,
  },
  recipientCount: {
    type: Number,
    default: 0,
  },
  successCount: {
    type: Number,
    default: 0,
  },
  failureCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['sent', 'partially_sent', 'failed'],
    default: 'sent',
  },
  sentBy: {
    type: String,
    default: 'Admin',
  },
}, { timestamps: true });

// 3-Day TTL Index: Automatically delete notifications from database after 3 days (259200 seconds)
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', NotificationSchema);
