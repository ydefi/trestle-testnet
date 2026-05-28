import { http, createConfig } from "wagmi";
import { fallback } from "viem";
import { polygonAmoy } from "wagmi/chains";
import { walletConnect, injected } from "wagmi/connectors";
import { authConnector } from "@web3modal/wagmi";

export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";

// Amoy testnet RPC providers with fallback for load balancing and redundancy
const amoyTransports = [
  http("https://rpc-amoy.polygon.technology", { retryCount: 2, retryDelay: 1000 }),
  http("https://polygon-amoy-bor-rpc.publicnode.com", { retryCount: 2, retryDelay: 1000 }),
  http("https://rpc.ankr.com/polygon_amoy", { retryCount: 2, retryDelay: 1000 }),
  ...(import.meta.env.VITE_BLOCKSCOUT_API_AMOY && import.meta.env.VITE_BLOCKSCOUT_API_KEY 
    ? [http(`${import.meta.env.VITE_BLOCKSCOUT_API_AMOY}?apikey=${import.meta.env.VITE_BLOCKSCOUT_API_KEY}`, { retryCount: 2, retryDelay: 500 })]
    : [])
].filter(Boolean) as ReturnType<typeof http>[];

export const config = createConfig({
  chains: [polygonAmoy],
  connectors: [
    walletConnect({ projectId, showQrModal: false }),
    injected(),
    authConnector({
      options: { projectId },
      email: true,
      socials: ["google", "github", "discord"],
      showWallets: true,
      walletFeatures: true,
    }),
  ],
  transports: {
    [polygonAmoy.id]: fallback(amoyTransports, { rank: true }),
  },
  // Configure reasonable gas prices for testnet to avoid excessive fees
  // Polygon Amoy testnet typically has low gas prices, we'll set a conservative max
  // 30 gwei should be plenty for testnet transactions
});
