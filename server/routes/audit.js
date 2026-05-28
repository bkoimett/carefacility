const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { restrictTo } = require('../middleware/auth')
const auditController = require('../controllers/auditController')

router.get('/', protect, restrictTo('superadmin', 'admin'), auditController.getAuditLogs)
router.get('/actions', protect, restrictTo('superadmin', 'admin'), auditController.getAuditActions)
router.get('/collections', protect, restrictTo('superadmin', 'admin'), auditController.getAuditCollections)

module.exports = router