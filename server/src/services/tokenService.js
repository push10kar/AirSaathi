const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate a short-lived access token (15 min)
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

/**
 * Generate a secure, opaque refresh token (random 64-byte hex)
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Hash a token for secure DB storage
 * We store the hash, return the raw token to the client
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify an access token
 * Returns decoded payload or throws
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Get the expiry timestamp for a refresh token
 */
const getRefreshTokenExpiry = () => {
  const days = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '30');
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyAccessToken,
  getRefreshTokenExpiry,
};
