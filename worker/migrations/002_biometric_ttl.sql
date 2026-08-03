-- 90-day TTL for biometric verification
ALTER TABLE biometric_verification ADD COLUMN expires_at INTEGER;
ALTER TABLE biometric_verification ADD COLUMN biometric_valid INTEGER DEFAULT 0;