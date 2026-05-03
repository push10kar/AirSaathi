const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * STRICT AUTH: Required for all protected routes.
 * Validates 15-minute access tokens.
 * Returns specific error codes for the client to act on.
 */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in.',
        code: 'AUTH_REQUIRED',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Access token expired.',
          code: 'TOKEN_EXPIRED', // Client uses this to auto-refresh
        });
      }
      return res.status(401).json({ status: 'error', message: 'Invalid token.', code: 'INVALID_TOKEN' });
    }

    const result = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User no longer exists.', code: 'USER_NOT_FOUND' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Authentication error.' });
  }
};

/**
 * OPTIONAL AUTH: Used for public routes that optionally show user-specific content.
 * Never returns 401 — just sets req.user = null if no valid token.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await pool.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
      req.user = result.rows[0] || null;
    } else {
      req.user = null;
    }
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

/**
 * ROLE GUARD: Restricts access by role.
 * Must come after `protect`.
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.',
        code: 'FORBIDDEN',
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, restrictTo };
