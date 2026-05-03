-- ============================================================
-- AirSaathi AQI & Location Schema — 002_aqi_location_schema.sql
-- Using Standard SQL (No PostGIS required)
-- ============================================================

-- 1. AQI MONITORING STATIONS
CREATE TABLE IF NOT EXISTS aqi_stations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(200) NOT NULL,       -- "Shivajinagar, Pune"
  city          VARCHAR(100) NOT NULL,       -- "Pune"
  district      VARCHAR(100) NOT NULL,       -- "Pune"
  state         VARCHAR(100) DEFAULT 'Maharashtra',
  agency        VARCHAR(100),               -- "SAFAR", "CPCB", "MPCB"
  station_code  VARCHAR(50) UNIQUE,         -- official station ID
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stations_city     ON aqi_stations(city);
CREATE INDEX IF NOT EXISTS idx_stations_coords   ON aqi_stations(lat, lng);

-- 2. AQI READINGS
CREATE TABLE IF NOT EXISTS aqi_readings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id    UUID NOT NULL REFERENCES aqi_stations(id) ON DELETE CASCADE,
  
  -- Overall AQI
  aqi           INTEGER,                    -- 0–500 index
  aqi_category  VARCHAR(30),               -- Good, Moderate, etc.
  
  -- Individual pollutants (µg/m³)
  pm25          DECIMAL(8,2),
  pm10          DECIMAL(8,2),
  no2           DECIMAL(8,2),
  so2           DECIMAL(8,2),
  co            DECIMAL(8,2),
  o3            DECIMAL(8,2),
  nh3           DECIMAL(8,2),
  
  source        VARCHAR(50) DEFAULT 'manual',
  recorded_at   TIMESTAMP NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readings_station_time  ON aqi_readings(station_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_recorded_at   ON aqi_readings(recorded_at DESC);

-- 3. USER LOCATIONS (Tracking history)
CREATE TABLE IF NOT EXISTS user_locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  city        VARCHAR(100),
  district    VARCHAR(100),
  pincode     VARCHAR(10),
  is_current  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_locations_user    ON user_locations(user_id);

-- 4. USER SAVED PLACES
CREATE TABLE IF NOT EXISTS user_saved_places (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  label       VARCHAR(50),                -- "Home", "College"
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  city        VARCHAR(100),
  district    VARCHAR(100),
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_places_user     ON user_saved_places(user_id);
