const express = require('express');
const router = express.Router();
const { lockDateTimeSlot, confirmBooking } = require('../controllers/bookingController');

router.post('/lock', lockDateTimeSlot);
router.patch('/confirm/:bookingId', confirmBooking);

module.exports = router;