const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * STRICT AUTH: Required for "Act/Create/Interact" trigger points.
 * Returns 401 if not logged in.
 */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please login to get access.',
        code: 'AUTH_REQUIRED' // Frontend uses this to trigger the AuthModal soft gate
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const result = await pool.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'The user belonging to this token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};

/**
 * OPTIONAL AUTH: Used for "Explore/Read" screens.
 * Allows anonymous access but populates req.user if a valid token is present.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
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
    req.user = null; // Just proceed as anonymous if token is invalid
    next();
  }
};

/**
 * ADMIN ONLY: Restricts access to admin role.
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, restrictTo };
