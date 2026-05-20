const express = require('express');
const router = express.Router();
const { createService, getBusinessServices } = require('../controllers/serviceController');

router.post('/', createService);
router.get('/business/:businessId', getBusinessServices);

module.exports = router;