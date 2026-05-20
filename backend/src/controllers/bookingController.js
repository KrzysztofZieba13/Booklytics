const Booking = require('../models/Booking');
const Service = require('../models/Service');

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

module.exports = {
    lockDateTimeSlot,
    confirmBooking
};