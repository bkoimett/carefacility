const AuditLog = require('../models/AuditLog')

exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, collection, userId, startDate, endDate } = req.query
    const filter = {}
    
    if (action) filter.action = action
    if (collection) filter.collection = collection
    if (userId) filter.user = userId
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }
    
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email')
    
    const total = await AuditLog.countDocuments(filter)
    
    res.json({
      logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getAuditActions = async (req, res) => {
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW']
  res.json(actions)
}

exports.getAuditCollections = async (req, res) => {
  const collections = await AuditLog.distinct('collection')
  res.json(collections)
}