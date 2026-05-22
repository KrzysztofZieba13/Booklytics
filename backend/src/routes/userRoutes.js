const express = require('express');
const router = express.Router();
const { handleClerkWebhook } = require('../controllers/userController');

router.post('/webhook', handleClerkWebhook);

module.exports = router;