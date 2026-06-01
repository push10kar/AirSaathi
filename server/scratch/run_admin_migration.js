const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runAdminMigration() {
  console.log('🚀 Running AirSaathi Admin Dashboard database migration...');
  try {
    const sqlPath = path.join(__dirname, '..', 'migrations', '004_admin_dashboard.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('✅ Admin Dashboard migration ran successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Admin Dashboard migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAdminMigration();
