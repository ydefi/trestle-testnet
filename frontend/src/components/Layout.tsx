import { Outlet, NavLink } from "react-router-dom";
import { useContracts } from "../hooks/useContracts";
import WalletStatus from "./WalletStatus";
import QRCode from "./QRCode";

const navLinks = [
  { to: "/", label: "Dashboard", icon: "🏠" },
  { to: "/marketplace", label: "Market", icon: "🏪" },
  { to: "/rwa", label: "RWA", icon: "🏢" },
  { to: "/withdraw", label: "Wallet", icon: "💰" },
];

export default function Layout() {
  const { isCorrectChain, chainName } = useContracts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-emerald-600">Trestle DeFi</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  Testnet
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WalletStatus />
              <a
                href="https://t.me/TrestleDeFi"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 transition bg-gray-50 border border-gray-200 px-2 py-1 rounded"
              >
                Telegram
              </a>
            </div>
          </div>
          <nav className="flex gap-6 mt-3">
            {navLinks.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium flex items-center gap-1.5 ${isActive ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-500 hover:text-gray-700"}`
                }
              >
                {icon} {label}
              </NavLink>
            ))}
          </nav>
        </div>
        {!isCorrectChain && (
          <div className="p-2 bg-red-100/50 backdrop-blur-sm text-red-700 text-sm text-center">
            Switch to Polygon Amoy Testnet
          </div>
        )}
        {isCorrectChain && (
          <div className="pb-1 text-xs text-gray-400 text-center">{chainName}</div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">Trestle DeFi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://trestle.website" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  Main Site
                </a>
              </li>
              <li>
                <a href="https://github.com/Trestle-DeFi/wiki" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  Docs
                </a>
              </li>
              <li>
                <a href="https://reward.trestle.website" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  Reward Hub
                </a>
              </li>
              <li>
                <a href="https://t.me/trestle_bot/app" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  Mini App
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">App</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink to="/" className="hover:text-emerald-400 transition-colors">
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/marketplace" className="hover:text-emerald-400 transition-colors">
                  Marketplace
                </NavLink>
              </li>
              <li>
                <NavLink to="/rwa" className="hover:text-emerald-400 transition-colors">
                  RWA
                </NavLink>
              </li>
              <li>
                <NavLink to="/withdraw" className="hover:text-emerald-400 transition-colors">
                  Wallet
                </NavLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://discord.gg/4dCCvnJYGT" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://t.me/TrestleDeFi" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  Telegram
                </a>
              </li>
              <li>
                <a href="https://github.com/Trestle-DeFi" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="mailto:contact@trestle.website" className="hover:text-emerald-400 transition-colors">
                  Email
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Network</h3>
            <p className="text-xs text-gray-500">
              Live on Polygon Amoy Testnet
              <br />
              Chain ID: 80002
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-4 border-t border-gray-800">
          <p className="text-[10px] text-gray-500 text-center">
            © {new Date().getFullYear()} Trestle DeFi. Testnet use only.
          </p>
        </div>
      </footer>
    </div>
  );
}