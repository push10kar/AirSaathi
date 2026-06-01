const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// Apply strict JWT validation and Admin Role restrictions globally on all routes here
router.use(protect, restrictTo('admin'));

// Route registrations
router.get('/overview', adminController.getOverview);
router.get('/reports', adminController.getReports);
router.post('/reports/:id/resolve', adminController.resolveReport);
router.get('/rewards', adminController.getRewards);
router.post('/rewards', adminController.createReward);
router.get('/reward-claims', adminController.getRewardClaims);
router.post('/reward-claims/:id/resolve', adminController.resolveRewardClaim);
router.get('/users', adminController.getUsers);
router.patch('/users/:id', adminController.updateUser);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
