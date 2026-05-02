const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

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

  getMe: async (req, res, next) => {
    try {
      const result = await pool.query('SELECT id, name, email, role, avatar_url, city FROM users WHERE id = $1', [req.user.id]);
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
