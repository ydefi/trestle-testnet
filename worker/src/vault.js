import { hexToBytes, keccak256, encodeAbiParameters, parseAbiParameters } from "viem";
import { privateKeyToAccount } from "viem/accounts";

let signerAccount = null;

export function initVaultSigner(privateKey) {
  if (!privateKey) {
    console.warn("SIGNER_PRIVATE_KEY not set — vault settlement signing disabled");
    return null;
  }
  const key = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  signerAccount = privateKeyToAccount(key);
  return signerAccount;
}

export function getVaultSignerAddress() {
  return signerAccount?.address ?? null;
}

const STAKING_TIERS = [
  { label: "3 Month", seconds: 90 * 86400, baseApr: 0.05, bonus: 1.0 },
  { label: "6 Month", seconds: 180 * 86400, baseApr: 0.07, bonus: 1.25 },
  { label: "12 Month", seconds: 365 * 86400, baseApr: 0.10, bonus: 1.5 },
];

const YEAR_SECONDS = 31536000;
const VERIFICATION_TTL = 90 * 24 * 60 * 60; // 90 days in seconds

export function getTierInfo(tierId) {
  return STAKING_TIERS[tierId] || null;
}

export function getStakingTiers() {
  return STAKING_TIERS.map((t, i) => ({ id: i, ...t }));
}

export async function getVirtualBalance(db, address) {
  let row = await db.prepare("SELECT * FROM virtual_balances WHERE user_address = ?").bind(address).first();
  if (!row) {
    await db.prepare("INSERT INTO virtual_balances (user_address) VALUES (?)").bind(address).run();
    row = { user_address: address, virtual_hnobt: "0", btr_claimable: "0", staking_active: 0, staking_tier: 0, last_yield_time: null };
  }
  return row;
}

export async function addVirtualHNobt(db, address, amount) {
  const bal = await getVirtualBalance(db, address);
  const newBal = (BigInt(bal.virtual_hnobt) + BigInt(amount)).toString();
  await db.prepare(
    "UPDATE virtual_balances SET virtual_hnobt = ?, updated_at = datetime('now') WHERE user_address = ?"
  ).bind(newBal, address).run();
  return { virtual_hnobt: newBal };
}

export async function toggleStaking(db, address, active, tierId = 0) {
  const bal = await getVirtualBalance(db, address);
  if (active && BigInt(bal.virtual_hnobt) <= 0n) {
    throw new Error("No virtual hNobt to stake");
  }
  if (active && (tierId < 0 || tierId >= STAKING_TIERS.length)) {
    throw new Error("Invalid staking tier");
  }
  const now = Math.floor(Date.now() / 1000);
  await db.prepare(
    "UPDATE virtual_balances SET staking_active = ?, staking_tier = ?, last_yield_time = ?, updated_at = datetime('now') WHERE user_address = ?"
  ).bind(active ? 1 : 0, active ? tierId : 0, active ? now.toString() : null, address).run();
  return { staking_active: !!active, staking_tier: active ? tierId : 0 };
}

export function computePendingYield(bal, currentTime) {
  if (!bal.staking_active || !bal.last_yield_time) return "0";
  const tier = STAKING_TIERS[bal.staking_tier] || STAKING_TIERS[0];
  const elapsed = currentTime - parseInt(bal.last_yield_time);
  if (elapsed <= 0) return "0";
  const baseYield = (BigInt(bal.virtual_hnobt) * BigInt(Math.floor(tier.baseApr * 1e6)) * BigInt(elapsed)) / BigInt(YEAR_SECONDS * 1e6);
  const yield_ = (baseYield * BigInt(Math.floor(tier.bonus * 100))) / 100n;
  return yield_.toString();
}

export async function applyYield(db, address) {
  const bal = await getVirtualBalance(db, address);
  if (!bal.staking_active || !bal.last_yield_time) return bal;
  const now = Math.floor(Date.now() / 1000);
  const yield_ = computePendingYield(bal, now);
  if (yield_ === "0") return bal;
  const newClaimable = (BigInt(bal.btr_claimable) + BigInt(yield_)).toString();
  await db.prepare(
    "UPDATE virtual_balances SET btr_claimable = ?, last_yield_time = ?, updated_at = datetime('now') WHERE user_address = ?"
  ).bind(newClaimable, now.toString(), address).run();
  return { ...bal, btr_claimable: newClaimable, last_yield_time: now.toString() };
}

export async function generateSettlementVoucher(env, address) {
  if (!signerAccount) throw new Error("Vault signer not initialized");

  const db = env.DB;

  // Require biometric verification for Virtual Vault withdrawals (valid 90 days)
  const biometric = await db.prepare(
    "SELECT fully_verified, verified_at FROM biometric_verification WHERE user_address = ? AND fully_verified = 1"
  ).bind(address).first();

  if (!biometric) {
    throw new Error("Biometric verification required for Virtual Vault withdrawal");
  }

  const now = Math.floor(Date.now() / 1000);
  if ((now - biometric.verified_at) > VERIFICATION_TTL) {
    throw new Error("Biometric verification expired - re-verify required");
  }

  const bal = await applyYield(db, address);

  if (BigInt(bal.btr_claimable) <= 0n && BigInt(bal.virtual_hnobt) <= 0n) {
    throw new Error("Nothing to settle");
  }

  let nonceRow = await db.prepare("SELECT * FROM settlement_nonces WHERE user_address = ?").bind(address).first();
  const nonce = nonceRow ? nonceRow.nonce + 1 : 0;
  if (!nonceRow) {
    await db.prepare("INSERT INTO settlement_nonces (user_address, nonce) VALUES (?, ?)").bind(address, nonce).run();
  } else {
    await db.prepare("UPDATE settlement_nonces SET nonce = ? WHERE user_address = ?").bind(nonce, address).run();
  }

  const deadline = Math.floor(Date.now() / 1000) + 600;
  const btrAmount = bal.btr_claimable;
  const hNobtStaked = bal.virtual_hnobt;

  const chainId = 137;

  const domain = {
    name: "TrestleVault",
    version: "1",
    chainId,
    verifyingContract: env.VAULT_SETTLEMENT_ADDRESS || "0x89e1404902a861DCFedbC685617B6cc986fD852E",
  };

  const types = {
    Voucher: [
      { name: "walletAddress", type: "address" },
      { name: "btrAmount", type: "uint256" },
      { name: "hNobtStaked", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const value = {
    walletAddress: address,
    btrAmount: btrAmount,
    hNobtStaked: hNobtStaked,
    nonce: BigInt(nonce),
    deadline: BigInt(deadline),
  };

  const signature = await signerAccount.signTypedData({
    domain,
    types,
    primaryType: "Voucher",
    message: {
      walletAddress: value.walletAddress,
      btrAmount: value.btrAmount,
      hNobtStaked: value.hNobtStaked,
      nonce: value.nonce,
      deadline: value.deadline,
    },
  });

  await db.prepare(
    "UPDATE virtual_balances SET virtual_hnobt = '0', btr_claimable = '0', staking_active = 0, staking_tier = 0, last_yield_time = NULL, updated_at = datetime('now') WHERE user_address = ?"
  ).bind(address).run();

  return {
    voucher: {
      walletAddress: address,
      btrAmount,
      hNobtStaked,
      nonce,
      deadline,
    },
    signature,
    domain,
  };
}

export async function processAllYields(db) {
  const activeStakers = await db.prepare(
    "SELECT * FROM virtual_balances WHERE staking_active = 1 AND last_yield_time IS NOT NULL"
  ).all();
  const now = Math.floor(Date.now() / 1000);
  let processed = 0;
  for (const bal of activeStakers.results) {
    const yield_ = computePendingYield(bal, now);
    if (yield_ !== "0") {
      const newClaimable = (BigInt(bal.btr_claimable) + BigInt(yield_)).toString();
      await db.prepare(
        "UPDATE virtual_balances SET btr_claimable = ?, last_yield_time = ?, updated_at = datetime('now') WHERE user_address = ?"
      ).bind(newClaimable, now.toString(), bal.user_address).run();
      processed++;
    }
  }
  return processed;
}