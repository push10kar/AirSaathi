const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.post('/refresh', authController.refresh);
router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);

// Protected routes
router.post('/logout', optionalAuth, authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/update-me', protect, authController.updateMe);

module.exports = router;
