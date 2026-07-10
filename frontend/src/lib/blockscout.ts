const BLOCKSCOUT_URL = "https://amoy.blockscout.com/api/v2";
const API_KEY = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_KEY ?? "";

async function api(path: string) {
  try {
    const opts: RequestInit = { headers: { "Content-Type": "application/json" } };
    if (API_KEY) (opts.headers as Record<string, string>)["x-api-key"] = API_KEY;
    const r = await fetch(`${BLOCKSCOUT_URL}${path}`, opts);
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

export async function getTransactions(address: string, page = 0): Promise<BlockscoutTx[] | null> {
  const data = await api(`/addresses/${address}/transactions?page=${page + 1}&limit=10`);
  if (!data || !data.items) return null;
  return data.items;
}

export async function getTokenTransfers(address: string): Promise<BlockscoutTokenTransfer[] | null> {
  const data = await api(`/addresses/${address}/token-transfers?limit=10`);
  if (!data || !data.items) return null;
  return data.items;
}

export async function getAddressInfo(address: string): Promise<BlockscoutAddress | null> {
  const data = await api(`/addresses/${address}`);
  if (!data || !data.hash) return null;
  return data;
}

export function explorerTxUrl(hash: string) {
  return `https://amoy.blockscout.com/tx/${hash}`;
}

export function explorerAddressUrl(address: string) {
  return `https://amoy.blockscout.com/address/${address}`;
}

export function rpcUrl() {
  return "https://amoy.blockscout.com/rpc";
}

export function explorerUrl() {
  return BLOCKSCOUT_URL;
}
