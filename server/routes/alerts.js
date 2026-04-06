const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alertController');

router.get('/', ctrl.getAlerts);
router.put('/:id/read', ctrl.markAsRead);
router.put('/:id/dismiss', ctrl.dismissAlert);
router.put('/mark-all-read', ctrl.markAllRead);
router.post('/trigger-job', ctrl.triggerJob);

module.exports = router;
