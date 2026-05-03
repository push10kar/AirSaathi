const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { z } = require('zod');
const { generateAccessToken, generateRefreshToken, hashToken, getRefreshTokenExpiry } = require('../services/tokenService');
const { verifyGoogleIdToken } = require('../services/googleAuthService');

// =============================================
// Validation Schemas
// =============================================
const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  city: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const otpRequestSchema = z.object({
  phone: z.string().min(10),
});

const otpVerifySchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6),
});

// =============================================
// Helpers
// =============================================
const createSession = async (userId, req, refreshToken) => {
  const hashedRefresh = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiry();
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';

  await pool.query(
    `INSERT INTO sessions (user_id, refresh_token, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, hashedRefresh, ua, ip, expiresAt]
  );
};

const logAuthEvent = async (event, userId, req, metadata = null) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    await pool.query(
      `INSERT INTO auth_logs (user_id, event, ip_address, user_agent, metadata) VALUES ($1, $2, $3, $4, $5)`,
      [userId, event, ip, ua, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (e) {
    console.error('Failed to log auth event:', e.message);
  }
};

const sendTokens = (res, statusCode, user, accessToken, refreshToken) => {
  res.status(statusCode).json({
    status: 'success',
    accessToken,
    refreshToken,
    data: { user },
  });
};

// =============================================
// Controllers
// =============================================
const authController = {

  /**
   * POST /auth/signup
   * Email + Password registration
   */
  signup: async (req, res, next) => {
    try {
      const { name, email, password, city } = signupSchema.parse(req.body);

      const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (exists.rows.length > 0) {
        return res.status(409).json({ status: 'error', message: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const userResult = await pool.query(
        `INSERT INTO users (name, email, city, is_verified, role)
         VALUES ($1, $2, $3, FALSE, 'user') RETURNING id, name, email, role, city, avatar_url`,
        [name, email, city || null]
      );
      const user = userResult.rows[0];

      await pool.query(
        `INSERT INTO user_passwords (user_id, password_hash) VALUES ($1, $2)`,
        [user.id, passwordHash]
      );

      await pool.query(
        `INSERT INTO auth_providers (user_id, provider, provider_user_id) VALUES ($1, 'email', $2)`,
        [user.id, email]
      );

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken();
      await createSession(user.id, req, refreshToken);
      await logAuthEvent('signup', user.id, req);

      sendTokens(res, 201, user, accessToken, refreshToken);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /auth/login
   * Email + Password login
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const userResult = await pool.query(
        `SELECT u.id, u.name, u.email, u.role, u.city, u.avatar_url, u.is_verified,
                up.password_hash
         FROM users u
         JOIN user_passwords up ON up.user_id = u.id
         WHERE u.email = $1`,
        [email]
      );
      const user = userResult.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        await logAuthEvent('failed_login', null, req, { email });
        return res.status(401).json({ status: 'error', message: 'Incorrect email or password.' });
      }

      const { password_hash, ...safeUser } = user;

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken();
      await createSession(user.id, req, refreshToken);
      await logAuthEvent('login', user.id, req);

      sendTokens(res, 200, safeUser, accessToken, refreshToken);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /auth/google
   * Google Sign-In (idToken from expo-auth-session)
   */
  googleAuth: async (req, res, next) => {
    try {
      const { idToken } = req.body;
      if (!idToken) return res.status(400).json({ status: 'error', message: 'idToken is required' });

      const googleUser = await verifyGoogleIdToken(idToken);

      // Check if this Google account is already linked
      const providerResult = await pool.query(
        `SELECT u.id, u.name, u.email, u.role, u.city, u.avatar_url, u.is_verified
         FROM auth_providers ap
         JOIN users u ON u.id = ap.user_id
         WHERE ap.provider = 'google' AND ap.provider_user_id = $1`,
        [googleUser.googleId]
      );

      let user = providerResult.rows[0];

      if (!user) {
        // Check if email already exists (link accounts)
        const emailResult = await pool.query(
          `SELECT id, name, email, role, city, avatar_url, is_verified FROM users WHERE email = $1`,
          [googleUser.email]
        );

        if (emailResult.rows[0]) {
          user = emailResult.rows[0];
          // Link Google provider to existing account
          await pool.query(
            `INSERT INTO auth_providers (user_id, provider, provider_user_id) VALUES ($1, 'google', $2) ON CONFLICT DO NOTHING`,
            [user.id, googleUser.googleId]
          );
        } else {
          // Brand new user — create account
          const newUserResult = await pool.query(
            `INSERT INTO users (name, email, avatar_url, is_verified, role)
             VALUES ($1, $2, $3, TRUE, 'user') RETURNING id, name, email, role, city, avatar_url, is_verified`,
            [googleUser.name, googleUser.email, googleUser.picture]
          );
          user = newUserResult.rows[0];
          await pool.query(
            `INSERT INTO auth_providers (user_id, provider, provider_user_id) VALUES ($1, 'google', $2)`,
            [user.id, googleUser.googleId]
          );
        }
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken();
      await createSession(user.id, req, refreshToken);
      await logAuthEvent('google_login', user.id, req);

      sendTokens(res, 200, user, accessToken, refreshToken);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /auth/refresh
   * Exchange a valid refresh token for a new access token
   */
  refresh: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(401).json({ status: 'error', message: 'Refresh token required', code: 'REFRESH_REQUIRED' });

      const hashedToken = hashToken(refreshToken);

      const sessionResult = await pool.query(
        `SELECT s.*, u.id as uid, u.name, u.email, u.role, u.avatar_url, u.city
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.refresh_token = $1`,
        [hashedToken]
      );
      const session = sessionResult.rows[0];

      if (!session) return res.status(401).json({ status: 'error', message: 'Invalid refresh token', code: 'INVALID_REFRESH' });
      if (session.is_revoked) return res.status(401).json({ status: 'error', message: 'Session has been revoked', code: 'SESSION_REVOKED' });
      if (new Date(session.expires_at) < new Date()) return res.status(401).json({ status: 'error', message: 'Refresh token expired', code: 'REFRESH_EXPIRED' });

      const newAccessToken = generateAccessToken(session.uid);
      await logAuthEvent('token_refreshed', session.uid, req);

      res.json({ status: 'success', accessToken: newAccessToken });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /auth/logout
   * Revoke the refresh token in the DB
   */
  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        const hashedToken = hashToken(refreshToken);
        await pool.query(
          `UPDATE sessions SET is_revoked = TRUE WHERE refresh_token = $1`,
          [hashedToken]
        );
      }
      if (req.user) {
        await logAuthEvent('logout', req.user.id, req);
      }
      res.json({ status: 'success', message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /auth/request-otp
   */
  requestOtp: async (req, res, next) => {
    try {
      const { phone } = otpRequestSchema.parse(req.body);

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = crypto.createHash('sha256').update(code).digest('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Invalidate any existing OTPs for this phone
      await pool.query(`UPDATE otp_verifications SET is_used = TRUE WHERE phone = $1`, [phone]);

      await pool.query(
        `INSERT INTO otp_verifications (phone, otp_hash, expires_at) VALUES ($1, $2, $3)`,
        [phone, otpHash, expiresAt]
      );

      const smsService = require('../services/smsService');
      await smsService.sendOtp(phone, code);

      await logAuthEvent('otp_sent', null, req, { phone });

      res.json({
        status: 'success',
        message: 'OTP sent successfully',
        code: process.env.NODE_ENV === 'development' ? code : undefined,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /auth/verify-otp
   */
  verifyOtp: async (req, res, next) => {
    try {
      const { phone, code } = otpVerifySchema.parse(req.body);

      const otpHash = crypto.createHash('sha256').update(code).digest('hex');

      const otpResult = await pool.query(
        `SELECT * FROM otp_verifications
         WHERE phone = $1 AND otp_hash = $2 AND is_used = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [phone, otpHash]
      );

      if (otpResult.rows.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Invalid or expired OTP' });
      }

      // Mark OTP as used
      await pool.query(`UPDATE otp_verifications SET is_used = TRUE WHERE id = $1`, [otpResult.rows[0].id]);

      // Find or create user
      let userResult = await pool.query(
        `SELECT id, name, phone, role, avatar_url, city FROM users WHERE phone = $1`,
        [phone]
      );
      let user = userResult.rows[0];
      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        const insert = await pool.query(
          `INSERT INTO users (phone, role, is_verified) VALUES ($1, 'user', TRUE) RETURNING id, name, phone, role, avatar_url, city`,
          [phone]
        );
        user = insert.rows[0];
        await pool.query(
          `INSERT INTO auth_providers (user_id, provider, provider_user_id) VALUES ($1, 'phone', $2)`,
          [user.id, phone]
        );
      }

      await logAuthEvent('otp_verified', user.id, req, { phone });

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken();
      await createSession(user.id, req, refreshToken);

      res.json({ status: 'success', accessToken, refreshToken, isNewUser, data: { user } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /auth/me
   */
  getMe: async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT id, name, email, phone, role, avatar_url, city, state, is_verified, created_at
         FROM users WHERE id = $1`,
        [req.user.id]
      );
      res.json({ status: 'success', data: { user: result.rows[0] } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /auth/update-me
   */
  updateMe: async (req, res, next) => {
    try {
      const { name, city, state } = req.body;
      const result = await pool.query(
        `UPDATE users SET
           name = COALESCE($1, name),
           city = COALESCE($2, city),
           state = COALESCE($3, state)
         WHERE id = $4
         RETURNING id, name, email, phone, role, avatar_url, city, state, is_verified`,
        [name, city, state, req.user.id]
      );
      res.json({ status: 'success', data: { user: result.rows[0] } });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
