import { useState, useEffect } from "react";
import { useContracts } from "../hooks/useContracts";
import { api } from "../lib/api";

interface PassportStatus {
  score: number;
  threshold: number;
  verified: boolean;
  last_check?: string;
}

interface Eligibility {
  eligible: boolean;
  passport: PassportStatus | null;
  linkedAccounts: string[];
  linkedCount: number;
}

export default function Verify() {
  const { address, isConnected } = useContracts();
  const [passport, setPassport] = useState<PassportStatus | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [fetching, setFetching] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!address) return;
    api<PassportStatus>(`/api/passport/status/${address}`).then(setPassport).catch(() => {});
    api<Eligibility>(`/api/eligibility/${address}`).then(setEligibility).catch(() => {});
  }, [address]);

  const handleFetchPassport = async () => {
    if (!address || fetching) return;
    setFetching(true);
    try {
      const result = await api<{ score: number; fetched: boolean; rateLimited?: boolean }>(`/api/passport/fetch/${address}`);
      if (result.rateLimited) {
        alert("Gitcoin API rate-limited. Please wait a few seconds and try again.");
        return;
      }
      setPassport(prev => prev ? { ...prev, score: result.score, verified: result.fetched } : { score: result.score, threshold: 10, verified: result.fetched });
    } catch (e: any) {
      alert(e.message);
    }
    setFetching(false);
  };

  const handleBiometricVerify = async () => {
    if (!address || busy) return;
    setBusy(true);
    try {
      const result = await api<{ ok: boolean }>("/api/biometric/verify", {
        method: "POST",
        body: JSON.stringify({ address }),
      });
      if (result.ok) alert("Biometric verification complete!");
      else alert("Verification failed");
    } catch (e: any) {
      alert(e.message);
    }
    setBusy(false);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🔐</div>
        <p className="text-gray-500">Connect wallet to verify</p>
      </div>
    );
  }

  const hasPassport = passport && passport.verified && passport.score > 0;
  const hasAccounts = (eligibility?.linkedCount ?? 0) >= 3;
  const canBiometric = hasPassport && hasAccounts;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Verification</h2>
      <p className="text-xs text-gray-500">Two-stage verification for hNOBT rewards and withdrawals.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">Stage 1: Gitcoin Passport</h3>
            <p className="text-[10px] text-gray-500">Score &gt; 0 required for points</p>
          </div>
          {passport ? (
            passport.verified ? (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Score: {passport.score}</span>
            ) : (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">Not verified</span>
            )
          ) : (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Unknown</span>
          )}
        </div>
        {eligibility && (
          <div className="text-[10px] text-gray-500 space-y-0.5">
            <p>Linked accounts: {eligibility.linkedCount}/3 required</p>
            {eligibility.linkedAccounts.length > 0 && (
              <p>{eligibility.linkedAccounts.join(", ")}</p>
            )}
          </div>
        )}
        <button onClick={handleFetchPassport} disabled={fetching}
          className="w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 bg-emerald-500 hover:bg-emerald-600">
          {fetching ? "Fetching..." : "Fetch Passport Score"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">Stage 2: Biometric</h3>
            <p className="text-[10px] text-gray-500">Required once per 90 days for withdrawal</p>
          </div>
        </div>
        {!canBiometric && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-[10px] text-yellow-700">
            {!hasPassport ? "Complete Stage 1 first (passport score &gt; 0)" : "Link 3+ social accounts first"}
          </div>
        )}
        <button onClick={handleBiometricVerify} disabled={busy || !canBiometric}
          className="w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 bg-emerald-500 hover:bg-emerald-600">
          {busy ? "Verifying..." : "Verify Biometric"}
        </button>
      </div>
    </div>
  );
}
