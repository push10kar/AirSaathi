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

async function runMigration() {
  console.log('🚀 Starting AirSaathi migrations...');
  
  const migrations = [
    '001_auth_overhaul.sql',
    '002_aqi_location_schema.sql'
  ];

  try {
    for (const file of migrations) {
      console.log(`📄 Running migration: ${file}`);
      const sqlPath = path.join(__dirname, 'migrations', file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sql);
    }
    console.log('✅ All migrations completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
