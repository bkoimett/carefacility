const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const { validatePayment } = require('../utils/validation');

router.get('/', ctrl.getPayments);
router.post('/', validatePayment, ctrl.createPayment);
router.put('/:id', validatePayment, ctrl.updatePayment);
router.delete('/:id', ctrl.deletePayment);

module.exports = router;
