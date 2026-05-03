-- ============================================================
-- AirSaathi Auth System Migration — 001_auth_overhaul.sql
-- Safe to run multiple times (idempotent via IF NOT EXISTS)
-- ============================================================

-- 0. Helper: auto-update `updated_at` on users
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Add missing columns to existing `users` table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS state        VARCHAR(100);

-- 2. AUTH PROVIDERS
CREATE TABLE IF NOT EXISTS auth_providers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider           VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'apple', 'phone', 'email')),
  provider_user_id   VARCHAR(255) NOT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_user_id)
);

-- 3. PASSWORDS (separated from users for security)
CREATE TABLE IF NOT EXISTS user_passwords (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash  VARCHAR(255) NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- 3a. Migrate existing passwords from users.password → user_passwords
INSERT INTO user_passwords (user_id, password_hash)
SELECT id, password FROM users
WHERE password IS NOT NULL
  AND id NOT IN (SELECT user_id FROM user_passwords)
ON CONFLICT DO NOTHING;

-- 3b. Drop password column from users (only after migration)
ALTER TABLE users DROP COLUMN IF EXISTS password;
ALTER TABLE users DROP COLUMN IF EXISTS google_id;

-- 4. SESSIONS (refresh token store)
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token   VARCHAR(512) NOT NULL UNIQUE,
  user_agent      VARCHAR(500),
  ip_address      VARCHAR(45),
  is_revoked      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMP NOT NULL
);

-- 5. DEVICES
CREATE TABLE IF NOT EXISTS devices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_name  VARCHAR(200),
  device_type  VARCHAR(20) CHECK (device_type IN ('mobile', 'web', 'tablet')),
  os           VARCHAR(100),
  last_active  TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. OTP VERIFICATIONS
CREATE TABLE IF NOT EXISTS otp_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       VARCHAR(20),
  email       VARCHAR(255),
  otp_hash    VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  is_used     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT otp_target_required CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- 7. EMAIL / PHONE VERIFICATIONS (token-based)
CREATE TABLE IF NOT EXISTS verifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         VARCHAR(10) NOT NULL CHECK (type IN ('email', 'phone')),
  token        VARCHAR(255) NOT NULL UNIQUE,
  expires_at   TIMESTAMP NOT NULL,
  is_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. AUTH LOGS (security audit trail)
CREATE TABLE IF NOT EXISTS auth_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  event       VARCHAR(50) NOT NULL CHECK (event IN (
                'login', 'logout', 'failed_login',
                'password_change', 'otp_sent', 'otp_verified',
                'token_refreshed', 'session_revoked', 'account_locked',
                'signup', 'google_login'
              )),
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(500),
  metadata    JSONB,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 9. INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email             ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone             ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role              ON users(role);
CREATE INDEX IF NOT EXISTS idx_auth_providers_user_id  ON auth_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_providers_provider ON auth_providers(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id        ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token  ON sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at     ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_devices_user_id         ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_phone               ON otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_email               ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires             ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_verifications_token     ON verifications(token);
CREATE INDEX IF NOT EXISTS idx_verifications_user_id   ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id       ON auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_event         ON auth_logs(event);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at    ON auth_logs(created_at DESC);

-- 10. TRIGGER: auto-update updated_at on users
DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
