const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');

router.get('/', ctrl.getPayments);
router.post('/', ctrl.createPayment);
router.put('/:id', ctrl.updatePayment);
router.delete('/:id', ctrl.deletePayment);
router.get('/monthly-summary', ctrl.getPaymentsMonthlySummary);
router.get('/:id/receipt', ctrl.getReceipt);

module.exports = router;
