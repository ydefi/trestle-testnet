<<<<<<< HEAD
import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatUnits, type Address } from "viem";
import { CHAIN_CONFIG, SUPPORTED_CHAIN_IDS } from "../config/contracts";

const ERC20_ABI = [
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const;

export function useContracts() {
  const { address, isConnected, chain } = useAccount();
  const chainId = chain?.id ?? CHAIN_CONFIG.amoy.id;
  const { data: native } = useBalance({ address });

  const isCorrectChain = (SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId);

  const chainKey = Object.keys(CHAIN_CONFIG).find(k => CHAIN_CONFIG[k as keyof typeof CHAIN_CONFIG].id === chainId);
  const chainName = chainKey
    ? CHAIN_CONFIG[chainKey as keyof typeof CHAIN_CONFIG].name
    : "Unsupported";
  const explorer = chainKey
    ? CHAIN_CONFIG[chainKey as keyof typeof CHAIN_CONFIG].explorer
    : "";
=======
import { useAccount, useChainId, useBalance } from "wagmi";
import { useReadContract, useWriteContract } from "wagmi";
import { formatUnits, type Address, parseUnits } from "viem";
import { polygonAmoy } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { DIGITAL_GOODS_ABI, FREELANCER_ESCROW_ABI } from "../utils/abis";

const SUPPORTED: number[] = [80002]; // Polygon Amoy chain ID

const MARKETPLACE_ABI = [
  { inputs: [{ name: "listingId", type: "uint256" }], name: "buy", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "listingId", type: "uint256" }], name: "getListing", outputs: [{ name: "seller", type: "address" }, { name: "price", type: "uint256" }, { name: "active", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "listingCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const;

const RWA_ABI = [
  { inputs: [{ name: "account", type: "address" }], name: "whitelisted", outputs: [{ name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "whitelistUser", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

const PLACEHOLDER = "0x...";
const isReal = (a: string) => a !== PLACEHOLDER && !a.startsWith("0x0000");

export function useContracts() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: native } = useBalance({ address, chainId: polygonAmoy.id });

  const isCorrectChain = SUPPORTED.includes(chainId);
  const chainName = "Polygon Amoy";

  // testnet contract addresses (from env)
  const marketplace = CONTRACT_ADDRESSES.amoy.marketplaceCore as Address;
  const digitalRWA = CONTRACT_ADDRESSES.amoy.digitalRWA as Address;
  const digitalGoods = CONTRACT_ADDRESSES.amoy.digitalGoods as Address;
  const freelancerEscrow = CONTRACT_ADDRESSES.amoy.freelancerEscrow as Address;
  const aiDispute = CONTRACT_ADDRESSES.amoy.aiDisputeResolver as Address;
  const govToken = CONTRACT_ADDRESSES.amoy.governanceToken as Address;

  const { writeContractAsync } = useWriteContract();
  const write = (payload: Parameters<typeof writeContractAsync>[0]) =>
    writeContractAsync(payload as any);
>>>>>>> 7c29aad (initial commit)

  return {
    address,
    isConnected,
    isCorrectChain,
<<<<<<< HEAD
    chainId,
    chainName,
    explorer,
    balance: native ? formatUnits(native.value, native.decimals) : "0",
  };
}
=======
    chainName,
    balance: native ? formatUnits(native.value, native.decimals) : "0",

    // marketplace
    marketplaceReady: isReal(marketplace) && isCorrectChain,
    marketplaceAddr: marketplace,
    marketplaceABI: MARKETPLACE_ABI,
    buyListing: (id: number, value: string) =>
      write({ abi: MARKETPLACE_ABI, address: marketplace, functionName: "buy", args: [BigInt(id)], value: parseUnits(value, 18) } as any),

    // RWA
    rwaReady: isReal(digitalRWA) && isCorrectChain,
    rwaAddr: digitalRWA,
    rwaABI: RWA_ABI,
    whitelistUser: (to: Address, amount: string) =>
      write({ abi: RWA_ABI, address: digitalRWA, functionName: "whitelistUser", args: [to, parseUnits(amount, 18)] } as any),

    // Digital Goods
    digitalGoodsReady: isReal(digitalGoods) && isCorrectChain,
    digitalGoodsAddr: digitalGoods,
    digitalGoodsABI: DIGITAL_GOODS_ABI,
    listItem: (price: string, tokenURI: string) =>
      write({ abi: DIGITAL_GOODS_ABI, address: digitalGoods, functionName: "listItem", args: [parseUnits(price, 18), tokenURI] } as any),
    buyItem: (id: number, value: string) =>
      write({ abi: DIGITAL_GOODS_ABI, address: digitalGoods, functionName: "buyItem", args: [BigInt(id)], value: parseUnits(value, 18) } as any),

    // Freelancer Escrow
    freelancerEscrowReady: isReal(freelancerEscrow) && isCorrectChain,
    freelancerEscrowAddr: freelancerEscrow,
    freelancerEscrowABI: FREELANCER_ESCROW_ABI,
    createJob: (freelancer: Address, amount: string) =>
      write({ abi: FREELANCER_ESCROW_ABI, address: freelancerEscrow, functionName: "createJob", args: [freelancer, parseUnits(amount, 18)] } as any),
    deliverJob: (id: number) =>
      write({ abi: FREELANCER_ESCROW_ABI, address: freelancerEscrow, functionName: "deliver", args: [BigInt(id)] } as any),
    releaseJob: (id: number) =>
      write({ abi: FREELANCER_ESCROW_ABI, address: freelancerEscrow, functionName: "release", args: [BigInt(id)] } as any),
    refundJob: (id: number) =>
      write({ abi: FREELANCER_ESCROW_ABI, address: freelancerEscrow, functionName: "refund", args: [BigInt(id)] } as any),
  };
}
>>>>>>> 7c29aad (initial commit)
