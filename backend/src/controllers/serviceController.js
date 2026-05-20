const Service = require('../models/Service');

// @desc    Dodanie nowej usługi przez admina
// @route   POST /api/services
const createService = async (req, res) => {
    try {
        const { businessId, name, description, price, duration } = req.body;

        if (!businessId || !name || !price || !duration) {
            return res.status(400).json({ message: 'Wszystkie wymagane pola muszą być uzupełnione.' });
        }

        const newService = new Service({
            businessId,
            name,
            description,
            price,
            duration
        });

        await newService.save();

        res.status(201).json(newService);
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy tworzeniu usługi', error: error.message });
    }
};

// @desc    Pobranie wszystkich usług danego biznesu (np. do wyświetlenia klientowi)
// @route   GET /api/services/business/:businessId
const getBusinessServices = async (req, res) => {
    try {
        const { businessId } = req.params; // wyciągamy ID ze ścieżki URL

        const services = await Service.find({ businessId });
        
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy pobieraniu usług', error: error.message });
    }
};

module.exports = {
    createService,
    getBusinessServices
};