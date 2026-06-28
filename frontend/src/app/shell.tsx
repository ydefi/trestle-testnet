"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSwitchChain } from "wagmi";
import { useContracts } from "@/hooks/useContracts";
import { polygonAmoy } from "@/config/web3";
import WalletStatus from "@/components/WalletStatus";
import AstraChat from "@/components/AstraChat";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";

const NAV_TABS = [
  { href: "/", label: "Dashboard", icon: "\uD83D\uDCCA" },
  { href: "/marketplace", label: "Market", icon: "\uD83C\uDFEA" },
  { href: "/rwa", label: "RWA", icon: "\uD83C\uDFDB\uFE0F" },
  { href: "/profile", label: "Profile", icon: "\uD83D\uDC64" },
  { href: "/faucet", label: "Faucet", icon: "\uD83D\uDCA7" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCorrectChain, chainName } = useContracts();
  const { switchChainAsync } = useSwitchChain();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-trestle-50 via-white to-trestle-100">
      {/* Top navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Icon name="logo" size={28} />
            <span className="text-2xl font-bold text-trestle-600">Trestle</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_TABS.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  pathname === href
                    ? "text-trestle-700 bg-trestle-100 font-semibold"
                    : "text-gray-600 hover:text-trestle-600 hover:bg-trestle-50"
                }`}
              >
                {icon && <span>{icon}</span>} {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <WalletStatus />
            <a
              href="https://t.me/TrestleDeFi"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-trestle-600 hover:bg-trestle-50 rounded-lg transition-colors"
            >
              <Icon name="telegram" size={16} />
              <span className="hidden lg:inline">Telegram</span>
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-2 space-y-1">
              {NAV_TABS.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === href
                      ? "text-trestle-700 bg-trestle-100 font-semibold"
                      : "text-gray-600 hover:text-trestle-600 hover:bg-trestle-50"
                  }`}
                >
                  {icon} {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* Network banner */}
      {!isCorrectChain && (
        <div className="p-2 bg-red-100/50 backdrop-blur-sm text-red-700 text-sm text-center flex items-center justify-center gap-3">
          <span>Wrong network — connect to Polygon Amoy Testnet</span>
          <button
            onClick={() => switchChainAsync({ chainId: polygonAmoy.id }).catch(() => {})}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Switch to Amoy
          </button>
        </div>
      )}
      {isCorrectChain && (
        <div className="py-1 text-xs text-gray-400 text-center bg-white/50">{chainName}</div>
      )}

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>

      <AstraChat />
      <Footer />
    </div>
  );
}
