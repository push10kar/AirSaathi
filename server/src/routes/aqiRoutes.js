const express = require('express');
const router = express.Router();
const aqiController = require('../controllers/aqiController');

// Public routes for location-based AQI
router.get('/nearest', aqiController.getNearestStation);
router.get('/current', aqiController.getAQIForLocation);
router.get('/history/:stationId', aqiController.getStationHistory);

module.exports = router;
