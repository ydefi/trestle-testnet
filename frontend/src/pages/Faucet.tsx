import { useState } from "react";
import { useAccount } from "wagmi";
import { useReadContracts, useWriteContract } from "wagmi";
import { formatUnits, parseUnits, type Address } from "viem";

const ERC20_ABI = [
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "mint", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

const MINT_AMOUNT = parseUnits("1000", 18);

const TOKENS = [
  { id: "xGOV", name: "xGOV", addr: import.meta.env.VITE_GOV_TOKEN as Address, desc: "Governance token" },
  { id: "xNOBT", name: "xNOBT", addr: import.meta.env.VITE_XNOBT as Address, desc: "Testnet NOBT" },
  { id: "xBRT", name: "xBRT", addr: import.meta.env.VITE_XBRT as Address, desc: "Testnet Broiler" },
].filter(t => t.addr && t.addr !== "0x...");

export default function Faucet() {
  const { address, connector } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState<string | null>(null);
  const [txHash, setTxHash] = useState("");

  const { data: balances, refetch } = useReadContracts({
    contracts: TOKENS.map(t => ({ abi: ERC20_ABI, address: t.addr, functionName: "balanceOf", args: address ? [address] : [] })),
    query: { enabled: !!address },
  } as any);

  async function mint(token: typeof TOKENS[0]) {
    if (!address || busy) return;
    setBusy(token.id); setTxHash("");
    try {
      const hash = await writeContractAsync({ abi: ERC20_ABI, address: token.addr, functionName: "mint", args: [address, MINT_AMOUNT], connector } as any);
      setTxHash(hash);
      setTimeout(refetch, 2000);
    } catch (e: any) { console.error(e); }
    finally { setBusy(null); }
  }

  return (
    <section className="pt-8">
      <div className="max-w-lg mx-auto px-4">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">Testnet Faucet</h2>
        <p className="text-sm text-gray-500 text-center mb-8">Mint 1000 test tokens to your wallet</p>

        {!address && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-amber-700 mb-3">Connect wallet to mint tokens</p>
            <w3m-button />
          </div>
        )}

        {txHash && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-sm text-emerald-700 break-all">
            Tx: <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline font-mono">{txHash.slice(0, 20)}...</a>
          </div>
        )}

        {address && (
          <div className="space-y-3">
            {TOKENS.map(t => {
              const bal = balances?.[TOKENS.indexOf(t)]?.result as bigint | undefined;
              const loading = busy === t.id;
              return (
                <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.desc}</p>
                    <p className="text-sm text-gray-600 mt-1">Balance: {bal ? formatUnits(bal, 18) : "0"}</p>
                  </div>
                  <button
                    onClick={() => mint(t)}
                    disabled={!!busy}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition"
                  >
                    {loading ? "..." : "Mint 1000"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          {address ? `Your address: ${address.slice(0, 6)}...${address.slice(-4)}` : "Wallet not connected"}
        </p>
      </div>
    </section>
  );
}
