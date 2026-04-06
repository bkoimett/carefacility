const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
    // Can be negative (overpayment credit)
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'mpesa', 'bank_transfer', 'cheque', 'other'],
    default: 'cash'
  },
  reference: {
    type: String,
    trim: true,
    default: ''
  },
  // Who made the payment (payer name – could be sponsor or client)
  paidBy: {
    type: String,
    trim: true,
    default: ''
  },
  // Type of charge this payment covers
  paymentType: {
    type: String,
    enum: [
      'deposit',
      'monthly_fee',
      'medical_fee',
      'daily_charge',
      'credit_adjustment',
      'other'
    ],
    default: 'monthly_fee'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  // Which billing period does this cover (e.g., month 1, month 2, post-expiry day X)
  billingPeriodLabel: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for fast ledger queries
paymentSchema.index({ client: 1, paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
