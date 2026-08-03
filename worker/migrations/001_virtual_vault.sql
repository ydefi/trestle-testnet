-- Biometric verification status (mirrors on-chain verification)
CREATE TABLE IF NOT EXISTS biometric_verification (
  user_address TEXT PRIMARY KEY,
  biometric_hash TEXT NOT NULL,
  sybil_score INTEGER NOT NULL DEFAULT 0,
  fully_verified INTEGER NOT NULL DEFAULT 0,
  verified_at INTEGER,
  passport_score INTEGER DEFAULT 0,
  linked_accounts INTEGER DEFAULT 0
);

-- Virtual balances for off-chain hNOBT tracking
CREATE TABLE IF NOT EXISTS virtual_balances (
  user_address TEXT PRIMARY KEY,
  virtual_hnobt TEXT NOT NULL DEFAULT '0',
  btr_claimable TEXT NOT NULL DEFAULT '0',
  staking_active INTEGER NOT NULL DEFAULT 0,
  staking_tier INTEGER NOT NULL DEFAULT 0,
  last_yield_time TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Settlement nonces for EIP-712 vouchers
CREATE TABLE IF NOT EXISTS settlement_nonces (
  user_address TEXT PRIMARY KEY,
  nonce INTEGER NOT NULL DEFAULT 0
);