<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useContracts } from "../hooks/useContracts";
import { useAuth } from "../hooks/useAuth";
import { getUserStats, getGlobalStats, type UserStats, type GlobalStats } from "../lib/reward";
import { getChainStatus } from "../lib/testnet";

export default function Dashboard() {
  const { isConnected, chainId, chainName, address } = useContracts();
  const { displayAddress } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [chains, setChains] = useState<Record<number, { name: string; blockNumber: number; connected: boolean }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getGlobalStats().then(setGlobalStats).catch(() => {}).finally(() => setLoading(false));
    getChainStatus().then(setChains).catch(() => {});
  }, []);

  useEffect(() => {
    if (!displayAddress) return;
    getUserStats(displayAddress).then(setUserStats).catch(() => {});
  }, [displayAddress]);

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🔐</div>
        <p className="text-gray-500">Connect wallet to view dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
        <p className="text-xs opacity-80">Your Rewards</p>
        {userStats ? (
          <>
            <p className="text-lg font-bold mt-1">{userStats.total_earned} hNOBT</p>
            <div className="flex gap-4 mt-2 text-xs opacity-80">
              <span>Streak: {userStats.streak}</span>
              <span>Tasks: {userStats.tasks_completed}</span>
            </div>
          </>
        ) : (
          <p className="text-lg font-bold mt-1">{loading ? "Loading..." : "0 hNOBT"}</p>
        )}
        {address && <p className="text-[10px] opacity-60 mt-2">{address.slice(0, 6)}...{address.slice(-4)}</p>}
      </div>

      {globalStats && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-[10px] text-gray-500">Users</p>
            <p className="text-sm font-bold">{globalStats.total_users}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-[10px] text-gray-500">Distributed</p>
            <p className="text-sm font-bold">{Number(globalStats.total_rewards_distributed).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-[10px] text-gray-500">Tasks</p>
            <p className="text-sm font-bold">{globalStats.active_tasks}</p>
          </div>
        </div>
      )}

      {Object.keys(chains).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-sm mb-2">Chains</h3>
          <div className="space-y-2">
            {Object.entries(chains).map(([id, info]) => (
              <div key={id} className="flex items-center justify-between text-xs">
                <span>{info.name}</span>
                <span className={info.connected ? "text-emerald-600" : "text-red-500"}>
                  {info.connected ? "Connected" : "Offline"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <a href="/tasks" className="block p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <span className="text-lg">📋</span>
          <h3 className="font-semibold text-sm mt-1">Tasks</h3>
          <p className="text-[10px] text-gray-500">Earn hNOBT points</p>
        </a>
        <a href="/marketplace" className="block p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <span className="text-lg">🛒</span>
          <h3 className="font-semibold text-sm mt-1">Marketplace</h3>
          <p className="text-[10px] text-gray-500">Buy & sell on testnet</p>
        </a>
        <a href="/bounty" className="block p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <span className="text-lg">🎯</span>
          <h3 className="font-semibold text-sm mt-1">Bug Bounty</h3>
          <p className="text-[10px] text-gray-500">Report & earn rewards</p>
        </a>
        <a href="/stake" className="block p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <span className="text-lg">📈</span>
          <h3 className="font-semibold text-sm mt-1">Stake</h3>
          <p className="text-[10px] text-gray-500">Lock hNOBT & earn</p>
        </a>
      </div>
    </div>
  );
}
=======
import { useContracts } from "../hooks/useContracts";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTransactions } from "../hooks/useTransactions";

export default function Dashboard() {
  const { address, balance } = useContracts();
  const { transactions, loading, error } = useTransactions();

  // Debug: log the values to see what we're getting
  console.log("Dashboard received:", { address, balance });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-100" />
        <div className="absolute top-16 right-0 w-60 h-60 bg-emerald-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm rounded-full mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live on Polygon Amoy Testnet
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 max-w-3xl mx-auto leading-tight">
            Your Trestle Dashboard
          </h1>

          {!address && (
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Connect wallet to explore the full marketplace and interact with all testnet features.
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
            {address ? (
              <>
                <p className="text-sm text-gray-500">
                  Connected: <span className="font-mono">{address.slice(0, 6)}...</span>{address.slice(-4)}
                </p>
                <button
                  onClick={() => alert("Disconnect functionality would go here")}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => alert("Connect wallet functionality would go here")}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Balance Section */}
      <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-emerald-100 transition-all p-8">
        <div className="space-y-4 text-center">
          <p className="text-sm font-medium text-gray-500">Your Amoy Balance</p>
          {balance ? (
            <p className="text-3xl font-bold text-gray-900">{parseFloat(balance).toFixed(4)} MATIC</p>
          ) : (
            <LoadingSpinner label="Fetching balance..." />
          )}
          {address && (
            <p className="text-xs text-gray-400 mt-1">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>
      </div>

      {/* QR for mobile access */}
      <div className="text-center">
        <div className="bg-white rounded-xl shadow border border-gray-100 p-4 inline-block">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent("https://testnet.trestle.website")}&color=059669&bgcolor=ffffff&ecc=M`}
            alt="QR Code"
            className="rounded mx-auto"
          />
          <p className="text-[10px] text-gray-400 mt-1">Scan to open on mobile</p>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        {loading ? (
          <div className="text-center py-6">
            <LoadingSpinner label="Loading transactions..." />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-sm text-red-700">Error loading transactions: {error}</p>
          </div>
        ) : address && transactions.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">No transactions found for this address</p>
          </div>
        ) : address && (
          <div className="space-y-4">
            {transactions.map((tx: any, index: number) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">Tx #{index + 1}</span>
                  <span className="text-xs text-gray-500">{new Date(tx.timeStamp * 1000).toLocaleString()}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-800">
                      {tx.from.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-gray-700">
                      {tx.from} → {tx.to}
                    </p>
                    <p className="text-xs text-gray-500">
                      Value: {parseFloat(tx.value) / 1e18} MATIC • Gas: {tx.gasUsed}
                    </p>
                    <p className="text-xs text-gray-500">
                      TxHash: {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 6)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
>>>>>>> 7c29aad (initial commit)
