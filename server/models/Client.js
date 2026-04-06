const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  dateOfAdmission: {
    type: Date,
    required: [true, 'Admission date is required']
  },
  dateOfDischarge: {
    type: Date,
    default: null
  },
  agreedDurationMonths: {
    type: Number,
    required: [true, 'Agreed duration is required'],
    min: 1
  },
  monthlyFee: {
    type: Number,
    required: [true, 'Monthly fee is required'],
    min: 0
  },
  medicalFee: {
    type: Number,
    required: [true, 'Medical fee is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'discharged', 'absconded'],
    default: 'active'
  },
  sponsor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sponsor',
    default: null
  },
  comments: {
    type: String,
    trim: true,
    default: ''
  },
  // Optional daily rate override per client
  customDailyRate: {
    type: Number,
    default: null
  },
  // Billing reset fields (used when RESET_BILLING comment is parsed)
  billingResetAt: {
    type: Date,
    default: null
  },
  resetMonthlyFee: {
    type: Number,
    default: null
  },
  resetMedicalFee: {
    type: Number,
    default: null
  },
  // Deposit collected on admission
  depositAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: computed from billing engine (resolved at query time)
clientSchema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'client'
});

clientSchema.virtual('alerts', {
  ref: 'Alert',
  localField: '_id',
  foreignField: 'client'
});

module.exports = mongoose.model('Client', clientSchema);
