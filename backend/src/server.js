const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());

const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const businessRoutes = require('./routes/businessRoutes');
const userRoutes = require('./routes/userRoutes');

// Webhook Clerka musi mieć raw body do weryfikacji podpisu Svix
app.use('/api/users/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Serwer działa poprawnie!' });
});

// Połączenie z MongoDB (Dockerem)
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('⚡ [database]: Połączono z MongoDB pomyślnie!');
        // Serwer odpala się dopiero, gdy baza danych jest gotowa
        app.listen(PORT, () => {
            console.log(`🚀 [server]: Serwer śmiga na porcie ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ [database]: Błąd połączenia z MongoDB:', error.message);
        process.exit(1); 
    });