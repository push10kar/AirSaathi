const pool = require('./src/config/db');

const syncUsersTable = async () => {
  try {
    // Add missing columns if they don't exist
    const columns = [
      { name: 'email', type: 'VARCHAR(255) UNIQUE' },
      { name: 'password', type: 'VARCHAR(255)' },
      { name: 'google_id', type: 'VARCHAR(255) UNIQUE' },
      { name: 'is_active', type: 'BOOLEAN DEFAULT TRUE' }
    ];

    for (const col of columns) {
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column ${col.name}`);
      } catch (e) {
        if (e.code === '42701') {
          console.log(`Column ${col.name} already exists`);
        } else {
          throw e;
        }
      }
    }
    
    console.log('Users table sync complete');
    process.exit(0);
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
};

syncUsersTable();
