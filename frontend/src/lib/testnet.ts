import { TESTNET_API } from "../config/contracts";

export interface ContractInfo {
  address: string;
  name: string;
  chainId: number;
  verified: boolean;
}

export interface Listing {
  id: number;
  seller: string;
  price: string;
  metadataURI: string;
  category: string;
  pricing: number;
  status: number;
}

export interface Project {
  id: number;
  client: string;
  freelancer: string;
  budget: string;
  status: number;
  milestones: number;
}

async function api<T = any>(path: string, chainId?: number): Promise<T> {
  const url = new URL(`${TESTNET_API}${path}`);
  if (chainId) url.searchParams.set("chainId", chainId.toString());
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`API error: ${r.status}`);
  return r.json();
}

export async function getContracts(chainId: number): Promise<Record<string, ContractInfo>> {
  return api("/api/contracts", chainId);
}

export async function getListings(chainId: number): Promise<Listing[]> {
  return api("/api/marketplace/listings", chainId);
}

export async function getProjects(chainId: number): Promise<Project[]> {
  return api("/api/freelancer/projects", chainId);
}

export async function getRWAInfo(chainId: number): Promise<any> {
  return api("/api/rwa/info", chainId);
}

export async function getChainStatus(): Promise<Record<number, { name: string; blockNumber: number; connected: boolean }>> {
  return api("/api/chains/status");
}

export async function getFaucetTokens(chainId: number): Promise<any[]> {
  return api("/api/faucet/tokens", chainId);
}
