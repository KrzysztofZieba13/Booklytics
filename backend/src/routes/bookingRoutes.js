const express = require('express');
const router = express.Router();
const { lockDateTimeSlot } = require('../controllers/bookingController');

router.post('/lock', lockDateTimeSlot);

module.exports = router;