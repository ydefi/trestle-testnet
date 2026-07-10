export const CHAIN_CONFIG = {
  amoy: {
    id: 80002,
    name: "Polygon Amoy",
    rpc: "https://rpc-amoy.polygon.technology/",
    explorer: "https://www.oklink.com/amoy",
    currency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  },
  polygon: {
    id: 137,
    name: "Polygon Mainnet",
    rpc: "https://polygon-rpc.com/",
    explorer: "https://polygonscan.com/",
    currency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  },
} as const;
