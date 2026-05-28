const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['superadmin', 'admin', 'staff'], 
    default: 'staff' 
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  preferences: {
    theme: { type: String, default: 'careclinic' },
    fontSize: { type: String, default: 'medium' },
    notificationsEnabled: { type: Boolean, default: true }
  }
}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method — compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never return password in JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
