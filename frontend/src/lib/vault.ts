import { VAULT_API_BASE } from "../config/contracts";

async function vaultApi<T = any>(path: string, opts?: RequestInit): Promise<T> {
  const r = await fetch(`${VAULT_API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(e.error || r.statusText);
  }
  return r.json();
}

export interface VirtualBalance {
  user_address: string;
  virtual_hnobt: string;
  btr_claimable: string;
  staking_active: number;
  staking_tier: number;
  last_yield_time: string | null;
}

export interface StakingTier {
  id: number;
  label: string;
  seconds: number;
  baseApr: number;
  bonus: number;
}

export interface SettlementVoucher {
  voucher: {
    walletAddress: string;
    btrAmount: string;
    hNobtStaked: string;
    nonce: number;
    deadline: number;
  };
  signature: string;
  domain: any;
}

export async function getVaultBalance(address: string): Promise<VirtualBalance> {
  return vaultApi(`/api/vault/balance/${address}`);
}

export async function getVaultTiers(): Promise<StakingTier[]> {
  return vaultApi("/api/vault/tiers");
}

export async function setVaultStaking(address: string, active: boolean, tierId: number = 0) {
  return vaultApi("/api/vault/stake", {
    method: "POST",
    body: JSON.stringify({ address, active, tierId }),
  });
}

export async function applyYield(address: string): Promise<VirtualBalance> {
  return vaultApi("/api/vault/yield/apply", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}

export async function requestSettlement(address: string): Promise<SettlementVoucher> {
  return vaultApi("/api/vault/settle/request", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}
