-- ============================================================
-- AirSaathi System Alerts Schema — 003_alerts_schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS system_alerts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          VARCHAR(50) NOT NULL,       -- "AQI_WARNING", "WEATHER_EVENT", "HEALTH_ADVISORY"
  severity      VARCHAR(20) NOT NULL,       -- "info", "warning", "critical"
  title         VARCHAR(200) NOT NULL,
  description   TEXT NOT NULL,
  city          VARCHAR(100),               -- Null means global/statewide
  station_id    UUID REFERENCES aqi_stations(id),
  expires_at    TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_city    ON system_alerts(city);
CREATE INDEX IF NOT EXISTS idx_alerts_expiry  ON system_alerts(expires_at);

-- Seed some initial alerts for Maharashtra
INSERT INTO system_alerts (type, severity, title, description, city, expires_at)
VALUES 
('HEALTH_ADVISORY', 'warning', 'High Ozone Levels', 'Ozone levels are expected to rise between 2 PM and 5 PM today. Heart and lung patients should stay indoors.', 'Pune', NOW() + INTERVAL '1 day'),
('AQI_WARNING', 'critical', 'Dust Storm Warning', 'A localized dust event is moving through Pimpri-Chinchwad area. Visibility may be reduced.', 'Pune', NOW() + INTERVAL '12 hours'),
('INFO', 'info', 'Clean Air Initiative', 'Join the plantation drive at Baner Hill this Sunday at 7 AM.', 'Pune', NOW() + INTERVAL '5 days');
