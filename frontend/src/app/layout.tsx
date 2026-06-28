import type { Metadata } from "next";
import Providers from "./providers";
import ClientShell from "./client-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trestle Testnet",
  description: "Trestle DeFi Testnet Hub — Marketplace, RWA, Faucet",
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
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
