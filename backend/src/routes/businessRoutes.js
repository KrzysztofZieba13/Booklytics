const express = require('express');
const router = express.Router();
const { registerBusiness, getAllBusinesses, getBusinessById, updateOpeningHours } = require('../controllers/businessController');
const { protectRoute, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protectRoute, authorizeRoles('employee'), registerBusiness);
router.get('/', getAllBusinesses);
router.get('/:id', getBusinessById);
router.patch('/:id/hours', protectRoute, authorizeRoles('employee'), updateOpeningHours);

module.exports = router;