const express = require('express');
const router = express.Router();
const { lockDateTimeSlot, confirmBooking, getAvailableSlots, getEmployeeBookings, completeBooking, getClientBookings } = require('../controllers/bookingController');

router.post('/lock', lockDateTimeSlot);
router.patch('/confirm/:bookingId', confirmBooking);
router.patch('/:bookingId/complete', completeBooking);
router.get('/available-slots', getAvailableSlots);
router.get('/employee/:employeeId', getEmployeeBookings);
router.get('/client/:clientId', getClientBookings);

module.exports = router;