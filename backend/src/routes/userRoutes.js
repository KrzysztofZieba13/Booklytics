const express = require('express');
const router = express.Router();
const { handleClerkWebhook, getUserByClerkId, getAllUsers, updateUserRole } = require('../controllers/userController');

router.post('/webhook', handleClerkWebhook);
router.get('/by-clerk/:clerkId', getUserByClerkId);
router.get('/', getAllUsers);
router.patch('/:id/role', updateUserRole);

module.exports = router;