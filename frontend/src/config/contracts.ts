<<<<<<< HEAD
export const REWARD_API = import.meta.env.VITE_REWARD_API_URL || "https://reward-api.trestle.website";
export const TESTNET_API = import.meta.env.VITE_TESTNET_API_URL || "https://vault.trestle.website";
export const VAULT_API = import.meta.env.VITE_VAULT_API_URL || "https://vault.trestle.website";
export const AI_API = import.meta.env.VITE_AI_API_URL || "https://ai.trestle.website";

// Legacy aliases
export const API_BASE = REWARD_API;
export const AI_API_BASE = AI_API;
export const VAULT_API_BASE = VAULT_API;

export const LINKS = {
  mainSite: import.meta.env.VITE_MAIN_SITE_URL || "https://trestle.website",
  testnet: import.meta.env.VITE_TESTNET_URL || "https://testnet.trestle.website",
  docs: "https://docs.trestle.website",
  telegram: "https://t.me/TrestleDeFi",
  discord: "https://discord.gg/4dCCvnJYGT",
  github: "https://github.com/Trestle-DeFi",
} as const;

export const CHAIN_CONFIG = {
  polygon: {
    id: 137,
    name: "Polygon Mainnet",
    shortName: "Polygon",
    rpc: "https://polygon-rpc.com/",
    explorer: "https://polygonscan.com",
    currency: { name: "POL", symbol: "POL", decimals: 18 },
  },
  amoy: {
    id: 80002,
    name: "Polygon Amoy",
    shortName: "Amoy",
    rpc: "https://rpc-amoy.polygon.technology/",
    explorer: "https://www.oklink.com/amoy",
    currency: { name: "POL", symbol: "POL", decimals: 18 },
  },
  baseSepolia: {
    id: 84532,
    name: "Base Sepolia",
    shortName: "Base",
    rpc: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    currency: { name: "ETH", symbol: "ETH", decimals: 18 },
  },
  arbitrumSepolia: {
    id: 421614,
    name: "Arbitrum Sepolia",
    shortName: "Arbitrum",
    rpc: "https://sepolia-rollup.arbitrum.io/rpc",
    explorer: "https://sepolia.arbiscan.io",
    currency: { name: "ETH", symbol: "ETH", decimals: 18 },
  },
} as const;

export type ChainKey = keyof typeof CHAIN_CONFIG;
export const SUPPORTED_CHAIN_IDS = Object.values(CHAIN_CONFIG).map(c => c.id) as readonly number[];
export const DEFAULT_CHAIN = CHAIN_CONFIG.amoy.id;

export const BROILER_INFO = {
  supply: "1,000,000,000,000,000",
  supplyDisplay: "1 Quadrillion",
  taxBps: 500,
  taxPercent: 5,
  recommendedSlippage: "6-7%",
  lpPair: "BRT/WMATIC",
} as const;

export const STAKING_DURATIONS = [
  { id: 0, label: "3 Months", seconds: 90 * 86400, multiplier: "1x" },
  { id: 1, label: "6 Months", seconds: 180 * 86400, multiplier: "1.5x" },
  { id: 2, label: "12 Months", seconds: 365 * 86400, multiplier: "2x" },
] as const;
=======
export const CONTRACT_ADDRESSES = {
  amoy: {
    tier1Staking: (import.meta.env.VITE_TIER1_STAKING as string) || "0x...",
    tier2Staking: (import.meta.env.VITE_TIER2_STAKING as string) || "0x...",
    tier3Vault: (import.meta.env.VITE_TIER3_VAULT as string) || "0x...",
    marketplaceCore: (import.meta.env.VITE_MARKETPLACE_CORE as string) || "0x...",
    digitalGoods: (import.meta.env.VITE_DIGITAL_GOODS as string) || "0x...",
    freelancerEscrow: (import.meta.env.VITE_FREELANCER_ESCROW as string) || "0x...",
    aiDisputeResolver: (import.meta.env.VITE_AI_DISPUTE as string) || "0x...",
    governanceToken: (import.meta.env.VITE_GOVERNANCE_TOKEN as string) || "0x...",
    feeDistributor: (import.meta.env.VITE_FEE_DISTRIBUTOR as string) || "0x...",
    digitalRWA: (import.meta.env.VITE_DIGITAL_RWA as string) || "0x...",
  },
};

export const CHAIN_CONFIG = {
  amoy: {
    id: 80002,
    name: "Polygon Amoy",
    rpc: "https://rpc-amoy.polygon.technology",
    rpcPool: [
      "https://rpc-amoy.polygon.technology",
      "https://polygon-amoy-bor-rpc.publicnode.com",
      "https://rpc.ankr.com/polygon_amoy",
      ...(import.meta.env.VITE_BLOCKSCOUT_API_AMOY && import.meta.env.VITE_BLOCKSCOUT_API_KEY 
        ? [`${import.meta.env.VITE_BLOCKSCOUT_API_AMOY}?apikey=${import.meta.env.VITE_BLOCKSCOUT_API_KEY}`]
        : [])
    ],
    explorer: "https://amoy.polygonscan.com/",
    currency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  },
};
>>>>>>> 7c29aad (initial commit)
