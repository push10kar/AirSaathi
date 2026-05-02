const pool = require('./src/config/db');

const addPhoneColumn = async () => {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) UNIQUE');
    console.log('Successfully added phone column to users table');
    process.exit(0);
  } catch (err) {
    console.error('Failed to add phone column:', err);
    process.exit(1);
  }
};

addPhoneColumn();
