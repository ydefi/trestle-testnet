<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useContracts } from "../hooks/useContracts";
import { getVaultBalance, applyYield, requestSettlement, type VirtualBalance } from "../lib/vault";

export default function Withdraw() {
  const { address, isConnected } = useContracts();
  const [vault, setVault] = useState<VirtualBalance | null>(null);
  const [busy, setBusy] = useState(false);
  const [voucher, setVoucher] = useState<any>(null);

  useEffect(() => {
    if (!address) return;
    getVaultBalance(address).then(setVault).catch(() => {});
  }, [address]);

  const refreshBalance = () => {
    if (!address) return;
    getVaultBalance(address).then(setVault).catch(() => {});
  };

  const handleApplyYield = async () => {
    if (!address || busy) return;
    setBusy(true);
    try {
      await applyYield(address);
      refreshBalance();
    } catch (e: any) {
      alert(e.message);
    }
    setBusy(false);
  };

  const handleSettle = async () => {
    if (!address || busy) return;
    setBusy(true);
    setVoucher(null);
    try {
      await applyYield(address);
      const result = await requestSettlement(address);
      setVoucher(result);
      refreshBalance();
    } catch (e: any) {
      alert(e.message);
    }
    setBusy(false);
  };
=======
import { useContracts } from "../hooks/useContracts";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Withdraw() {
  const { address, isConnected } = useContracts();
>>>>>>> 7c29aad (initial commit)

  if (!isConnected) {
    return (
      <section className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl mb-2">💰</div>
          <p className="text-lg text-gray-500 mb-4">Connect wallet to withdraw</p>
<<<<<<< HEAD
=======
          <div className="bg-gray-50 rounded-xl p-4 max-w-sm mx-auto">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent("https://testnet.trestle.website/withdraw")}&color=059669&bgcolor=ffffff&ecc=M`}
              alt="QR"
              className="rounded-lg mx-auto mb-2"
            />
            <p className="text-[10px] text-gray-400 font-medium">Scan with wallet to connect</p>
          </div>
>>>>>>> 7c29aad (initial commit)
        </div>
      </section>
    );
  }

<<<<<<< HEAD
  const hnobtDisplay = vault ? (BigInt(vault.virtual_hnobt) / 10n ** 18n).toString() : "0";
  const btrDisplay = vault ? (BigInt(vault.btr_claimable) / 10n ** 9n).toString() : "0";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Wallet</h2>
      <p className="text-center text-sm text-gray-500">Settle your virtual balances on-chain.</p>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Virtual hNOBT</span>
          <span className="font-semibold">{hnobtDisplay}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">BTR claimable</span>
          <span className="font-semibold">{btrDisplay}</span>
        </div>

        <div className="border-t pt-4 space-y-3">
          <button onClick={handleApplyYield} disabled={busy}
            className="w-full py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition">
            {busy ? "Processing..." : "Refresh Yield"}
          </button>
          <button onClick={handleSettle} disabled={busy || (!vault?.btr_claimable && !vault?.virtual_hnobt)}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition">
            {busy ? "Generating Voucher..." : "Settle On-Chain"}
          </button>
        </div>
      </div>

      {voucher && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-xs text-green-800 space-y-2">
          <p className="font-semibold">✅ Voucher Generated!</p>
          <p>BTR: {(BigInt(voucher.voucher.btrAmount) / 10n ** 9n).toString()}</p>
          <p>hNOBT: {(BigInt(voucher.voucher.hNobtStaked) / 10n ** 18n).toString()}</p>
          <p className="text-[9px] text-gray-500 break-all">Signature: {voucher.signature.slice(0, 40)}...</p>
          <p className="text-[9px] text-gray-500">Submit to RewardDistributor contract to claim.</p>
        </div>
      )}
    </div>
  );
}
=======
  return (
    <div className="space-y-6">
      <section className="pt-8">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">Wallet</h2>
          <p className="text-center text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Manage your withdrawals from the Trestle protocol.
          </p>
        </div>
      </section>

      <section className="pt-4">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-emerald-100 transition-all p-8 space-y-6">
            <div className="flex flex-col gap-4">
              <button className="w-full py-4 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-50" disabled>
                Withdraw MATIC
              </button>
              <button className="w-full py-4 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-200 hover:shadow-blue-300 disabled:opacity-50" disabled>
                Withdraw Tokens
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center pt-2">Withdrawal functionality coming soon</p>
          </div>
        </div>
      </section>
    </div>
  );
}
>>>>>>> 7c29aad (initial commit)
