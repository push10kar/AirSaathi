const axios = require('axios');

// In-memory cache to avoid hitting API limits
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const WAQI_TOKEN = process.env.WAQI_TOKEN || 'demo'; // 'demo' works for some requests, but user should get their own

const aqiController = {
  getLiveAQI: async (req, res, next) => {
    try {
      const { city, lat, lng } = req.query;
      
      let target;
      let cacheKey;

      if (lat && lng) {
        target = `geo:${lat};${lng}`;
        cacheKey = `coords:${lat.slice(0, 5)};${lng.slice(0, 5)}`; // Precise to ~1km for caching
      } else {
        target = city || 'pune';
        cacheKey = `city:${target}`;
      }

      // Check cache first
      if (cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
          return res.json(cachedData.data);
        }
      }

      // Fetch from WAQI API
      const url = `https://api.waqi.info/feed/${target}/?token=${WAQI_TOKEN}`;
      const response = await axios.get(url);

      if (response.data.status !== 'ok') {
        return res.status(404).json({ 
          status: 'error', 
          message: 'City not found or API error',
          debug: response.data.data 
        });
      }

      const rawData = response.data.data;
      
      // Transform into a cleaner format for our app
      const formattedData = {
        city: rawData.city.name,
        aqi: rawData.aqi,
        main_pollutant: rawData.dominentpol,
        temp: rawData.iaqi.t?.v,
        humidity: rawData.iaqi.h?.v,
        time: rawData.time.s,
        station_coords: rawData.city.geo,
        last_updated: new Date().toISOString()
      };

      // Save to cache
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: formattedData
      });

      res.json(formattedData);
    } catch (err) {
      next(err);
    }
  },

  // Get multiple major cities in Maharashtra at once
  getMaharashtraOverview: async (req, res, next) => {
    const cities = ['mumbai', 'pune', 'nagpur', 'nashik', 'aurangabad', 'thane'];
    try {
      const results = await Promise.all(
        cities.map(async (city) => {
          const url = `https://api.waqi.info/feed/${city}/?token=${WAQI_TOKEN}`;
          const resp = await axios.get(url);
          return resp.data.status === 'ok' ? { city, aqi: resp.data.data.aqi } : null;
        })
      );
      res.json(results.filter(r => r !== null));
    } catch (err) {
      next(err);
    }
  }
};

module.exports = aqiController;
