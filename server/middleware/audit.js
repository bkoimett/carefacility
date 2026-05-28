const AuditLog = require('../models/AuditLog')

const getClientInfo = (req) => ({
  ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  userAgent: req.headers['user-agent'] || 'unknown'
})

exports.logAction = (action, collection, options = {}) => {
  return async (req, res, next) => {
    const originalSend = res.json
    const clientInfo = getClientInfo(req)
    
    res.json = function(data) {
      // Only log if request was successful (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const logData = {
          user: req.user._id,
          userName: req.user.name,
          userRole: req.user.role,
          action,
          collection,
          documentId: options.getDocumentId ? options.getDocumentId(req, data) : options.documentId,
          documentName: options.getDocumentName ? options.getDocumentName(req, data) : options.documentName,
          oldData: options.getOldData ? options.getOldData(req) : null,
          newData: options.getNewData ? options.getNewData(req, data) : (req.body ? req.body : null),
          ...clientInfo
        }
        
        // Auto-calculate field changes if oldData and newData provided
        if (logData.oldData && logData.newData && !logData.changes) {
          logData.changes = []
          const oldFlat = JSON.parse(JSON.stringify(logData.oldData))
          const newFlat = JSON.parse(JSON.stringify(logData.newData))
          
          for (const key of Object.keys(newFlat)) {
            if (oldFlat[key] !== undefined && oldFlat[key] !== newFlat[key]) {
              logData.changes.push({
                field: key,
                oldValue: oldFlat[key],
                newValue: newFlat[key]
              })
            }
          }
        }
        
        AuditLog.create(logData).catch(console.error)
      }
      originalSend.call(this, data)
    }
    next()
  }
}

// Convenience wrapper for controllers
exports.logManually = async (req, action, collection, documentId, documentName, oldData = null, newData = null) => {
  if (!req.user) return
  
  const clientInfo = getClientInfo(req)
  await AuditLog.create({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action,
    collection,
    documentId,
    documentName,
    oldData,
    newData,
    ...clientInfo
  })
}