const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seedAdminData() {
  console.log('🌱 Seeding AirSaathi Admin Dashboard mock data...');

  try {
    // 1. Get existing or create mock users
    console.log('Retrieving users...');
    const userRes = await pool.query("SELECT id, name, email FROM users WHERE role = 'user' LIMIT 3");
    let users = userRes.rows;

    if (users.length < 3) {
      console.log('Creating fresh mock users for seeding...');
      const userSeeds = [
        { name: 'Ramesh Kumar', email: 'ramesh@example.com' },
        { name: 'Priya Sharma', email: 'priya@example.com' },
        { name: 'Rohan Patil', email: 'rohan@example.com' }
      ];

      for (const u of userSeeds) {
        const check = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
        if (check.rows.length === 0) {
          const insert = await pool.query(
            "INSERT INTO users (name, email, city, state, role) VALUES ($1, $2, 'Pune', 'Maharashtra', 'user') RETURNING id, name, email",
            [u.name, u.email]
          );
          users.push(insert.rows[0]);
        } else {
          const getUser = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [u.email]);
          users.push(getUser.rows[0]);
        }
      }
    }

    const ramesh = users[0];
    const priya = users[1];
    const rohan = users[2];

    console.log(`Using mock users: \n- Ramesh: ${ramesh.id}\n- Priya: ${priya.id}\n- Rohan: ${rohan.id}`);

    // Clear old seeded posts, reports, claims for fresh seeds
    console.log('Clearing old mock posts, reports, claims...');
    await pool.query('DELETE FROM reports');
    await pool.query('DELETE FROM reward_claims');
    await pool.query('DELETE FROM comments');
    await pool.query('DELETE FROM posts');

    // 2. Insert Mock Posts
    console.log('Creating mock posts...');
    const posts = [];
    
    // Post 1: Good post
    const post1 = await pool.query(
      `INSERT INTO posts (user_id, content, media_url, media_type, post_type, location)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        ramesh.id,
        'Successfully completed a 5km morning walk and tracked the air quality! AQI was a healthy 45 in Kothrud this morning. 🌱🚶‍♂️',
        'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=500',
        'image',
        'achievement',
        'Kothrud, Pune'
      ]
    );
    posts.push(post1.rows[0]);

    // Post 2: Positive activity
    const post2 = await pool.query(
      `INSERT INTO posts (user_id, content, media_url, media_type, post_type, location)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        priya.id,
        'We planted 10 saplings in our residential society today to help fight local carbon emissions! Join our next drive. 🌳🏡',
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500',
        'image',
        'action',
        'Baner, Pune'
      ]
    );
    posts.push(post2.rows[0]);

    // Post 3: Offensive post (abusive/spam)
    const post3 = await pool.query(
      `INSERT INTO posts (user_id, content, media_url, media_type, post_type, location)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        rohan.id,
        'Selling cheap crypto coins and bypass software!! Click here to double your points instantly! SPAM SPAM buy now!!! 💢💢💸',
        null,
        'none',
        'other',
        'Shivajinagar, Pune'
      ]
    );
    posts.push(post3.rows[0]);

    // Post 4: Complaint post (reported for abuse)
    const post4 = await pool.query(
      `INSERT INTO posts (user_id, content, media_url, media_type, post_type, location)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        rohan.id,
        'You people are stupid. Air quality is a hoax created by the government. Keep burning plastic, it does nothing! Idiot greens.',
        null,
        'none',
        'complaint',
        'Camp, Pune'
      ]
    );
    posts.push(post4.rows[0]);

    console.log(`Created ${posts.length} posts.`);

    // 3. Create Mock Reports
    console.log('Creating mock reports...');
    // Report Rohan's spam post
    await pool.query(
      `INSERT INTO reports (reporter_id, target_type, target_id, reason, description, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [ramesh.id, 'post', posts[2].id, 'spam', 'Spamming crypto and points cheats in the feed.', 'pending']
    );

    // Report Rohan's abusive post
    await pool.query(
      `INSERT INTO reports (reporter_id, target_type, target_id, reason, description, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [priya.id, 'post', posts[3].id, 'abuse', 'Very abusive language, insulting users, and promoting plastic burning.', 'pending']
    );

    console.log('Seeded reports successfully.');

    // 4. Create Mock Reward Claims
    console.log('Retrieving rewards to link...');
    const rewardRes = await pool.query('SELECT * FROM rewards');
    const rewards = rewardRes.rows;

    if (rewards.length > 0) {
      console.log('Creating mock reward claims...');
      
      // Ramesh claims Eco Bottle (pending)
      const bottleReward = rewards.find(r => r.name === 'Eco Bottle') || rewards[0];
      await pool.query(
        `INSERT INTO reward_claims (user_id, reward_id, status)
         VALUES ($1, $2, $3)`,
        [ramesh.id, bottleReward.id, 'pending']
      );

      // Priya claims AirSaathi Tee (pending)
      const teeReward = rewards.find(r => r.name === 'AirSaathi Tee') || rewards[1] || rewards[0];
      await pool.query(
        `INSERT INTO reward_claims (user_id, reward_id, status)
         VALUES ($1, $2, $3)`,
        [priya.id, teeReward.id, 'pending']
      );

      // Ramesh claims Solar Powerbank (approved)
      const zapReward = rewards.find(r => r.name === 'Solar Powerbank') || rewards[4] || rewards[0];
      await pool.query(
        `INSERT INTO reward_claims (user_id, reward_id, status, resolved_at)
         VALUES ($1, $2, $3, NOW())`,
        [ramesh.id, zapReward.id, 'approved']
      );
      
      console.log('Seeded reward claims successfully.');
    }

    console.log('✨ ALL MOCK ADMIN DATA SEEDED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedAdminData();
