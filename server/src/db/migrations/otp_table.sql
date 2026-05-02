-- Verification codes for Phone Auth
CREATE TABLE IF NOT EXISTS verification_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         VARCHAR(20) NOT NULL,
  code          VARCHAR(6) NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for cleanup and lookup
CREATE INDEX idx_otp_phone ON verification_codes(phone);
CREATE INDEX idx_otp_expires ON verification_codes(expires_at);
