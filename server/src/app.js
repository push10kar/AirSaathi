const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Security Headers ──────────────────────────────────────────
app.use(helmet());

// ─── CORS ──────────────────────────────────────────────────────
app.use(cors());

// ─── Body Parser ───────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Prevent large payload attacks

// ─── Rate Limiting ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Max 15 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again in 15 minutes.' }
});

// Apply strict rate limit to all auth routes
app.use('/api/auth', authLimiter);

// ─── Routes ────────────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 Handler ───────────────────────────────────────────────
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// ─── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;