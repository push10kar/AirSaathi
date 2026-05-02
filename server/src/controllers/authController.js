const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const smsService = require('../services/smsService');

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
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

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

const authController = {
  signup: async (req, res, next) => {
    try {
      const { name, email, password, city } = signupSchema.parse(req.body);

      // Check if user exists
      const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ status: 'error', message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await pool.query(
        `INSERT INTO users (name, email, password, city) 
         VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
        [name, email, hashedPassword, city]
      );

      const user = result.rows[0];
      const token = signToken(user.id);

      res.status(201).json({
        status: 'success',
        token,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ status: 'error', message: 'Incorrect email or password' });
      }

      const token = signToken(user.id);

      // Remove password from output
      delete user.password;

      res.status(200).json({
        status: 'success',
        token,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  },

  requestOtp: async (req, res, next) => {
    try {
      const { phone } = otpRequestSchema.parse(req.body);
      
      // Generate 6 digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save to DB
      await pool.query(
        'INSERT INTO verification_codes (phone, code, expires_at) VALUES ($1, $2, $3)',
        [phone, code, expiresAt]
      );

      // Send SMS via service
      const smsSent = await smsService.sendOtp(phone, code);

      res.status(200).json({
        status: 'success',
        message: smsSent ? 'OTP sent successfully' : 'OTP generation failed',
        // In dev, we return code for testing convenience
        code: process.env.NODE_ENV === 'development' ? code : undefined
      });
    } catch (err) {
      next(err);
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      const { phone, code } = otpVerifySchema.parse(req.body);

      // Check if code is valid and not expired
      const result = await pool.query(
        'SELECT * FROM verification_codes WHERE phone = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
        [phone, code]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Invalid or expired OTP' });
      }

      // Cleanup codes for this phone
      await pool.query('DELETE FROM verification_codes WHERE phone = $1', [phone]);

      // Find or create user
      const userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
      let user = userResult.rows[0];
      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        // Create new user with phone
        const insertResult = await pool.query(
          'INSERT INTO users (name, phone, role) VALUES ($1, $2, $3) RETURNING id, name, phone, role',
          [`User ${phone.slice(-4)}`, phone, 'user']
        );
        user = insertResult.rows[0];
      }

      const token = signToken(user.id);

      res.status(200).json({
        status: 'success',
        token,
        isNewUser,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  },

  getMe: async (req, res, next) => {
    try {
      const result = await pool.query('SELECT id, name, email, role, avatar_url, city, phone FROM users WHERE id = $1', [req.user.id]);
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  updateMe: async (req, res, next) => {
    try {
      const { name, city } = req.body;
      const result = await pool.query(
        'UPDATE users SET name = COALESCE($1, name), city = COALESCE($2, city) WHERE id = $3 RETURNING id, name, email, role, avatar_url, city, phone',
        [name, city, req.user.id]
      );
      res.json({
        status: 'success',
        data: { user: result.rows[0] }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
