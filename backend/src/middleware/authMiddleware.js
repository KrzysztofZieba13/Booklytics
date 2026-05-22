const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const protectRoute = ClerkExpressRequireAuth({
    // Opcjonalne konfiguracje, Clerk automatycznie pobierze CLERK_SECRET_KEY z pliku .env
});

const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const clerkId = req.auth.userId; 

            const User = require('../models/User');
            const user = await User.findOne({ clerkId });

            if (!user) {
                return res.status(404).json({ message: 'Użytkownik nie istnieje w bazie danych platformy.' });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: 'Brak uprawnień. Ta operacja wymaga roli: ' + allowedRoles.join(', ') });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(500).json({ message: 'Błąd autoryzacji ról', error: error.message });
        }
    };
};

module.exports = {
    protectRoute,
    authorizeRoles
};