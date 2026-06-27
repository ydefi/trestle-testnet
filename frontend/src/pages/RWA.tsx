import { useCallback } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { useContracts } from "../hooks/useContracts";

export default function RWA() {
  const { address, isConnected, rwaReady, rwaAddr, rwaABI } = useContracts();

  const kycKey = (addr: string) => `trestle_kyc_${addr.toLowerCase()}`;
  const kycApproved = address ? localStorage.getItem(kycKey(address)) === "true" : false;

  const { data: whitelisted } = useReadContract({
    abi: rwaABI, address: rwaAddr, functionName: "whitelisted",
    args: address ? [address] : undefined, query: { enabled: rwaReady && !!address },
  });
  const { data: totalSupply } = useReadContract({
    abi: rwaABI, address: rwaAddr, functionName: "totalSupply",
    query: { enabled: rwaReady },
  });
  const { data: userBalance } = useReadContract({
    abi: rwaABI, address: rwaAddr, functionName: "balanceOf",
    args: address ? [address] : undefined, query: { enabled: rwaReady && !!address },
  });
  const { data: cap } = useReadContract({
    abi: rwaABI, address: rwaAddr, functionName: "cap",
    query: { enabled: rwaReady },
  });
  const { data: assetInfo } = useReadContract({
    abi: rwaABI, address: rwaAddr, functionName: "assetInfo",
    query: { enabled: rwaReady },
  });

  const handleKyc = useCallback(() => {
    if (!address) return;
    localStorage.setItem(kycKey(address), "true");
    window.location.reload();
  }, [address]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-2">🔐</div>
        <p className="text-gray-500">Connect wallet to access RWA</p>
        <div className="flex justify-center mt-4"><w3m-button /></div>
      </div>
    );
  }

  const isApproved = kycApproved || whitelisted === true;

  const info = assetInfo as
    | { name: string; description: string; lockupDuration: bigint; expectedReturnBps: bigint; underlyingAsset: string; redemptionDate: bigint; redemptionPrice: bigint }
    | undefined;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Real World Assets (RWA)</h2>
      <p className="text-sm text-gray-500">Tokenized real-world assets require KYC verification.</p>

      {!rwaReady && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-sm text-yellow-700">RWA contract not deployed on this network yet.</p>
        </div>
      )}

      {rwaReady && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">KYC Verification</h3>
            {isApproved ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <p className="text-emerald-700 font-semibold text-lg">KYC Approved</p>
                {whitelisted === true && <p className="text-xs text-emerald-600 mt-1">Whitelisted on-chain</p>}
                {address && <p className="text-xs text-emerald-500 mt-2 font-mono">{address.slice(0, 6)}...{address.slice(-4)}</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Verify your identity to access RWA investments.</p>
                <button onClick={handleKyc}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg transition shadow-lg shadow-emerald-200">
                  Complete KYC
                </button>
              </div>
            )}
          </div>

          {isApproved && (
            <>
              {/* Asset Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Asset Details</h3>
                {info ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{info.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Description</span><span className="font-medium text-right max-w-[60%]">{info.description}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Underlying Asset</span><span className="font-medium">{info.underlyingAsset}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Supply</span><span className="font-medium">{totalSupply ? formatUnits(totalSupply as bigint, 18) : "..."} / {cap ? formatUnits(cap as bigint, 18) : "..."}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Your Balance</span><span className="font-medium">{userBalance ? formatUnits(userBalance as bigint, 18) : "0"} DA1</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Expected Return</span><span className="font-medium">{Number(info.expectedReturnBps) / 100}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Lockup Period</span><span className="font-medium">{Number(info.lockupDuration) / 86400}d</span></div>
                    {Number(info.redemptionDate) > 0 && (
                      <div className="flex justify-between"><span className="text-gray-500">Redemption Date</span><span className="font-medium">{new Date(Number(info.redemptionDate) * 1000).toLocaleDateString()}</span></div>
                    )}
                    {Number(info.redemptionPrice) > 0 && (
                      <div className="flex justify-between"><span className="text-gray-500">Redemption Price</span><span className="font-medium">{formatUnits(info.redemptionPrice, 18)} MATIC</span></div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Loading asset details...</p>
                )}
              </div>

              {/* Mint / Admin */}
              {address && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Admin</h3>
                  <p className="text-xs text-gray-400 mb-3">Connected as {address.slice(0, 6)}...{address.slice(-4)}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition">
                      Mint Tokens
                    </button>
                    <button className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition">
                      Manage Whitelist
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
