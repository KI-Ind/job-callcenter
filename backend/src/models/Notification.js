const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a notification title']
  },
  content: {
    type: String,
    required: [true, 'Please add notification content']
  },
  type: {
    type: String,
    enum: ['application', 'interview', 'message', 'job', 'system'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster querying
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
