const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const stations = [
  { name: 'Shivajinagar', city: 'Pune', district: 'Pune', agency: 'SAFAR', code: 'PUNE_SHV', lat: 18.5308, lng: 73.8475 },
  { name: 'Katraj', city: 'Pune', district: 'Pune', agency: 'MPCB', code: 'PUNE_KAT', lat: 18.4529, lng: 73.8654 },
  { name: 'Hadapsar', city: 'Pune', district: 'Pune', agency: 'MPCB', code: 'PUNE_HAD', lat: 18.5018, lng: 73.9260 },
  { name: 'Bhosari', city: 'Pimpri-Chinchwad', district: 'Pune', agency: 'MPCB', code: 'PUNE_BHO', lat: 18.6298, lng: 73.8446 },
  { name: 'Worli', city: 'Mumbai', district: 'Mumbai', agency: 'SAFAR', code: 'MUM_WOR', lat: 19.0178, lng: 72.8178 },
  { name: 'Bandra', city: 'Mumbai', district: 'Mumbai', agency: 'MPCB', code: 'MUM_BAN', lat: 19.0596, lng: 72.8295 },
  { name: 'Mazgaon', city: 'Mumbai', district: 'Mumbai', agency: 'SAFAR', code: 'MUM_MAZ', lat: 18.9667, lng: 72.8389 },
  { name: 'Civil Lines', city: 'Nagpur', district: 'Nagpur', agency: 'MPCB', code: 'NGP_CIV', lat: 21.1458, lng: 79.0882 },
  { name: 'Nashik Road', city: 'Nashik', district: 'Nashik', agency: 'MPCB', code: 'NSK_ROD', lat: 19.9975, lng: 73.7898 },
  { name: 'Kolhapur Central', city: 'Kolhapur', district: 'Kolhapur', agency: 'MPCB', code: 'KOL_CEN', lat: 16.7050, lng: 74.2433 }
];

async function seed() {
  console.log('🌱 Seeding AQI Monitoring Stations in Maharashtra...');
  try {
    for (const s of stations) {
      await pool.query(
        `INSERT INTO aqi_stations (name, city, district, agency, station_code, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (station_code) DO UPDATE SET
         lat = EXCLUDED.lat, lng = EXCLUDED.lng`,
        [s.name, s.city, s.district, s.agency, s.code, s.lat, s.lng]
      );
    }

    // Also seed some dummy readings for these stations
    console.log('📊 Seeding initial readings...');
    const result = await pool.query('SELECT id FROM aqi_stations');
    for (const row of result.rows) {
      const aqi = Math.floor(Math.random() * 250) + 50;
      let cat = 'Good';
      if (aqi > 50) cat = 'Satisfactory';
      if (aqi > 100) cat = 'Moderate';
      if (aqi > 200) cat = 'Poor';
      
      await pool.query(
        `INSERT INTO aqi_readings (station_id, aqi, aqi_category, pm25, pm10, no2, recorded_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [row.id, aqi, cat, (aqi * 0.6).toFixed(2), (aqi * 1.2).toFixed(2), (Math.random() * 40).toFixed(2)]
      );
    }

    console.log('✅ Seeding completed!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
