import { http } from "viem";
import { polygonAmoy } from "viem/chains";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http("https://polygon-amoy.drpc.org", { retryCount: 3, retryDelay: 1000 }),
  },
});

export const config = wagmiAdapter.wagmiConfig;

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [polygonAmoy],
  metadata: {
    name: "Trestle Testnet",
    description: "Trestle DeFi Testnet Hub",
    url: "https://testnet.trestle.website",
    icons: ["/favicon.svg"],
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

export { polygonAmoy };
