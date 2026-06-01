-- ============================================================
-- AirSaathi Admin Dashboard Schema — 004_admin_dashboard.sql
-- ============================================================

-- Rewards Table
CREATE TABLE IF NOT EXISTS rewards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  cost          INTEGER NOT NULL,
  icon          VARCHAR(50) NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Reward Claims Table
CREATE TABLE IF NOT EXISTS reward_claims (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id     UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at    TIMESTAMP DEFAULT NOW(),
  resolved_at   TIMESTAMP,
  resolved_by   UUID REFERENCES users(id)
);

-- Seed Initial Rewards
INSERT INTO rewards (name, cost, icon)
VALUES 
('Eco Bottle', 200, 'droplet'),
('AirSaathi Tee', 300, 'shopping-bag'),
('Prime Badge', 500, 'award'),
('N95 Mask Pack', 150, 'shield'),
('Solar Powerbank', 450, 'zap')
ON CONFLICT DO NOTHING;

-- Seed Some Mock Posts, Comments and Reports for Pune/Maharashtra Context
-- We will write a node script to perform references-safe seeding since UUIDs are dynamic.
