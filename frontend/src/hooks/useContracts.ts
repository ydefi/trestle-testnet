import { useAccount, useChainId, useBalance } from "wagmi";
import { useWriteContract } from "wagmi";
import { formatUnits, type Address, parseUnits } from "viem";
import { CHAIN_CONFIG } from "../config/contracts";

const SUPPORTED = [CHAIN_CONFIG.amoy.id] as const;

const ERC20_ABI = [
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
] as const;

const DIGITAL_GOODS_ABI = [
  { inputs: [{ name: "listingId", type: "uint256" }], name: "buy", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "listingId", type: "uint256" }, { name: "token", type: "address" }, { name: "amount", type: "uint256" }], name: "buyWithToken", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "listingId", type: "uint256" }], name: "currentPrice", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "listingCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "uint256" }], name: "listings", outputs: [{ name: "id", type: "uint256" }, { name: "seller", type: "address" }, { name: "metadataURI", type: "string" }, { name: "pricing", type: "uint8" }, { name: "price", type: "uint256" }, { name: "status", type: "uint8" }, { name: "buyer", type: "address" }, { name: "escrowedAmount", type: "uint256" }, { name: "createdAt", type: "uint256" }, { name: "disputeDeadline", type: "uint256" }, { name: "deliveryConfirmed", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "metadataURI", type: "string" }, { name: "price", type: "uint256" }], name: "listFixed", outputs: [{ name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "metadataURI", type: "string" }, { name: "startPrice", type: "uint256" }, { name: "reservePrice", type: "uint256" }, { name: "duration", type: "uint256" }], name: "listDutch", outputs: [{ name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
] as const;

const FREELANCER_ESCROW_ABI = [
  { inputs: [{ name: "projectId", type: "uint256" }], name: "projects", outputs: [{ name: "client", type: "address" }, { name: "freelancer", type: "address" }, { name: "status", type: "uint8" }, { name: "totalBudget", type: "uint256" }, { name: "escrowedAmount", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "projectCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "uint256" }], name: "gigs", outputs: [{ name: "id", type: "uint256" }, { name: "freelancer", type: "address" }, { name: "title", type: "string" }, { name: "descriptionURI", type: "string" }, { name: "price", type: "uint256" }, { name: "active", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "gigCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "gigId", type: "uint256" }], name: "getGigMilestoneCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "title", type: "string" }, { name: "descriptionURI", type: "string" }, { name: "totalBudget", type: "uint256" }, { name: "milestoneDescriptions", type: "string[]" }, { name: "milestoneAmounts", type: "uint256[]" }, { name: "milestoneDeadlines", type: "uint256[]" }], name: "createProjectFixed", outputs: [{ name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "title", type: "string" }, { name: "descriptionURI", type: "string" }, { name: "maxBudget", type: "uint256" }, { name: "reserveBudget", type: "uint256" }, { name: "duration", type: "uint256" }, { name: "milestoneDescriptions", type: "string[]" }, { name: "milestoneAmounts", type: "uint256[]" }, { name: "milestoneDeadlines", type: "uint256[]" }], name: "createProjectDutch", outputs: [{ name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "title", type: "string" }, { name: "descriptionURI", type: "string" }, { name: "price", type: "uint256" }, { name: "milestoneDescriptions", type: "string[]" }, { name: "milestoneAmounts", type: "uint256[]" }, { name: "milestoneDeadlines", type: "uint256[]" }], name: "createGig", outputs: [{ name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "gigId", type: "uint256" }], name: "hireGig", outputs: [{ name: "", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "id", type: "uint256" }, { name: "milestoneIndex", type: "uint256" }, { name: "deliveryHash", type: "string" }], name: "submitMilestone", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "id", type: "uint256" }, { name: "milestoneIndex", type: "uint256" }], name: "approveMilestone", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

const RWA_ABI = [
  { inputs: [{ name: "account", type: "address" }], name: "whitelisted", outputs: [{ name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "mint", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "account", type: "address" }, { name: "status", type: "bool" }], name: "setWhitelist", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "assetInfo", outputs: [{ name: "name", type: "string" }, { name: "description", type: "string" }, { name: "lockupDuration", type: "uint256" }, { name: "expectedReturnBps", type: "uint256" }, { name: "underlyingAsset", type: "string" }, { name: "redemptionDate", type: "uint256" }, { name: "redemptionPrice", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "cap", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const;

const PLACEHOLDER = "0x...";
const isReal = (a: string) => a !== PLACEHOLDER && !a.startsWith("0x0000");

const A = (key: string): Address =>
  (import.meta.env[`VITE_${key}`] as Address) ?? PLACEHOLDER as Address;

export function useContracts() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: native } = useBalance({ address });

  const isCorrectChain = (SUPPORTED as readonly number[]).includes(chainId);
  const chainName = chainId === CHAIN_CONFIG.amoy.id ? CHAIN_CONFIG.amoy.name : "Unsupported";

  // contract addresses (from .env)
  const digitalGoods = A("DIGITAL_GOODS");
  const freelancerEscrow = A("FREELANCER_ESCROW");
  const digitalRWA = A("DIGITAL_RWA");
  const govToken = A("GOV_TOKEN");
  const feeDistributor = A("FEE_DISTRIBUTOR");

  const { writeContractAsync } = useWriteContract();
  const write = (payload: Parameters<typeof writeContractAsync>[0]) =>
    writeContractAsync(payload as any);

  return {
    address,
    isConnected,
    isCorrectChain,
    chainName,
    balance: isCorrectChain && native ? formatUnits(native.value, native.decimals) : "0",

    // Digital Goods
    digitalGoodsReady: isReal(digitalGoods) && isCorrectChain,
    digitalGoodsAddr: digitalGoods,
    digitalGoodsABI: DIGITAL_GOODS_ABI,
    buyListing: (id: number, value: string) =>
      write({ abi: DIGITAL_GOODS_ABI, address: digitalGoods, functionName: "buy", args: [BigInt(id)], value: parseUnits(value, 18) } as any),
    listFixed: (metadataURI: string, price: string) =>
      write({ abi: DIGITAL_GOODS_ABI, address: digitalGoods, functionName: "listFixed", args: [metadataURI, parseUnits(price, 18)] } as any),
    listDutch: (metadataURI: string, startPrice: string, reservePrice: string, durationSec: bigint) =>
      write({ abi: DIGITAL_GOODS_ABI, address: digitalGoods, functionName: "listDutch", args: [metadataURI, parseUnits(startPrice, 18), parseUnits(reservePrice, 18), durationSec] } as any),
    buyWithTokenListing: (id: number, token: Address, amount: string) =>
      write({ abi: DIGITAL_GOODS_ABI, address: digitalGoods, functionName: "buyWithToken", args: [BigInt(id), token, parseUnits(amount, 18)] } as any),
    approveToken: (token: Address, spender: Address, amount: bigint) =>
      write({ abi: ERC20_ABI, address: token, functionName: "approve", args: [spender, amount] } as any),

    // Freelancer Escrow
    freelancerEscrowReady: isReal(freelancerEscrow) && isCorrectChain,
    freelancerEscrowAddr: freelancerEscrow,
    freelancerEscrowABI: FREELANCER_ESCROW_ABI,
    createProjectFixed: (title: string, descriptionURI: string, totalBudget: string, milestoneDescriptions: string[], milestoneAmounts: string[], milestoneDeadlines: bigint[]) =>
      write({ abi: FREELANCER_ESCROW_ABI, address: freelancerEscrow, functionName: "createProjectFixed", args: [title, descriptionURI, parseUnits(totalBudget, 18), milestoneDescriptions, milestoneAmounts.map(a => parseUnits(a, 18)), milestoneDeadlines] } as any),
    createProjectDutch: (title: string, descriptionURI: string, maxBudget: string, reserveBudget: string, durationSec: bigint, milestoneDescriptions: string[], milestoneAmounts: string[], milestoneDeadlines: bigint[]) =>
      write({ abi: FREELANCER_ESCROW_ABI, address: freelancerEscrow, functionName: "createProjectDutch", args: [title, descriptionURI, parseUnits(maxBudget, 18), parseUnits(reserveBudget, 18), durationSec, milestoneDescriptions, milestoneAmounts.map(a => parseUnits(a, 18)), milestoneDeadlines] } as any),
    createGig: (title: string, descriptionURI: string, price: string, milestoneDescriptions: string[], milestoneAmounts: string[], milestoneDeadlines: bigint[]) =>
      write({ abi: FREELANCER_ESCROW_ABI, address: freelancerEscrow, functionName: "createGig", args: [title, descriptionURI, parseUnits(price, 18), milestoneDescriptions, milestoneAmounts.map(a => parseUnits(a, 18)), milestoneDeadlines] } as any),
    hireGig: (gigId: number, value: string) =>
      write({ abi: FREELANCER_ESCROW_ABI, address: freelancerEscrow, functionName: "hireGig", args: [BigInt(gigId)], value: parseUnits(value, 18) } as any),
    submitMilestone: (projectId: number, milestoneIndex: number, deliveryHash: string) =>
      write({ abi: FREELANCER_ESCROW_ABI, address: freelancerEscrow, functionName: "submitMilestone", args: [BigInt(projectId), BigInt(milestoneIndex), deliveryHash] } as any),
    approveMilestone: (projectId: number, milestoneIndex: number) =>
      write({ abi: FREELANCER_ESCROW_ABI, address: freelancerEscrow, functionName: "approveMilestone", args: [BigInt(projectId), BigInt(milestoneIndex)] } as any),

    // RWA
    rwaReady: isReal(digitalRWA) && isCorrectChain,
    rwaAddr: digitalRWA,
    rwaABI: RWA_ABI,
    mintRWA: (to: Address, amount: string) =>
      write({ abi: RWA_ABI, address: digitalRWA, functionName: "mint", args: [to, parseUnits(amount, 18)] } as any),
    setWhitelist: (account: Address, status: boolean) =>
      write({ abi: RWA_ABI, address: digitalRWA, functionName: "setWhitelist", args: [account, status] } as any),
  };
}
