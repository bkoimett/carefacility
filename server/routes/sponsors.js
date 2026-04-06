const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sponsorController');

router.get('/', ctrl.getAllSponsors);
router.get('/:id', ctrl.getSponsorById);
router.post('/', ctrl.createSponsor);
router.put('/:id', ctrl.updateSponsor);
router.delete('/:id', ctrl.deleteSponsor);

module.exports = router;
