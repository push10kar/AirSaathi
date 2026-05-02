const pool = require('../config/db');

const seed = async () => {
  try {
    console.log('Seeding database...');

    // 1. Create a default user
    const userResult = await pool.query(`
      INSERT INTO users (id, name, avatar_url, city, state, role)
      VALUES (
        '00000000-0000-0000-0000-000000000000', 
        'Test User', 
        'https://i.pravatar.cc/150?u=test', 
        'Pune', 
        'Maharashtra', 
        'user'
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING *
    `);

    if (userResult.rows.length > 0) {
      console.log('Created test user:', userResult.rows[0].name);
    } else {
      console.log('Test user already exists.');
    }

    // 2. Create some initial tags
    const tags = ['aqi', 'pollution', 'cleanup', 'health'];
    for (const tag of tags) {
      await pool.query('INSERT INTO post_tags (name) VALUES ($1) ON CONFLICT DO NOTHING', [tag]);
    }
    console.log('Sample tags seeded.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
