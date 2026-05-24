const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Business = require('../models/Business');

// @desc    Zablokuj termin tymczasowo (Rozpoczęcie procesu rezerwacji)
// @route   POST /api/bookings/lock
const lockDateTimeSlot = async (req, res) => {
    try {
        const { businessId, serviceId, clientId, employeeId, startTime } = req.body;

        if (!businessId || !serviceId || !clientId || !employeeId || !startTime) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Nie znaleziono takiej usługi.' });
        }

        const start = new Date(startTime);
        const end = new Date(start.getTime() + service.duration * 60000);

        const overlappingBooking = await Booking.findOne({
            employeeId,
            status: { $in: ['temporary_lock', 'confirmed'] },
            $or: [
                { startTime: { $gte: start, $lt: end } }, // Istniejąca wizyta zaczyna się w trakcie naszej
                { endTime: { $gt: start, $lte: end } },   // Istniejąca wizyta kończy się w trakcie naszej
                { startTime: { $lte: start }, endTime: { $gte: end } } // Nasza wizyta w środku innej, dłuższej
            ]
        });

        if (overlappingBooking) {
            return res.status(400).json({ message: 'Ten termin jest już zajęty lub zablokowany przez kogoś innego.' });
        }

        const lockExpiration = new Date();
        lockExpiration.setMinutes(lockExpiration.getMinutes() + 10);

        const newBooking = new Booking({
            businessId,
            serviceId,
            clientId,
            employeeId,
            startTime: start,
            endTime: end,
            status: 'temporary_lock',
            expiresAt: lockExpiration
        });

        await newBooking.save();

        res.status(201).json({
            message: 'Termin zablokowany pomyślnie na 10 minut.',
            booking: newBooking
        });

    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy blokowaniu terminu', error: error.message });
    }
};

// @desc    Potwierdź rezerwację (Zdejmij blokadę TTL i zapisz na stałe)
// @route   PATCH /api/bookings/confirm/:bookingId
const confirmBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Nie znaleziono takiej rezerwacji.' });
        }

        if (booking.status !== 'temporary_lock') {
            return res.status(400).json({ message: 'Ta rezerwacja nie może zostać potwierdzona (ma już status: ' + booking.status + ')' });
        }

        booking.status = 'confirmed';
        booking.expiresAt = undefined;

        await booking.save();

        res.status(200).json({
            message: 'Rezerwacja została pomyślnie potwierdzona i zapisana w kalendarzu!',
            booking
        });

    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy potwierdzaniu rezerwacji', error: error.message });
    }
};

// @desc    Pobierz wolne sloty godzinowe dla pracownika na dany dzień
// @route   GET /api/bookings/available-slots
const getAvailableSlots = async (req, res) => {
    try {
        const { employeeId, serviceId, date } = req.query; // np. ?employeeId=...&serviceId=...&date=2026-06-01

        if (!employeeId || !serviceId || !date) {
            return res.status(400).json({ message: 'Parametry employeeId, serviceId i date są wymagane.' });
        }

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: 'Nie znaleziono usługi.' });
        const serviceDuration = service.duration;

        const business = await Business.findById(service.businessId);
        const [openH, openM] = (business?.openingHours?.open || '08:00').split(':').map(Number);
        const [closeH, closeM] = (business?.openingHours?.close || '16:00').split(':').map(Number);
        const slotInterval = 30;

        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);

        const existingBookings = await Booking.find({
            employeeId,
            status: { $in: ['temporary_lock', 'confirmed'] },
            startTime: { $gte: startOfDay, $lte: endOfDay }
        });

        const availableSlots = [];
        let currentSlotTime = new Date(startOfDay);
        currentSlotTime.setUTCHours(openH, openM, 0, 0);

        const endTimeLimit = new Date(startOfDay);
        endTimeLimit.setUTCHours(closeH, closeM, 0, 0);

        while (currentSlotTime < endTimeLimit) {
            const slotStart = new Date(currentSlotTime);
            const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);

            const isOvelapping = existingBookings.some(booking => {
                return (
                    (slotStart >= booking.startTime && slotStart < booking.endTime) ||
                    (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
                    (slotStart <= booking.startTime && slotEnd >= booking.endTime)
                );
            });

            if (!isOvelapping && slotEnd <= endTimeLimit) {
                availableSlots.push({
                    time: slotStart.toISOString().substring(11, 16),
                    dateTime: slotStart
                });
            }

            currentSlotTime.setMinutes(currentSlotTime.getMinutes() + slotInterval);
        }

        res.status(200).json(availableSlots);

    } catch (error) {
        res.status(500).json({ message: 'Błąd przy wyliczaniu wolnych slotów', error: error.message });
    }
};

// @desc    Pobierz wizyty pracownika
// @route   GET /api/bookings/employee/:employeeId
const getEmployeeBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            employeeId: req.params.employeeId,
            status: { $in: ['confirmed', 'completed'] }
        })
            .populate('serviceId', 'name duration price')
            .populate('clientId', 'firstName lastName email phoneNumber')
            .sort({ startTime: 1 });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy pobieraniu wizyt', error: error.message });
    }
};

// @desc    Oznacz wizytę jako ukończoną
// @route   PATCH /api/bookings/:bookingId/complete
const completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: 'Nie znaleziono rezerwacji.' });
        if (booking.status !== 'confirmed') {
            return res.status(400).json({ message: 'Tylko potwierdzone wizyty można oznaczyć jako ukończone.' });
        }
        booking.status = 'completed';
        await booking.save();
        res.status(200).json({ message: 'Wizyta oznaczona jako ukończona.', booking });
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
};

// @desc    Pobierz wizyty klienta
// @route   GET /api/bookings/client/:clientId
const getClientBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ clientId: req.params.clientId })
            .populate('serviceId', 'name duration price')
            .populate('employeeId', 'firstName lastName')
            .populate('businessId', 'name address city')
            .sort({ startTime: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
};

module.exports = {
    lockDateTimeSlot,
    confirmBooking,
    getAvailableSlots,
    getEmployeeBookings,
    completeBooking,
    getClientBookings
};