const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createFeedbackTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS app_feedback (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES users(id),
      type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ app_feedback table created successfully');
  } catch (err) {
    console.error('❌ Error creating feedback table:', err);
  } finally {
    await pool.end();
  }
}

createFeedbackTable();
