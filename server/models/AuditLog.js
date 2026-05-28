const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'], required: true },
  collection: { type: String, required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId },
  documentName: { type: String },
  oldData: { type: mongoose.Schema.Types.Mixed },
  newData: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }]
}, { timestamps: true })

auditLogSchema.index({ createdAt: -1 })
auditLogSchema.index({ user: 1, action: 1 })
auditLogSchema.index({ collection: 1, documentId: 1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)