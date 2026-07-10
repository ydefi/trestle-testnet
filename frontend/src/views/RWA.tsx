import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits, type Address } from "viem";
import { useContracts } from "../hooks/useContracts";

const EXAMPLE_INFO = {
  name: "Trestle Treasury Bill Fund",
  description: "Short-term US Treasury bills tokenized on Polygon Amoy — 4.5% APY, 90-day lockup.",
  lockupDuration: 90n * 86400n,
  expectedReturnBps: 450n,
  underlyingAsset: "US T-Bill Series X (90d maturity)",
  redemptionDate: BigInt(Math.floor(Date.now() / 1000) + 90 * 86400),
  redemptionPrice: parseUnits("1.045", 18),
};

function parseAssetInfo(raw: unknown): typeof EXAMPLE_INFO | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  if (typeof r.name !== "string" || typeof r.description !== "string") return undefined;
  return {
    name: typeof r.name === "string" ? r.name : "",
    description: typeof r.description === "string" ? r.description : "",
    lockupDuration: typeof r.lockupDuration === "bigint" ? r.lockupDuration : typeof r.lockupDuration === "number" ? BigInt(r.lockupDuration) : 0n,
    expectedReturnBps: typeof r.expectedReturnBps === "bigint" ? r.expectedReturnBps : typeof r.expectedReturnBps === "number" ? BigInt(r.expectedReturnBps) : 0n,
    underlyingAsset: typeof r.underlyingAsset === "string" ? r.underlyingAsset : "",
    redemptionDate: typeof r.redemptionDate === "bigint" ? r.redemptionDate : typeof r.redemptionDate === "number" ? BigInt(r.redemptionDate) : 0n,
    redemptionPrice: typeof r.redemptionPrice === "bigint" ? r.redemptionPrice : typeof r.redemptionPrice === "number" ? BigInt(r.redemptionPrice) : 0n,
  };
}

export default function RWA() {
  const { address, isConnected, rwaReady, rwaAddr, rwaABI } = useContracts();
  const { connector } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [mintAmount, setMintAmount] = useState("100");
  const [subAmount, setSubAmount] = useState("10");
  const [wlAddr, setWlAddr] = useState("");
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState("");

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
  const { data: owner } = useReadContract({
    abi: rwaABI, address: rwaAddr, functionName: "owner",
    query: { enabled: rwaReady },
  });

  const isAdmin = address && owner && address.toLowerCase() === (owner as string).toLowerCase();
  const info = parseAssetInfo(assetInfo) || EXAMPLE_INFO;

  async function handleSubscribe() {
    if (!rwaReady || busy) return;
    setBusy(true); setTxHash("");
    try {
      const hash = await writeContractAsync({ abi: rwaABI, address: rwaAddr, functionName: "subscribe", args: [], value: parseUnits(subAmount || "0", 18), connector } as any);
      setTxHash(hash);
    } catch (e: any) { console.error(e); }
    finally { setBusy(false); }
  }

  async function handleMint() {
    if (!address || !rwaReady || busy) return;
    setBusy(true); setTxHash("");
    try {
      const hash = await writeContractAsync({ abi: rwaABI, address: rwaAddr, functionName: "mint", args: [address, parseUnits(mintAmount || "0", 18)], connector } as any);
      setTxHash(hash);
    } catch (e: any) { console.error(e); }
    finally { setBusy(false); }
  }

  async function handleSetWhitelist(status: boolean) {
    if (!rwaReady || busy || !wlAddr) return;
    setBusy(true); setTxHash("");
    try {
      const hash = await writeContractAsync({ abi: rwaABI, address: rwaAddr, functionName: "setWhitelist", args: [wlAddr as Address, status], connector } as any);
      setTxHash(hash);
    } catch (e: any) { console.error(e); }
    finally { setBusy(false); }
  }


  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-2">🔐</div>
        <p className="text-gray-500">Connect wallet to access RWA</p>
        <div className="flex justify-center mt-4"><w3m-button /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Real World Assets (RWA)</h2>
      <p className="text-sm text-gray-500">Tokenized real-world assets require KYC verification.</p>

      {/* walkthrough */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
        <strong>RWA Guide:</strong> Assets are whitelist-gated for compliance. Contact an admin to get your address
        whitelisted, then use <strong>Subscribe</strong> to mint DA1 tokens by sending MATIC.
        Token holders earn yield and can redeem at the redemption date.
      </div>

      {!rwaReady && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-sm text-yellow-700">RWA contract not deployed or wrong chain — check <strong>NEXT_PUBLIC_DIGITAL_RWA</strong> and switch to Amoy.</p>
        </div>
      )}

      {rwaReady && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-emerald-700 font-semibold">KYC Approved (Mock)</p>
          {whitelisted === true && <p className="text-xs text-emerald-600 mt-1">Whitelisted on-chain</p>}
        </div>
      )}

      {txHash && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 break-all">
          Tx: <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline font-mono">{txHash.slice(0, 20)}...</a>
        </div>
      )}

      {/* Asset Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Asset Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{info.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Description</span><span className="font-medium text-right max-w-[60%]">{info.description}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Underlying Asset</span><span className="font-medium">{info.underlyingAsset}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Supply</span><span className="font-medium">{totalSupply ? formatUnits(totalSupply as bigint, 18) : "0"} / {cap ? formatUnits(cap as bigint, 18) : "1,000,000"}</span></div>
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
      </div>

      {/* Subscribe */}
      {rwaReady && whitelisted === true && !isAdmin && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Subscribe</h3>
          <p className="text-xs text-gray-500">Send MATIC to mint RWA tokens (1 MATIC = 1 DA1)</p>
          <div className="flex gap-2">
            <input value={subAmount} onChange={e => setSubAmount(e.target.value)} type="number" min="0" placeholder="MATIC amount" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <button onClick={handleSubscribe} disabled={busy || !rwaReady} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition">
              {busy ? "..." : "Buy DA1"}
            </button>
          </div>
        </div>
      )}

      {/* not whitelisted */}
      {rwaReady && whitelisted !== true && !isAdmin && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 text-center">
          <h3 className="font-semibold text-gray-900">Access Required</h3>
          <p className="text-sm text-gray-600">RWA is whitelist-gated for regulatory compliance. Contact an admin to get your address whitelisted.</p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Your Address</p>
            <p className="text-sm font-mono text-gray-700 break-all">{address}</p>
          </div>
        </div>
      )}

      {/* Admin */}
      {isAdmin ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Admin</h3>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mint Tokens (to yourself)</label>
            <div className="flex gap-2">
              <input value={mintAmount} onChange={e => setMintAmount(e.target.value)} type="number" min="0" placeholder="Amount" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <button onClick={handleMint} disabled={busy || !rwaReady} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition">
                {busy ? "..." : "Mint"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Manage Whitelist</label>
            <div className="flex gap-2">
              <input value={wlAddr} onChange={e => setWlAddr(e.target.value)} placeholder="0x..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-xs" />
              <button onClick={() => handleSetWhitelist(true)} disabled={busy || !rwaReady || !wlAddr} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition">
                Allow
              </button>
              <button onClick={() => handleSetWhitelist(false)} disabled={busy || !rwaReady || !wlAddr} className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition">
                Block
              </button>
            </div>
          </div>
        </div>
      ) : rwaReady && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-sm text-yellow-700">Admin functions require the contract owner wallet {owner ? `${(owner as string).slice(0, 6)}...${(owner as string).slice(-4)}` : ""}</p>
        </div>
      )}
    </div>
  );
}
