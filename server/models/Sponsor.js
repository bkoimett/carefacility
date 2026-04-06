const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sponsor name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  relationship: {
    type: String,
    enum: ['family', 'friend', 'employer', 'ngo', 'government', 'self', 'other'],
    default: 'other'
  },
  address: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: get all clients this sponsor is responsible for
sponsorSchema.virtual('clients', {
  ref: 'Client',
  localField: '_id',
  foreignField: 'sponsor'
});

module.exports = mongoose.model('Sponsor', sponsorSchema);
