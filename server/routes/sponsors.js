const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sponsorController');
const { validateSponsor } = require('../utils/validation');

router.get('/', ctrl.getAllSponsors);
router.get('/:id', ctrl.getSponsorById);
router.post('/', validateSponsor, ctrl.createSponsor);
router.put('/:id', validateSponsor, ctrl.updateSponsor);
router.delete('/:id', ctrl.deleteSponsor);

module.exports = router;
