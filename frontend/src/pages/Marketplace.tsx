import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { useReadContracts, useWriteContract } from "wagmi";
import { formatUnits, parseUnits, type Address } from "viem";
import { useContracts } from "../hooks/useContracts";

type Tab = "browse" | "create";
type PricingMode = "fixed" | "dutch";
type BuyToken = "native" | "xGOV" | "xNOBT" | "xBRT";

const ERC20_ABI = [
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
] as const;

const TOKEN_ADDRS: Record<string, string> = {
  xGOV: import.meta.env.VITE_GOV_TOKEN || "",
  xNOBT: import.meta.env.VITE_XNOBT || "",
  xBRT: import.meta.env.VITE_XBRT || "",
};

const DG_ABI = [
  { inputs: [{ name: "listingId", type: "uint256" }], name: "buy", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "listingId", type: "uint256" }, { name: "token", type: "address" }, { name: "amount", type: "uint256" }], name: "buyWithToken", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "listingId", type: "uint256" }], name: "currentPrice", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "listingCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "uint256" }], name: "listings", outputs: [{ name: "id", type: "uint256" }, { name: "seller", type: "address" }, { name: "metadataURI", type: "string" }, { name: "pricing", type: "uint8" }, { name: "price", type: "uint256" }, { name: "status", type: "uint8" }, { name: "buyer", type: "address" }, { name: "escrowedAmount", type: "uint256" }, { name: "createdAt", type: "uint256" }, { name: "disputeDeadline", type: "uint256" }, { name: "deliveryConfirmed", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "metadataURI", type: "string" }, { name: "price", type: "uint256" }], name: "listFixed", outputs: [{ name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "metadataURI", type: "string" }, { name: "startPrice", type: "uint256" }, { name: "reservePrice", type: "uint256" }, { name: "duration", type: "uint256" }], name: "listDutch", outputs: [{ name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
] as const;

export default function Marketplace() {
  const { isConnected, isCorrectChain, digitalGoodsReady, digitalGoodsAddr } = useContracts();
  const { address, connector } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [tab, setTab] = useState<Tab>("browse");
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState("");

  const [pricingMode, setPricingMode] = useState<PricingMode>("fixed");
  const [metaURI, setMetaURI] = useState("ipfs://QmExampleNFT — Unique Digital Artwork");
  const [fixedPrice, setFixedPrice] = useState("25");
  const [startPrice, setStartPrice] = useState("100");
  const [reservePrice, setReservePrice] = useState("10");
  const [durationHrs, setDurationHrs] = useState("24");

  const [buyToken, setBuyToken] = useState<BuyToken>("native");
  const [buyingId, setBuyingId] = useState<number | null>(null);

  const addr = digitalGoodsAddr as Address;

  // ── Read listing count ──
  const { data: countData } = useReadContracts({
    contracts: [{ abi: DG_ABI, address: addr, functionName: "listingCount", args: [] }],
    query: { enabled: digitalGoodsReady },
  } as any);
  const listingCount = countData?.[0]?.result ? Number(countData[0].result) : 0;
  const listingIds = useMemo(() => Array.from({ length: listingCount }, (_, i) => i + 1), [listingCount]);

  // ── Read all listings + current prices in batch ──
  const listingCalls = useMemo(() => listingIds.map(id => ({ abi: DG_ABI, address: addr, functionName: "listings", args: [BigInt(id)] })), [listingIds, addr]);
  const priceCalls = useMemo(() => listingIds.map(id => ({ abi: DG_ABI, address: addr, functionName: "currentPrice", args: [BigInt(id)] })), [listingIds, addr]);

  const { data: listingsRaw } = useReadContracts({ contracts: listingCalls as any, query: { enabled: listingCount > 0 } } as any);
  const { data: pricesRaw } = useReadContracts({ contracts: priceCalls as any, query: { enabled: listingCount > 0 } } as any);

  interface Listing {
    id: bigint; seller: Address; metadataURI: string; pricing: number;
    price: bigint; status: number; buyer: Address; escrowedAmount: bigint;
    createdAt: bigint; disputeDeadline: bigint; deliveryConfirmed: boolean;
    currentPrice: bigint;
  }

  const listings: Listing[] = useMemo(() => {
    if (!listingsRaw || !pricesRaw) return [];
    return listingIds.map((id, i) => {
      const l = listingsRaw[i]?.result as any;
      const p = pricesRaw[i]?.result as bigint | undefined;
      if (!l) return null;
      return { ...l, currentPrice: p ?? l.price };
    }).filter(Boolean) as Listing[];
  }, [listingsRaw, pricesRaw, listingIds]);

  const active = useMemo(() => listings.filter(l => l.status === 0), [listings]);

  const EXAMPLE_LISTINGS: Listing[] = [
    { id: 1n, seller: "0x1234...5678" as Address, metadataURI: "ipfs://QmPizzaNFT — Vintage Pixel Art Slice #01", pricing: 0, price: parseUnits("100", 18), status: 0, buyer: "0x0" as Address, escrowedAmount: 0n, createdAt: 0n, disputeDeadline: 0n, deliveryConfirmed: false, currentPrice: parseUnits("100", 18) },
    { id: 2n, seller: "0x8765...4321" as Address, metadataURI: "ipfs://QmDutchNFT — Generative Geometry Collection", pricing: 1, price: parseUnits("500", 18), status: 0, buyer: "0x0" as Address, escrowedAmount: 0n, createdAt: 0n, disputeDeadline: 0n, deliveryConfirmed: false, currentPrice: parseUnits("320", 18) },
    { id: 3n, seller: "0xABCD...EF01" as Address, metadataURI: "ipfs://QmMusicNFT — Lo-Fi Beat License", pricing: 0, price: parseUnits("50", 18), status: 0, buyer: "0x0" as Address, escrowedAmount: 0n, createdAt: 0n, disputeDeadline: 0n, deliveryConfirmed: false, currentPrice: parseUnits("50", 18) },
  ];

  // ── Helpers ──
  const write = (args: any) => writeContractAsync({ ...args, abi: DG_ABI, address: addr, connector } as any);

  async function handleCreate() {
    if (!digitalGoodsReady || busy) return;
    setBusy(true); setTxHash("");
    try {
      const hash = pricingMode === "fixed"
        ? await write({ functionName: "listFixed", args: [metaURI, parseUnits(fixedPrice, 18)] })
        : await write({ functionName: "listDutch", args: [metaURI, parseUnits(startPrice, 18), parseUnits(reservePrice, 18), BigInt(Number(durationHrs) * 3600)] });
      setTxHash(hash);
      setMetaURI(""); setFixedPrice(""); setStartPrice(""); setReservePrice(""); setDurationHrs("24");
    } catch (e: any) { console.error(e); }
    finally { setBusy(false); }
  }

  async function handleBuy(l: Listing) {
    if (!digitalGoodsReady || busy) return;
    setBusy(true); setTxHash(""); setBuyingId(Number(l.id));
    try {
      if (buyToken === "native") {
        const hash = await writeContractAsync({ abi: DG_ABI, address: addr, functionName: "buy", args: [BigInt(l.id)], value: l.currentPrice, connector } as any);
        setTxHash(hash);
      } else {
        const tokenAddr = TOKEN_ADDRS[buyToken] as Address;
        if (!tokenAddr) throw new Error("Token address not configured");
        const approve = await writeContractAsync({ abi: ERC20_ABI, address: tokenAddr, functionName: "approve", args: [addr, l.currentPrice], connector } as any);
        await new Promise(r => setTimeout(r, 2000));
        const hash = await writeContractAsync({ abi: DG_ABI, address: addr, functionName: "buyWithToken", args: [BigInt(l.id), tokenAddr, l.currentPrice], connector } as any);
        setTxHash(hash);
      }
    } catch (e: any) { console.error(e); }
    finally { setBusy(false); setBuyingId(null); }
  }

  if (!isConnected) {
    return (
      <section className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-4">Connect wallet to browse marketplace</p>
          <div className="bg-gray-50 rounded-xl p-4 max-w-sm mx-auto">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent("https://testnet.trestle.website/marketplace")}&color=059669&bgcolor=ffffff&ecc=M`} alt="QR" className="rounded-lg mx-auto mb-2" />
            <p className="text-[10px] text-gray-400 font-medium">Scan with wallet to connect</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="pt-8">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">Marketplace</h2>

          {!digitalGoodsReady && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center mb-6">
              <p className="text-sm text-yellow-700">Marketplace contracts not yet deployed to this network.</p>
            </div>
          )}

          {!isCorrectChain && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mb-6">
              <p className="text-sm text-red-700">Switch to Polygon Amoy to interact with testnet marketplace.</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => setTab("browse")} className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${tab === "browse" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Browse ({active.length})
            </button>
            <button onClick={() => setTab("create")} className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${tab === "create" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Create Listing
            </button>
          </div>

          {txHash && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-sm text-emerald-700 break-all">
              Tx: <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline font-mono">{txHash.slice(0, 20)}...</a>
            </div>
          )}

          {tab === "browse" && (
            <>
              {(active.length === 0 && !digitalGoodsReady) ? (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                  <p className="text-gray-400">Marketplace contract not deployed on this network.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {(active.length > 0 ? active : EXAMPLE_LISTINGS).map(l => {
                    const isBuyingThis = buyingId === Number(l.id);
                    return (
                      <div key={Number(l.id)} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0">
                            <span className="text-xs text-gray-400">#{Number(l.id)}</span>
                            <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{l.metadataURI || "Untitled"}</p>
                          </div>
                          <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${l.pricing === 0 ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                            {l.pricing === 0 ? "Fixed" : "Dutch"}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mb-1">Seller: {l.seller.slice(0, 6)}...{l.seller.slice(-4)}</p>

                        <div className="mt-auto pt-3">
                          <p className="text-xl font-bold text-gray-900">{formatUnits(l.currentPrice, 18)} MATIC</p>
                          {l.pricing === 1 && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Started {formatUnits(l.price, 18)} · Reserve {formatUnits(l.escrowedAmount || 0n, 18)}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 space-y-2">
                          <select value={buyToken} onChange={e => setBuyToken(e.target.value as BuyToken)} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50">
                            <option value="native">MATIC</option>
                            <option value="xGOV">xGOV</option>
                            <option value="xNOBT">xNOBT</option>
                            <option value="xBRT">xBRT</option>
                          </select>
                          <button onClick={() => handleBuy(l)} disabled={busy} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition">
                            {isBuyingThis ? "Processing..." : `Buy${buyToken === "native" ? " with MATIC" : " with " + buyToken.toUpperCase()}`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {tab === "create" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex gap-2 mb-4">
                <button onClick={() => setPricingMode("fixed")} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition ${pricingMode === "fixed" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  Fixed Price
                </button>
                <button onClick={() => setPricingMode("dutch")} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition ${pricingMode === "dutch" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  Dutch Auction
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Metadata URI</label>
                  <input value={metaURI} onChange={e => setMetaURI(e.target.value)} placeholder="ipfs://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>

                {pricingMode === "fixed" ? (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Price (MATIC)</label>
                    <input value={fixedPrice} onChange={e => setFixedPrice(e.target.value)} type="number" step="0.001" min="0" placeholder="0.0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Price</label>
                        <input value={startPrice} onChange={e => setStartPrice(e.target.value)} type="number" step="0.001" min="0" placeholder="100.0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Reserve Price</label>
                        <input value={reservePrice} onChange={e => setReservePrice(e.target.value)} type="number" step="0.001" min="0" placeholder="10.0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Duration (hours)</label>
                      <input value={durationHrs} onChange={e => setDurationHrs(e.target.value)} type="number" min="1" placeholder="24" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    {startPrice && reservePrice && (
                      <p className="text-xs text-gray-400">Price decays from {startPrice} → {reservePrice} MATIC over {durationHrs}h</p>
                    )}
                  </>
                )}

                <button onClick={handleCreate} disabled={busy || !digitalGoodsReady} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition mt-2">
                  {busy ? "Creating..." : `Create ${pricingMode === "fixed" ? "Fixed" : "Dutch Auction"} Listing`}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
