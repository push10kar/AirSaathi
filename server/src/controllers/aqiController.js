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
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ status: 'error', message: 'Valid Latitude and Longitude are required' });
      }

      console.log(`[AQI] Fetching data for coords: ${lat}, ${lng}`);

      // Robust query using LEAST/GREATEST for acos precision and explicit casting
      const query = `
        WITH nearest_station AS (
          SELECT 
            id, name, city, lat, lng,
            (6371 * acos(
              LEAST(1, GREATEST(-1, 
                cos(radians($1)) * cos(radians(lat)) * 
                cos(radians(lng) - radians($2)) + 
                sin(radians($1)) * sin(radians(lat))
              ))
            )) AS distance_km
          FROM aqi_stations
          WHERE is_active = TRUE
          ORDER BY distance_km ASC
          LIMIT 3
        )
        SELECT 
          ns.id as station_id,
          ns.name as station_name,
          ns.city,
          ns.distance_km,
          COALESCE(r.aqi, 0) as aqi,
          COALESCE(r.aqi_category, 'Unknown') as aqi_category,
          r.pm25, r.pm10, r.no2, r.so2, r.co, r.o3,
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
      
      console.log(`[AQI] Found ${result.rows.length} stations nearby.`);

      res.json({
        status: 'success',
        data: result.rows
      });
    } catch (err) {
      console.error('[AQI Error]', err);
      next(err);
    }
  },

  /**
   * GET /aqi/history/:stationId?hours=24
   */
  getStationHistory: async (req, res, next) => {
    try {
      const { stationId } = req.params;
      const hours = parseInt(req.query.hours) || 24;

      // Validate UUID format before querying the database
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(stationId)) {
        console.warn(`[AQI History] Invalid UUID station ID: ${stationId}. This endpoint requires an internal UUID.`);
        
        // Attempt to find the station by station_code if it looks like one
        const fallbackStation = await pool.query('SELECT id FROM aqi_stations WHERE station_code = $1 OR id::text LIKE $1 LIMIT 1', [stationId]);
        
        if (fallbackStation.rows.length === 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Invalid station ID format. Internal UUID required.',
            data: [],
            meta: { hours, healthImpact: { cigaretteEquiv: '0.0', status: 'Unknown' } }
          });
        }
        
        // If we found a fallback, use its UUID
        return res.redirect(`/api/aqi/history/${fallbackStation.rows[0].id}?hours=${hours}`);
      }

      const query = `
        SELECT aqi, pm25, pm10, aqi_category, recorded_at
        FROM aqi_readings
        WHERE station_id = $1
          AND recorded_at >= NOW() - INTERVAL '1 hour' * $2
        ORDER BY recorded_at ASC
      `;

      const result = await pool.query(query, [stationId, hours]);
      
      // Calculate Health Impact (Cigarette Equivalence)
      // Reference: 1 Cigarette ≈ 22 µg/m³ of PM2.5 over 24 hours
      let healthImpact = { cigaretteEquiv: 0, status: 'Healthy' };
      
      if (result.rows.length > 0) {
        const avgPM25 = result.rows.reduce((sum, r) => sum + parseFloat(r.pm25 || 0), 0) / result.rows.length;
        healthImpact.cigaretteEquiv = (avgPM25 / 22).toFixed(1);
        
        if (healthImpact.cigaretteEquiv > 5) healthImpact.status = 'Extreme';
        else if (healthImpact.cigaretteEquiv > 2) healthImpact.status = 'High';
        else if (healthImpact.cigaretteEquiv > 0.5) healthImpact.status = 'Moderate';
      }

      res.json({
        status: 'success',
        data: result.rows,
        meta: {
          hours,
          healthImpact
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /aqi/alerts?city=Pune
   */
  getActiveAlerts: async (req, res, next) => {
    try {
      const { city } = req.query;
      
      const query = `
        SELECT * FROM system_alerts
        WHERE (city IS NULL OR city = $1)
          AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query, [city]);
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
