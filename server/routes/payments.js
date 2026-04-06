const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');

router.get('/', ctrl.getPayments);
router.post('/', ctrl.createPayment);
router.put('/:id', ctrl.updatePayment);
router.delete('/:id', ctrl.deletePayment);

module.exports = router;
