const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkPostGIS() {
  try {
    const res = await pool.query("SELECT PostGIS_Version();");
    console.log("PostGIS Version:", res.rows[0].postgis_version);
  } catch (err) {
    console.log("PostGIS NOT found or error:", err.message);
  } finally {
    await pool.end();
  }
}

checkPostGIS();
