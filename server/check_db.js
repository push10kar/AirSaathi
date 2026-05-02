const pool = require('./src/config/db');

const checkColumns = async () => {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log('Columns in users table:', result.rows.map(r => r.column_name));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkColumns();
