import type { Metadata } from "next";
import Providers from "./providers";
import ClientShell from "./client-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://testnet.trestle.website"),
  title: "Trestle Testnet",
  description: "Trestle DeFi Testnet Hub — Marketplace, RWA, Faucet",
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
  twitter: {
    card: "summary_large_image",
    site: "@trestleDeFi",
    creator: "@trestleDeFi",
    title: "Trestle DeFi | Testnet Hub",
    description: "Testnet marketplace, RWA tokenization, and faucet for Trestle DeFi on Polygon Amoy.",
    images: ["/assets/twitter_card.png"],
  },
  openGraph: {
    title: "Trestle DeFi | Testnet Hub",
    description: "Testnet marketplace, RWA tokenization, and faucet for Trestle DeFi on Polygon Amoy.",
    type: "website",
    url: "https://testnet.trestle.website",
    images: ["/assets/twitter_card.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ClientShell>{children}</ClientShell>
        </Providers>
      </body>
    </html>
  );
}
