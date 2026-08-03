import { http, fallback } from "viem";
import { polygonAmoy, baseSepolia, arbitrumSepolia } from "viem/chains";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

const AMOY_RPC = [
  "https://polygon-amoy.drpc.org",
  "https://rpc-amoy.polygon.technology/",
  "https://amoy.blockscout.com/rpc",
];

const BASE_SEPOLIA_RPC = [
  "https://sepolia.base.org",
  "https://base-sepolia.drpc.org",
];

const ARB_SEPOLIA_RPC = [
  "https://sepolia-rollup.arbitrum.io/rpc",
  "https://arbitrum-sepolia.drpc.org",
];

const chains = [polygonAmoy, baseSepolia, arbitrumSepolia];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: chains,
  transports: {
    [polygonAmoy.id]: fallback(AMOY_RPC.map(url => http(url, { retryCount: 3, retryDelay: 1000 }))),
    [baseSepolia.id]: fallback(BASE_SEPOLIA_RPC.map(url => http(url, { retryCount: 3, retryDelay: 1000 }))),
    [arbitrumSepolia.id]: fallback(ARB_SEPOLIA_RPC.map(url => http(url, { retryCount: 3, retryDelay: 1000 }))),
  },
});

export const config = wagmiAdapter.wagmiConfig;

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: chains as [typeof polygonAmoy, typeof baseSepolia, typeof arbitrumSepolia],
  chainImages: {
    [polygonAmoy.id]: "/chain/polygon.svg",
    [arbitrumSepolia.id]: "/chain/arbitrum.svg",
  },
  metadata: {
    name: "Trestle Testnet",
    description: "Trestle DeFi Multi-Chain Testnet Hub",
    url: "https://testnet.trestle.website",
    icons: ["https://testnet.trestle.website/favicon.svg"],
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

export { polygonAmoy, baseSepolia, arbitrumSepolia };
