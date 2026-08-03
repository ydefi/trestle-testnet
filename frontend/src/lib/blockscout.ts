import { CHAIN_CONFIG } from "../config/contracts";

const API_KEY = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_KEY ?? "";

export function getBlockscoutUrl(chainId: number): string {
  for (const config of Object.values(CHAIN_CONFIG)) {
    if (config.id === chainId) return config.blockscout;
  }
  return "https://amoy.blockscout.com";
}

async function api(chainId: number, path: string) {
  const baseUrl = getBlockscoutUrl(chainId);
  try {
    const opts: RequestInit = { headers: { "Content-Type": "application/json" } };
    if (API_KEY) (opts.headers as Record<string, string>)["x-api-key"] = API_KEY;
    const r = await fetch(`${baseUrl}/api/v2${path}`, opts);
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

export interface BlockscoutTx {
  hash: string;
  timestamp: string;
  from: { hash: string };
  to: { hash: string } | null;
  value: string;
  fee: { value: string };
  status: "ok" | "error";
  method: string | null;
}

export interface BlockscoutTokenTransfer {
  tx_hash: string;
  timestamp: string;
  from: { hash: string };
  to: { hash: string };
  token: { name: string; symbol: string; decimals: string };
  total: { value: string };
}

export interface BlockscoutAddress {
  hash: string;
  coin_balance: string | null;
  token_balances: { token: { name: string; symbol: string; decimals: string }; value: string }[] | null;
}

export async function getTransactions(address: string, page = 0, chainId = 80002): Promise<BlockscoutTx[] | null> {
  const data = await api(chainId, `/addresses/${address}/transactions?page=${page + 1}&limit=10`);
  if (!data || !data.items) return null;
  return data.items;
}

export async function getTokenTransfers(address: string, chainId = 80002): Promise<BlockscoutTokenTransfer[] | null> {
  const data = await api(chainId, `/addresses/${address}/token-transfers?limit=10`);
  if (!data || !data.items) return null;
  return data.items;
}

export async function getAddressInfo(address: string, chainId = 80002): Promise<BlockscoutAddress | null> {
  const data = await api(chainId, `/addresses/${address}`);
  if (!data || !data.hash) return null;
  return data;
}

export function explorerTxUrl(chainId: number, hash: string) {
  return `${getBlockscoutUrl(chainId)}/tx/${hash}`;
}

export function explorerAddressUrl(chainId: number, address: string) {
  return `${getBlockscoutUrl(chainId)}/address/${address}`;
}

export function rpcUrl(chainId: number) {
  for (const config of Object.values(CHAIN_CONFIG)) {
    if (config.id === chainId) return config.rpc;
  }
  return "https://rpc-amoy.polygon.technology/";
}

export function explorerUrl(chainId?: number) {
  if (chainId) return getBlockscoutUrl(chainId);
  return `${getBlockscoutUrl(80002)}/api/v2`;
}
