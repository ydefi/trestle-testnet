<<<<<<< HEAD
import { http, fallback } from "viem";
import { polygon, polygonAmoy } from "viem/chains";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";

export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";

const polygonTransports = [
  http("https://polygon-rpc.com", { retryCount: 2, retryDelay: 500 }),
  http("https://polygon.llamarpc.com", { retryCount: 2, retryDelay: 500 }),
  http("https://rpc.ankr.com/polygon", { retryCount: 2, retryDelay: 500 }),
  http("https://polygon.drpc.org", { retryCount: 2, retryDelay: 500 }),
].filter(Boolean) as ReturnType<typeof http>[];

const amoyTransports = [
  http("https://rpc-amoy.polygon.technology", { retryCount: 2, retryDelay: 500 }),
  http("https://polygon-amoy.g.alchemy.com/v2/demo", { retryCount: 2, retryDelay: 500 }),
].filter(Boolean) as ReturnType<typeof http>[];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [polygon, polygonAmoy],
  transports: {
    [polygon.id]: fallback(polygonTransports, { rank: true }),
    [polygonAmoy.id]: fallback(amoyTransports, { rank: true }),
  },
  ssr: true,
});

export const config = wagmiAdapter.wagmiConfig;

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [polygon, polygonAmoy],
  metadata: {
    name: "Trestle DeFi",
    description: "Trestle Telegram Mini App",
    url: import.meta.env.VITE_SITE_URL || "https://trestle.website",
    icons: [`${import.meta.env.VITE_SITE_URL || "https://trestle.website"}/favicon.svg`],
  },
  features: {
    email: true,
    socials: ["google", "github", "discord"],
  },
  themeMode: "light",
  themeVariables: {
    "--w3m-color-mix": "#059669",
    "--w3m-color-mix-strength": 20,
  },
});

export { polygon, polygonAmoy };
=======
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
>>>>>>> 7c29aad (initial commit)
