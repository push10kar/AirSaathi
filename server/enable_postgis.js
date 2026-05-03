const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function enablePostGIS() {
  try {
    await pool.query("CREATE EXTENSION IF NOT EXISTS postgis;");
    console.log("✅ PostGIS enabled successfully!");
  } catch (err) {
    console.log("❌ Failed to enable PostGIS:", err.message);
    console.log("Note: You might need to install postgis on your OS (e.g., sudo apt install postgresql-14-postgis-3)");
  } finally {
    await pool.end();
  }
}

enablePostGIS();
