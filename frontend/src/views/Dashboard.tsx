import { useState, useEffect } from "react";
import { useContracts } from "../hooks/useContracts";
import LoadingSpinner from "../components/LoadingSpinner";
import QRIcon from "../components/QRIcon";
import { formatUnits } from "viem";
import { getTransactions, getAddressInfo, explorerTxUrl, type BlockscoutTx, type BlockscoutAddress } from "../lib/blockscout";

export default function Dashboard() {
  const { address, balance } = useContracts();
  const [txs, setTxs] = useState<BlockscoutTx[] | null>(null);
  const [addrInfo, setAddrInfo] = useState<BlockscoutAddress | null>(null);
  const [bsLoading, setBsLoading] = useState(false);

  useEffect(() => {
    if (!address) { setTxs(null); setAddrInfo(null); return; }
    setBsLoading(true);
    Promise.all([getTransactions(address), getAddressInfo(address)]).then(([txData, addrData]) => {
      setTxs(txData);
      setAddrInfo(addrData);
      setBsLoading(false);
    });
  }, [address]);

  const otherTokens = addrInfo?.token_balances?.filter(t => t.token.symbol !== "MATIC") ?? [];

  function ago(ts: string) {
    const sec = (Date.now() - new Date(ts).getTime()) / 1000;
    if (sec < 60) return `${Math.floor(sec)}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
  }

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

          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Manage your staking, explore the marketplace, and interact with real-world assets.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
            {address ? (
              <p className="text-sm text-gray-500">
                Connected: <span className="font-mono">{address.slice(0, 6)}...</span>{address.slice(-4)}
              </p>
            ) : (
              <w3m-button />
            )}
          </div>
        </div>
      </section>

      {/* Balance Section */}
      <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-emerald-100 transition-all p-8">
        <div className="space-y-4 text-center">
          <p className="text-sm font-medium text-gray-500">Your Balance</p>
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

      {/* Token Balances from Blockscout */}
      {otherTokens.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Token Balances</h3>
          <div className="space-y-2">
            {otherTokens.map((t, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{t.token.name} ({t.token.symbol})</span>
                <span className="font-medium text-gray-900">
                  {formatUnits(BigInt(t.value), Number(t.token.decimals || 18))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions from Blockscout */}
      {address && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Recent Transactions</h3>
            {bsLoading && <span className="text-xs text-gray-400">Loading...</span>}
          </div>
          {txs === null && !bsLoading ? (
            <p className="text-xs text-gray-400 italic">Could not fetch transactions from Blockscout.</p>
          ) : txs && txs.length > 0 ? (
            <div className="space-y-2">
              {txs.map((tx, i) => {
                const isOut = tx.from.hash.toLowerCase() === address?.toLowerCase();
                const icon = tx.status === "ok" ? (isOut ? "↑" : "↓") : "✗";
                const color = tx.status === "ok" ? (isOut ? "text-red-500" : "text-emerald-500") : "text-red-600";
                return (
                  <a key={i} href={explorerTxUrl(tx.hash)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-xs text-gray-600 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition">
                    <span className={`font-mono text-sm ${color}`}>{icon}</span>
                    <span className="font-mono flex-1">{tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}</span>
                    <span className="text-gray-400">{ago(tx.timestamp)}</span>
                    {tx.method && <span className="text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded text-[10px]">{tx.method}</span>}
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No transactions yet.</p>
          )}
        </div>
      )}

      {/* QR for mobile access */}
      <div className="flex justify-center">
        <div className="bg-white rounded-xl shadow border border-gray-100 p-3">
          <QRIcon value="https://testnet.trestle.website" size={90} />
        </div>
      </div>
    </div>
  );
}