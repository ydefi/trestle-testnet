import { formatEther } from "viem";

export function formatTokenAmount(amount: bigint, decimals = 18): string {
  const formatted = formatEther(amount);
  const [whole, fraction] = formatted.split(".");
  return `${whole}.${(fraction ?? "0").slice(0, 4)}`;
}

export function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// Digital Goods ABI
export const DIGITAL_GOODS_ABI = [
  { inputs: [], name: "itemCount", outputs: [{ name: "", type: "uint256" }], type: "function", stateMutability: "view" },
  { inputs: [{ name: "id", type: "uint256" }], name: "items", outputs: [
    { name: "seller", type: "address" },
    { name: "price", type: "uint256" },
    { name: "active", type: "bool" }
  ], type: "function", stateMutability: "view" },
  { inputs: [{ name: "price", type: "uint256" }, { name: "tokenURI", type: "string" }], name: "listItem", outputs: [], type: "function", stateMutability: "nonpayable" },
  { inputs: [{ name: "id", type: "uint256" }], name: "buyItem", outputs: [], type: "function", stateMutability: "payable" },
];

// Freelancer Escrow ABI
export const FREELANCER_ESCROW_ABI = [
  { inputs: [], name: "jobCount", outputs: [{ name: "", type: "uint256" }], type: "function", stateMutability: "view" },
  { inputs: [{ name: "id", type: "uint256" }], name: "jobs", outputs: [
    { name: "client", type: "address" },
    { name: "freelancer", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "delivered", type: "bool" },
    { name: "completed", type: "bool" }
  ], type: "function", stateMutability: "view" },
  { inputs: [{ name: "freelancer", type: "address" }, { name: "amount", type: "uint256" }], name: "createJob", outputs: [], type: "function", stateMutability: "nonpayable" },
  { inputs: [{ name: "id", type: "uint256" }], name: "deliver", outputs: [], type: "function", stateMutability: "nonpayable" },
  { inputs: [{ name: "id", type: "uint256" }], name: "release", outputs: [], type: "function", stateMutability: "nonpayable" },
  { inputs: [{ name: "id", type: "uint256" }], name: "refund", outputs: [], type: "function", stateMutability: "nonpayable" },
];