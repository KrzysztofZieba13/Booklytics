const Business = require('../models/Business');

// @desc    Zarejestruj nowy biznes / punkt usługowy
// @route   POST /api/businesses
const registerBusiness = async (req, res) => {
    try {
        const { name, category, address, city } = req.body;
        const ownerId = req.user._id;

        if (!name || !category || !address || !city) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane do rejestracji biznesu.' });
        }

        const newBusiness = new Business({
            name,
            category,
            address,
            city,
            ownerId,
            employees: [ownerId]
        });

        await newBusiness.save();

        res.status(201).json({
            message: 'Biznes został zarejestrowany pomyślnie!',
            business: newBusiness
        });
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy rejestracji biznesu', error: error.message });
    }
};

// @desc    Pobierz wszystkie biznesy (opcjonalnie przefiltrowane po mieście lub kategorii)
// @route   GET /api/businesses
const getAllBusinesses = async (req, res) => {
    try {
        const { city, category } = query = req.query;
        
        let filter = {};
        if (city) filter.city = new RegExp(city, 'i');
        if (category) filter.category = category;

        const businesses = await Business.find(filter).populate('ownerId', 'firstName lastName email');
        
        res.status(200).json(businesses);
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy pobieraniu listy biznesów', error: error.message });
    }
};

// @desc    Pobierz pojedynczy biznes
// @route   GET /api/businesses/:id
const getBusinessById = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id).populate('ownerId', 'firstName lastName email');
        if (!business) return res.status(404).json({ message: 'Nie znaleziono biznesu.' });
        res.status(200).json(business);
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
};

// @desc    Zaktualizuj godziny otwarcia
// @route   PATCH /api/businesses/:id/hours
const updateOpeningHours = async (req, res) => {
    try {
        const { open, close } = req.body;
        if (!open || !close) return res.status(400).json({ message: 'Podaj godziny otwarcia i zamknięcia.' });

        const business = await Business.findByIdAndUpdate(
            req.params.id,
            { openingHours: { open, close } },
            { new: true }
        );
        if (!business) return res.status(404).json({ message: 'Nie znaleziono biznesu.' });
        res.status(200).json({ message: 'Godziny otwarcia zaktualizowane.', business });
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
};

module.exports = {
    registerBusiness,
    getAllBusinesses,
    getBusinessById,
    updateOpeningHours
};