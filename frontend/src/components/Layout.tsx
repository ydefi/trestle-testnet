import { Outlet, NavLink } from "react-router-dom";
import { useContracts } from "../hooks/useContracts";
<<<<<<< HEAD
import { LINKS } from "../config/contracts";
import WalletStatus from "./WalletStatus";
import { Icon } from "./Icon";
import AstraChat from "./AstraChat";

const EXTERNAL_LINKS = [
  { href: LINKS.mainSite, label: "Landing Page" },
  { href: LINKS.testnet, label: "Testnet Hub" },
];

const DASHBOARD_TABS = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/marketplace", label: "Marketplace", icon: "marketplace" },
  { to: "/stake", label: "Stake", icon: "stake" },
  { to: "/tasks", label: "Tasks", icon: "tasks" },
  { to: "/bounty", label: "Bounty", icon: "bounty" },
  { to: "/verify", label: "Verify", icon: "verify" },
  { to: "/withdraw", label: "Wallet", icon: "wallet" },
=======
import WalletStatus from "./WalletStatus";
import QRCode from "./QRCode";

const navLinks = [
  { to: "/", label: "Dashboard", icon: "🏠" },
  { to: "/marketplace", label: "Market", icon: "🏪" },
  { to: "/rwa", label: "RWA", icon: "🏢" },
  { to: "/withdraw", label: "Wallet", icon: "💰" },
>>>>>>> 7c29aad (initial commit)
];

export default function Layout() {
  const { isCorrectChain, chainName } = useContracts();

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <h1 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
              <Icon name="logo" size={24} />
              Trestle
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1">
              {EXTERNAL_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-emerald-600 transition px-2 py-1 rounded border border-gray-200 hover:border-emerald-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <WalletStatus />
            <a
              href={LINKS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-emerald-600 transition"
              title="Telegram"
            >
              <Icon name="telegram" size={18} />
            </a>
          </div>
        </div>
        {!isCorrectChain && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 text-sm rounded text-center">
            Switch to a supported testnet
          </div>
        )}
        {isCorrectChain && (
          <div className="mt-1 text-xs text-gray-400 text-center">{chainName}</div>
        )}
      </header>

      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-gray-100 overflow-x-auto">
        <div className="max-w-lg mx-auto flex gap-1 px-2 py-1.5">
          {DASHBOARD_TABS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className="whitespace-nowrap px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors [&.active]:text-emerald-700 [&.active]:bg-emerald-100 [&.active]:font-semibold flex items-center gap-1"
            >
              <Icon name={icon} size={14} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-4 pb-8">
        <Outlet />
      </main>
      <AstraChat />
    </div>
  );
}
=======
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
>>>>>>> 7c29aad (initial commit)
