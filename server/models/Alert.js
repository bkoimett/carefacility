const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  alertType: {
    type: String,
    enum: [
      'FIRST_MONTH_DUE',
      'MONTHLY_FEE_DUE',
      'EXPIRY_WARNING',
      'EXPIRY_OVERDUE',
      'SPONSOR_REMINDER',
      'DAILY_CHARGE_ALERT'
    ],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDismissed: {
    type: Boolean,
    default: false
  },
  // Prevent duplicate alerts for same type + period
  periodKey: {
    type: String,
    default: ''
  },
  amountDue: {
    type: Number,
    default: 0
  },
  daysPostExpiry: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Prevent duplicate alerts for same client + type + period
alertSchema.index({ client: 1, alertType: 1, periodKey: 1 }, { unique: true });

module.exports = mongoose.model('Alert', alertSchema);
