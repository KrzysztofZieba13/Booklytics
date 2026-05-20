const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json()); // Pozwala Expressowi czytać dane w formacie JSON (req.body)

// Podstawowy endpoint testowy (Sprawdzisz go w przeglądarce)
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