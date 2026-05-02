const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const postRoutes = require('./postRoutes');
const aqiRoutes = require('./aqiRoutes');
const pool = require('../config/db');

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Feature routes
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/aqi', aqiRoutes);

// User routes (keeping your existing structure but moving it here)
router.get('/users', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

module.exports = router;