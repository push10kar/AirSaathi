const pool = require('./src/config/db');

async function check() {
  try {
    const stations = await pool.query('SELECT COUNT(*) FROM aqi_stations');
    console.log('Stations count:', stations.rows[0].count);
    
    const readings = await pool.query('SELECT COUNT(*) FROM aqi_readings');
    console.log('Readings count:', readings.rows[0].count);
    
    if (stations.rows[0].count > 0) {
      const sample = await pool.query('SELECT * FROM aqi_stations LIMIT 1');
      console.log('Sample Station:', sample.rows[0]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
