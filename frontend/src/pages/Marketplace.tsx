<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useContracts } from "../hooks/useContracts";
import { getListings, type Listing } from "../lib/testnet";
import { LINKS } from "../config/contracts";
import { formatEther } from "viem";

const PRICING_LABELS: Record<number, string> = {
  0: "Fixed",
  1: "Dutch Auction",
};

const STATUS_LABELS: Record<number, string> = {
  0: "Active",
  1: "Sold",
  2: "Cancelled",
  3: "Disputed",
  4: "Refunded",
};

export default function Marketplace() {
  const { isConnected, isCorrectChain, chainId, explorer } = useContracts();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    getListings(chainId)
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [chainId]);

  const filtered = filter === "all" ? listings : listings.filter(l => {
    if (filter === "active") return l.status === 0;
    if (filter === "fixed") return l.pricing === 0;
    if (filter === "dutch") return l.pricing === 1;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Marketplace</h2>
        <a
          href={LINKS.testnet}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-600 hover:underline"
        >
          Open Testnet Hub →
        </a>
      </div>

      {!isConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 text-center">
          Connect wallet to buy listings. Browse freely below.
        </div>
      )}

      {isConnected && !isCorrectChain && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-xs text-red-700">Switch to a supported testnet to buy listings.</p>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "all", label: "All" },
          { id: "active", label: "Active" },
          { id: "fixed", label: "Fixed" },
          { id: "dutch", label: "Dutch" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === f.id ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Loading listings...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
          <p className="text-sm">No listings yet — be the first!</p>
          <a
            href={LINKS.testnet}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs text-emerald-600 hover:underline"
          >
            Create listing on Testnet Hub →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-sm">Listing #{listing.id}</h4>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      listing.status === 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {STATUS_LABELS[listing.status] || "Unknown"}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                      {PRICING_LABELS[listing.pricing] || "Unknown"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{listing.metadataURI}</p>
                  {listing.category && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 mt-1 inline-block">
                      {listing.category}
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-emerald-600">
                    {formatEther(BigInt(listing.price))} POL
                  </p>
                  {listing.seller && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                    </p>
                  )}
                </div>
              </div>
              {listing.status === 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {listing.seller ? `Seller: ${listing.seller.slice(0, 6)}...${listing.seller.slice(-4)}` : ""}
                  </span>
                  {isConnected && isCorrectChain ? (
                    <a
                      href={`${explorer}/address/${listing.seller}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition"
                    >
                      View Seller
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Connect to interact</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
=======
import { useContracts } from "../hooks/useContracts";
import { useReadContract, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { DIGITAL_GOODS_ABI, FREELANCER_ESCROW_ABI } from "../utils/abis";
import { useState } from "react";

export default function Marketplace() {
  const { 
    isConnected, 
    isCorrectChain,
    digitalGoodsReady,
    listItem,
    freelancerEscrowReady,
    createJob
  } = useContracts();
  const isRealAddress = (addr: string | undefined) => addr && addr !== "0x..." && addr.startsWith("0x") && addr.length === 42;

  // Contract addresses from env
  const marketplaceCore = CONTRACT_ADDRESSES.amoy.marketplaceCore;
  const digitalGoods = CONTRACT_ADDRESSES.amoy.digitalGoods;
  const freelancerEscrow = CONTRACT_ADDRESSES.amoy.freelancerEscrow;
  const digitalRWA = CONTRACT_ADDRESSES.amoy.digitalRWA;

  const goodsReady = isRealAddress(digitalGoods) && isCorrectChain;
  const freelancerReady = isRealAddress(freelancerEscrow) && isCorrectChain;
  const rwaReady = isRealAddress(digitalRWA) && isCorrectChain;

  // Fetch goods count
  const { data: goodsCount } = useReadContract({
    abi: DIGITAL_GOODS_ABI,
    address: digitalGoods as `0x${string}`,
    functionName: "itemCount",
    query: { enabled: Boolean(goodsReady) },
  });

  // Fetch jobs count
  const { data: jobsCount } = useReadContract({
    abi: FREELANCER_ESCROW_ABI,
    address: freelancerEscrow as `0x${string}`,
    functionName: "jobCount",
    query: { enabled: Boolean(freelancerReady) },
  });

  // State for listing form
  const [listPrice, setListPrice] = useState("");
  const [listTokenURI, setListTokenURI] = useState("");
  const [isListing, setIsListing] = useState(false);

  // State for job creation form
  const [jobFreelancer, setJobFreelancer] = useState("");
  const [jobAmount, setJobAmount] = useState("");
  const [isCreatingJob, setIsCreatingJob] = useState(false);

   const handleListItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listPrice.trim()) {
      alert("Please enter a price");
      return;
    }
    if (!listTokenURI.trim()) {
      alert("Please enter a token URI");
      return;
    }
    const priceNum = parseFloat(listPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price greater than 0");
      return;
    }
    // Basic URI validation (non-empty string)
    if (listTokenURI.trim().length === 0) {
      alert("Please enter a valid token URI");
      return;
    }
    
    setIsListing(true);
    try {
      await listItem(listPrice, listTokenURI);
      alert("Item listed successfully!");
      // Reset form
      setListPrice("");
      setListTokenURI("");
    } catch (error: any) {
      console.error("Error listing item:", error);
      // Handle common error cases
      if (error.message?.includes("execution reverted")) {
        alert("Transaction failed: " + (error.message?.includes("revert ") ? 
          error.message.split("revert ").pop().split("(")[0].trim() : 
          "Unknown contract error"));
      } else {
        alert(`Failed to list item: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsListing(false);
    }
  };

   const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobFreelancer.trim()) {
      alert("Please enter a freelancer address");
      return;
    }
    if (!jobAmount || parseFloat(jobAmount) <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }
    // Basic Ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(jobFreelancer)) {
      alert("Please enter a valid Ethereum address");
      return;
    }
    
    setIsCreatingJob(true);
    try {
      await createJob(jobFreelancer as `0x${string}`, jobAmount);
      alert("Job created successfully!");
      // Reset form
      setJobFreelancer("");
      setJobAmount("");
    } catch (error: any) {
      console.error("Error creating job:", error);
      // Handle common error cases
      if (error.message?.includes("execution reverted")) {
        alert("Transaction failed: " + (error.message?.includes("revert ") ? 
          error.message.split("revert ").pop().split("(")[0].trim() : 
          "Unknown contract error"));
      } else {
        alert(`Failed to create job: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsCreatingJob(false);
    }
  };

  if (!isConnected) {
    return (
      <section className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🏪</div>
          <p className="text-lg text-gray-500 mb-4">Connect wallet to browse marketplace</p>
          <div className="bg-gray-50 rounded-xl p-4 max-w-sm mx-auto">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent("https://testnet.trestle.website/marketplace")}&color=059669&bgcolor=ffffff&ecc=M`}
              alt="QR"
              className="rounded-lg mx-auto mb-2"
            />
            <p className="text-[10px] text-gray-400 font-medium">Scan with wallet to connect</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="pt-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Marketplace</h2>

          {!isCorrectChain && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mb-6">
              <p className="text-sm text-red-700">Switch to Polygon Amoy to interact with testnet marketplace.</p>
            </div>
          )}

           {/* Digital Goods Section */}
           <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
             <h3 className="font-semibold text-gray-900 mb-3">Digital Goods</h3>
             {goodsReady ? (
               <>
                 <div className="space-y-3">
                   <p className="text-sm text-gray-500">Trade digital assets on the testnet marketplace.</p>
                   <p className="text-xs text-gray-400">Contract: {digitalGoods}</p>
                   <p className="text-xs text-gray-400">Items listed: {goodsCount?.toString() ?? "..."}</p>
                 </div>
 
                   <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                     <h4 className="font-medium mb-2">List New Item</h4>
                     <form onSubmit={handleListItem} className="space-y-3">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Price (MATIC)</label>
                         <input
                           type="number"
                           step="0.0001"
                           min="0.0001"
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                           value={listPrice}
                           onChange={(e) => setListPrice(e.target.value)}
                           placeholder="Enter price in MATIC"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Token URI</label>
                         <input
                           type="text"
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                           value={listTokenURI}
                           onChange={(e) => setListTokenURI(e.target.value)}
                           placeholder="Enter IPFS or metadata URL"
                         />
                       </div>
                       <button
                         type="submit"
                         disabled={isListing}
                         className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                       >
                         {isListing ? "Listing..." : "List Item"}
                       </button>
                     </form>
                   </div>
                 </>
             ) : (
               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                 <p className="text-sm text-yellow-700">Digital Goods contract not deployed.</p>
               </div>
             )}
           </div>

           {/* Freelancer Escrow Section */}
           <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
             <h3 className="font-semibold text-gray-900 mb-3">Freelancer Escrow</h3>
             {freelancerReady ? (
               <>
                 <div className="space-y-3">
                   <p className="text-sm text-gray-500">Secure freelance payments with smart contract escrow.</p>
                   <p className="text-xs text-gray-400">Contract: {freelancerEscrow}</p>
                   <p className="text-xs text-gray-400">Jobs created: {jobsCount?.toString() ?? "..."}</p>
                 </div>

                 <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                   <h4 className="font-medium mb-2">Create New Job</h4>
                   <form onSubmit={handleCreateJob} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Freelancer Address</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          value={jobFreelancer}
                          onChange={(e) => setJobFreelancer(e.target.value)}
                          placeholder="0x1234567890123456789012345678901234567890"
                        />
                      </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Amount (MATIC)</label>
                       <input
                         type="number"
                         step="0.0001"
                         min="0.0001"
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                         value={jobAmount}
                         onChange={(e) => setJobAmount(e.target.value)}
                         placeholder="Enter amount in MATIC"
                       />
                     </div>
                     <button
                       type="submit"
                       disabled={isCreatingJob}
                       className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                     >
                       {isCreatingJob ? "Creating..." : "Create Job"}
                     </button>
                   </form>
                 </div>
               </>
             ) : (
               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                 <p className="text-sm text-yellow-700">Freelancer Escrow contract not deployed.</p>
               </div>
             )}
           </div>

          {/* RWA Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Real World Assets</h3>
            {rwaReady ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Tokenized real-world assets for investment.</p>
                <p className="text-xs text-gray-400">Contract: {digitalRWA}</p>
                <p className="text-xs text-gray-400">Use the RWA page for KYC and investment.</p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700">RWA contract not deployed.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
>>>>>>> 7c29aad (initial commit)
