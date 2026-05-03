const pool = require('../config/db');

/**
 * AQI Controller — Professional Location-based AQI logic
 * Using Haversine formula in SQL for proximity search without PostGIS
 */
const aqiController = {
  
  /**
   * GET /aqi/nearest?lat=X&lng=Y
   * Find the nearest monitoring station to a given coordinate
   */
  getNearestStation: async (req, res, next) => {
    try {
      const { lat, lng } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ status: 'error', message: 'Latitude and Longitude are required' });
      }

      // 3959 = Miles, 6371 = Kilometers
      const query = `
        SELECT 
          id, name, city, agency, lat, lng,
          (6371 * acos(
            cos(radians($1)) * cos(radians(lat)) * 
            cos(radians(lng) - radians($2)) + 
            sin(radians($1)) * sin(radians(lat))
          )) AS distance_km
        FROM aqi_stations
        WHERE is_active = TRUE
        ORDER BY distance_km ASC
        LIMIT 1
      `;

      const result = await pool.query(query, [lat, lng]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'No monitoring stations found' });
      }

      res.json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /aqi/current?lat=X&lng=Y
   * Get latest AQI data from the nearest station
   */
  getAQIForLocation: async (req, res, next) => {
    try {
      const { lat, lng } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ status: 'error', message: 'Latitude and Longitude are required' });
      }

      const query = `
        WITH nearest_station AS (
          SELECT 
            id, name, city, lat, lng,
            (6371 * acos(
              cos(radians($1)) * cos(radians(lat)) * 
              cos(radians(lng) - radians($2)) + 
              sin(radians($1)) * sin(radians(lat))
            )) AS distance_km
          FROM aqi_stations
          WHERE is_active = TRUE
          ORDER BY distance_km ASC
          LIMIT 3
        )
        SELECT 
          ns.name as station_name,
          ns.city,
          ns.distance_km,
          r.aqi,
          r.aqi_category,
          r.pm25,
          r.pm10,
          r.no2,
          r.so2,
          r.co,
          r.o3,
          r.recorded_at
        FROM nearest_station ns
        LEFT JOIN LATERAL (
          SELECT * FROM aqi_readings
          WHERE station_id = ns.id
          ORDER BY recorded_at DESC
          LIMIT 1
        ) r ON TRUE
        ORDER BY ns.distance_km ASC
      `;

      const result = await pool.query(query, [lat, lng]);
      
      res.json({
        status: 'success',
        data: result.rows // Returns top 3 closest stations with their latest data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /aqi/history/:stationId?hours=24
   */
  getStationHistory: async (req, res, next) => {
    try {
      const { stationId } = req.params;
      const hours = req.query.hours || 24;

      const query = `
        SELECT aqi, pm25, pm10, aqi_category, recorded_at
        FROM aqi_readings
        WHERE station_id = $1
          AND recorded_at >= NOW() - INTERVAL '1 hour' * $2
        ORDER BY recorded_at ASC
      `;

      const result = await pool.query(query, [stationId, hours]);
      
      res.json({
        status: 'success',
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = aqiController;
