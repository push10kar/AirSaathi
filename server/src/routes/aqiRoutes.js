const express = require('express');
const router = express.Router();
const aqiController = require('../controllers/aqiController');

// Public route - anyone can view AQI
router.get('/live', aqiController.getLiveAQI);
router.get('/overview', aqiController.getMaharashtraOverview);

module.exports = router;
