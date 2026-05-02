const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

// Allow anonymous reports, but attach user if logged in
router.post('/', auth.optionalAuth, reportController.createReport);
router.get('/', auth.protect, reportController.getReports);

module.exports = router;
