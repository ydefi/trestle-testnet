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