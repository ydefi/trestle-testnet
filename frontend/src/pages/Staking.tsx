import { useState, useEffect } from "react";
import { useContracts } from "../hooks/useContracts";
import { getVaultBalance, setVaultStaking, getVaultTiers, applyYield, type VirtualBalance, type StakingTier } from "../lib/vault";

export default function Staking() {
  const { address, isConnected } = useContracts();
  const [vault, setVault] = useState<VirtualBalance | null>(null);
  const [tiers, setTiers] = useState<StakingTier[]>([]);
  const [tierId, setTierId] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!address) return;
    Promise.all([
      getVaultBalance(address),
      getVaultTiers(),
    ]).then(([v, t]) => {
      setVault(v);
      setTiers(t);
    }).catch(() => {});
  }, [address]);

  const refreshBalance = () => {
    if (!address) return;
    getVaultBalance(address).then(setVault).catch(() => {});
  };

  const handleToggleStaking = async () => {
    if (!address || busy) return;
    setBusy(true);
    try {
      const active = !vault?.staking_active;
      await setVaultStaking(address, active, active ? tierId : 0);
      if (!active) await applyYield(address);
      refreshBalance();
    } catch (e: any) {
      alert(e.message);
    }
    setBusy(false);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🔐</div>
        <p className="text-gray-500">Connect wallet to manage staking</p>
      </div>
    );
  }

  const hnobtDisplay = vault ? (BigInt(vault.virtual_hnobt) / 10n ** 18n).toString() : "0";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Stake hNOBT</h2>
      <p className="text-xs text-gray-500">Lock virtual hNOBT to earn BTR yield. No gas fees until settlement.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Virtual hNOBT balance</span>
          <span className="font-medium">{hnobtDisplay} hNOBT</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className={`font-medium ${vault?.staking_active ? "text-emerald-600" : "text-gray-400"}`}>
            {vault?.staking_active ? `Active (${tiers[vault.staking_tier]?.label || ""})` : "Inactive"}
          </span>
        </div>
      </div>

      {!vault?.staking_active && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <label className="text-sm font-medium text-gray-700">Lock Duration</label>
          <div className="flex gap-2">
            {tiers.map((t) => (
              <button key={t.id} onClick={() => setTierId(t.id)}
                className={`flex-1 py-2 rounded-lg text-xs text-center ${tierId === t.id ? "bg-emerald-500 text-white" : "bg-gray-50 text-gray-600 border border-gray-200"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400">APR: {tiers.map((t) => `${t.label} ${(t.baseApr * t.bonus * 100).toFixed(1)}%`).join(" / ")}</p>
        </div>
      )}

      <button onClick={handleToggleStaking} disabled={busy}
        className={`w-full py-3 rounded-lg text-white font-medium disabled:opacity-50 ${vault?.staking_active ? "bg-red-500" : "bg-emerald-500"}`}>
        {busy ? "Processing..." : vault?.staking_active ? "Stop Staking" : "Start Staking"}
      </button>
    </div>
  );
}
