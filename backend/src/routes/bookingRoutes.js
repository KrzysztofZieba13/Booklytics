const express = require('express');
const router = express.Router();
const { lockDateTimeSlot, confirmBooking, getAvailableSlots } = require('../controllers/bookingController');

router.post('/lock', lockDateTimeSlot);
router.patch('/confirm/:bookingId', confirmBooking);
router.get('/available-slots', getAvailableSlots);

module.exports = router;