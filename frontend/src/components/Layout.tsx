import { Outlet, NavLink } from "react-router-dom";
import { useSwitchChain } from "wagmi";
import { useContracts } from "../hooks/useContracts";
import { polygonAmoy } from "../config/web3";
import WalletStatus from "./WalletStatus";
import AstraChat from "./AstraChat";
import Footer from "./Footer";
import Icon from "./Icon";

const NAV_TABS = [
  { to: "https://trestle.website", label: "Home", icon: "\uD83C\uDFE0", external: true },
  { to: "/", label: "Dashboard", icon: "\uD83D\uDCCA" },
  { to: "/marketplace", label: "Market", icon: "\uD83C\uDFEA" },
  { to: "/rwa", label: "RWA", icon: "\uD83C\uDFDB\uFE0F" },
  { to: "/faucet", label: "Faucet", icon: "\uD83D\uDCA7" },
];

export default function Layout() {
  const { isCorrectChain, chainName } = useContracts();
  const { switchChainAsync } = useSwitchChain();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-emerald-100 pt-16">
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <Icon name="logo" size={22} />
            <h1 className="text-xl font-bold text-emerald-600">Trestle</h1>
          </div>
          <WalletStatus />
        </div>
      </div>

      <div className="sticky top-16 z-40 bg-white/70 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4 py-1.5">
          <div className="flex gap-1 overflow-x-auto">
            {NAV_TABS.map(({ to, label, icon, external }) =>
              external ? (
                <a
                  key={to}
                  href={to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  {icon && <span>{icon}</span>} {label}
                </a>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className="whitespace-nowrap px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors [&.active]:text-emerald-700 [&.active]:bg-emerald-100 [&.active]:font-semibold flex items-center gap-1"
                >
                  {icon && <span>{icon}</span>} {label}
                </NavLink>
              )
            )}
          </div>
        </div>
      </div>

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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      <AstraChat />
      <Footer />
    </div>
  );
}
