const Business = require('../models/Business');

// @desc    Zarejestruj nowy biznes / punkt usługowy
// @route   POST /api/businesses
const registerBusiness = async (req, res) => {
    try {
        const { name, category, address, city, ownerId } = req.body;

        if (!name || !category || !address || !city || !ownerId) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane do rejestracji biznesu.' });
        }

        const newBusiness = new Business({
            name,
            category,
            address,
            city,
            ownerId,
            employees: [ownerId] // Domyślnie właściciel jest też pierwszym pracownikiem wykonującym usługi
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

module.exports = {
    registerBusiness,
    getAllBusinesses
};