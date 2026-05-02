const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'src/db/migrations/otp_table.sql'), 'utf8');
    await pool.query(sql);
    console.log('OTP table migration successful');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
