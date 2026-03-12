const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');
const { protect, authorize } = require('../middlewares/auth');

// Public routes
router.get('/', cityController.getCities);
router.get('/:postalCode', cityController.getCityByPostalCode);

// Admin only routes
router.post('/', protect, authorize('admin'), cityController.createCity);
router.post('/bulk', protect, authorize('admin'), cityController.bulkImportCities);

module.exports = router;
