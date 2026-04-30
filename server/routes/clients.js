const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientController');
const { validateClient } = require('../utils/validation');

router.get('/', ctrl.getAllClients);
router.get('/:id', ctrl.getClientById);
router.post('/', validateClient, ctrl.createClient);
router.put('/:id', validateClient, ctrl.updateClient);
router.delete('/:id', ctrl.deleteClient);
router.get('/:id/billing', ctrl.getClientBilling);

module.exports = router;
