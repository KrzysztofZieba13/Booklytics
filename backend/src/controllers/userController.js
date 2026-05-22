const User = require('../models/User');
const { Webhook } = require('svix');

// @desc    Obsługa Webhooków od Clerka (Synchronizacja Userów)
// @route   POST /api/users/webhook
const handleClerkWebhook = async (req, res) => {
    try {
        const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

        if (!CLERK_WEBHOOK_SECRET) {
            return res.status(500).json({ message: 'Brak klucza CLERK_WEBHOOK_SECRET w pliku .env' });
        }

        const payload = JSON.stringify(req.body);
        const headers = req.headers;
        const svix_id = headers['svix-id'];
        const svix_timestamp = headers['svix-timestamp'];
        const svix_signature = headers['svix-signature'];

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res.status(400).json({ message: 'Brak wymaganych nagłówków weryfikacyjnych Svix' });
        }

        const wh = new Webhook(CLERK_WEBHOOK_SECRET);
        let evt;
        try {
            evt = wh.verify(payload, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            });
        } catch (err) {
            return res.status(400).json({ message: 'Podpis Webhooka jest niepoprawny' });
        }

        const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;
        const eventType = evt.type;

        if (eventType === 'user.created') {
            const newUser = new User({
                clerkId: id,
                email: email_addresses[0].email_address,
                firstName: first_name || 'Użytkownik',
                lastName: last_name || 'Platformy',
                phoneNumber: phone_numbers?.[0]?.phone_number || ''
            });
            await newUser.save();
            console.log(`👤 [database]: Zsynchronizowano nowego użytkownika: ${id}`);
        }

        if (eventType === 'user.updated') {
            await User.findOneAndUpdate(
                { clerkId: id },
                {
                    email: email_addresses[0].email_address,
                    firstName: first_name,
                    lastName: last_name,
                    phoneNumber: phone_numbers?.[0]?.phone_number || ''
                }
            );
            console.log(`🔄 [database]: Zaktualizowano dane użytkownika: ${id}`);
        }

        if (eventType === 'user.deleted') {
            await User.findOneAndDelete({ clerkId: id });
            console.log(`❌ [database]: Usunięto użytkownika z bazy: ${id}`);
        }

        res.status(200).json({ success: true });

    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas procesowania Webhooka', error: error.message });
    }
};

module.exports = { handleClerkWebhook };