const express = require('express');
const router = express.Router();
const { createService, getBusinessServices } = require('../controllers/serviceController');

//const { protectRoute, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', createService);
router.get('/business/:businessId', getBusinessServices);

module.exports = router;