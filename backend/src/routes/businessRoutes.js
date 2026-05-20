const express = require('express');
const router = express.Router();
const { registerBusiness, getAllBusinesses } = require('../controllers/businessController');

router.post('/', registerBusiness);
router.get('/', getAllBusinesses);

module.exports = router;