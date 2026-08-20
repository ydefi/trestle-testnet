import { useAccount, useChainId, useBalance } from "wagmi";
import { useWriteContract } from "wagmi";
import { formatUnits, type Address, parseUnits } from "viem";
import { CHAIN_CONFIG, CONTRACT_ADDRESSES, SUPPORTED_CHAIN_IDS, type ChainKey } from "../config/contracts";

const ERC20_ABI = [
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
] as const;

const DIGITAL_GOODS_ABI = [
  { inputs: [{ name: "listingId", type: "uint256" }], name: "buy", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "listingId", type: "uint256" }, { name: "token", type: "address" }, { name: "amount", type: "uint256" }], name: "buyWithToken", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "listingId", type: "uint256" }], name: "currentPrice", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "listingCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "uint256" }], name: "listings", outputs: [{ name: "id", type: "uint256" }, { name: "seller", type: "address" }, { name: "metadataURI", type: "string" }, { name: "pricing", type: "uint8" }, { name: "price", type: "uint256" }, { name: "auction", type: "tuple", components: [{ name: "startPrice", type: "uint256" }, { name: "reservePrice", type: "uint256" }, { name: "duration", type: "uint256" }, { name: "startedAt", type: "uint256" }] }, { name: "status", type: "uint8" }, { name: "buyer", type: "address" }, { name: "escrowedAmount", type: "uint256" }, { name: "createdAt", type: "uint256" }, { name: "disputeDeadline", type: "uint256" }, { name: "deliveryConfirmed", type: "bool" }, { name: "paymentToken", type: "address" }, { name: "category", type: "string" }, { name: "deliveryURI", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "metadataURI", type: "string" }, { name: "price", type: "uint256" }, { name: "category", type: "string" }, { name: "deliveryURI", type: "string" }], name: "listFixed", outputs: [{ name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "metadataURI", type: "string" }, { name: "startPrice", type: "uint256" }, { name: "reservePrice", type: "uint256" }, { name: "duration", type: "uint256" }, { name: "category", type: "string" }, { name: "deliveryURI", type: "string" }], name: "listDutch", outputs: [{ name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
] as const;

const FREELANCER_ESCROW_ABI = [
  { inputs: [{ name: "", type: "uint256" }], name: "projects", outputs: [{ name: "id", type: "uint256" }, { name: "client", type: "address" }, { name: "freelancer", type: "address" }, { name: "title", type: "string" }, { name: "descriptionURI", type: "string" }, { name: "pricing", type: "uint8" }, { name: "totalBudget", type: "uint256" }, { name: "auction", type: "tuple", components: [{ name: "startPrice", type: "uint256" }, { name: "reservePrice", type: "uint256" }, { name: "duration", type: "uint256" }, { name: "startedAt", type: "uint256" }] }, { name: "status", type: "uint8" }, { name: "escrowedAmount", type: "uint256" }, { name: "disputeDeadline", type: "uint256" }, { name: "createdAt", type: "uint256" }, { name: "paymentToken", type: "address" }], stateMutability: "view", type: "function" },
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
  { inputs: [{ name: "account", type: "address" }], name: "isWhitelisted", outputs: [{ name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "mint", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "account", type: "address" }, { name: "status", type: "bool" }], name: "setManualWhitelist", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "token", type: "address" }, { name: "minBalance", type: "uint256" }], name: "setWhitelistToken", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "assetInfo", outputs: [{ name: "name", type: "string" }, { name: "description", type: "string" }, { name: "lockupDuration", type: "uint256" }, { name: "expectedReturnBps", type: "uint256" }, { name: "underlyingAsset", type: "string" }, { name: "redemptionDate", type: "uint256" }, { name: "redemptionPrice", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "cap", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "subscribe", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [], name: "syncPrice", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "currentPrice", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "lastPriceUpdate", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "priceFeed", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
] as const;

const USER_PROFILE_ABI = [
  { inputs: [{ name: "_name", type: "string" }, { name: "_avatarURI", type: "string" }, { name: "_bio", type: "string" }], name: "setProfile", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_user", type: "address" }, { name: "_rating", type: "uint8" }, { name: "_comment", type: "string" }], name: "submitReview", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_user", type: "address" }], name: "getProfile", outputs: [{ name: "name", type: "string" }, { name: "avatarURI", type: "string" }, { name: "bio", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_user", type: "address" }], name: "getReviewCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_user", type: "address" }, { name: "_offset", type: "uint256" }, { name: "_limit", type: "uint256" }], name: "getReviews", outputs: [{ name: "tuple[]", type: "tuple[]", components: [{ name: "rating", type: "uint8" }, { name: "comment", type: "string" }, { name: "timestamp", type: "uint256" }] }], stateMutability: "view", type: "function" },
] as const;

function getChainKey(chainId: number): ChainKey | null {
  for (const [key, config] of Object.entries(CHAIN_CONFIG)) {
    if (config.id === chainId) return key as ChainKey;
  }
  return null;
}

export function useContracts() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { data: native } = useBalance({ address });

  const chainKey = getChainKey(chainId);
  const isCorrectChain = chainKey !== null;
  const chainName = chainKey ? CHAIN_CONFIG[chainKey].name : "Unsupported";
  const chainCurrency = chainKey ? CHAIN_CONFIG[chainKey].currency.symbol : "ETH";
  const explorer = chainKey ? CHAIN_CONFIG[chainKey].explorer : "";

  const addrs = chainKey ? CONTRACT_ADDRESSES[CHAIN_CONFIG[chainKey].id] : null;

  const digitalGoods = addrs?.digitalGoods ?? ("0x0000000000000000000000000000000000000000" as Address);
  const freelancerEscrow = addrs?.freelancerEscrow ?? ("0x0000000000000000000000000000000000000000" as Address);
  const digitalRWA = addrs?.digitalRWA ?? ("0x0000000000000000000000000000000000000000" as Address);
  const govToken = addrs?.govToken ?? ("0x0000000000000000000000000000000000000000" as Address);
  const feeDistributor = addrs?.feeDistributor ?? ("0x0000000000000000000000000000000000000000" as Address);
  const userProfile = addrs?.userProfile ?? ("0x0000000000000000000000000000000000000000" as Address);
  const mockUSDC = addrs?.mockUSDC ?? ("0x0000000000000000000000000000000000000000" as Address);
  const mockUSDT = addrs?.mockUSDT ?? ("0x0000000000000000000000000000000000000000" as Address);
  const mockXNOBT = addrs?.mockXNOBT ?? ("0x0000000000000000000000000000000000000000" as Address);
  const mockXBRT = addrs?.mockXBRT ?? ("0x0000000000000000000000000000000000000000" as Address);

  const { writeContractAsync } = useWriteContract();
  const write = (payload: Parameters<typeof writeContractAsync>[0]) =>
    writeContractAsync({ ...payload, chainId, connector } as any);

  return {
    address,
    isConnected,
    connector,
    isCorrectChain,
    chainId,
    chainKey,
    chainName,
    chainCurrency,
    explorer,
    balance: isCorrectChain && native ? formatUnits(native.value, native.decimals) : "0",

    digitalGoodsReady: isCorrectChain,
    digitalGoodsAddr: digitalGoods,
    digitalGoodsABI: DIGITAL_GOODS_ABI,
    buyListing: (id: number, value: string) =>
      write({ abi: DIGITAL_GOODS_ABI, address: digitalGoods, functionName: "buy", args: [BigInt(id)], value: parseUnits(value, 18) } as any),
    listFixed: (metadataURI: string, price: string, category: string, deliveryURI: string) =>
      write({ abi: DIGITAL_GOODS_ABI, address: digitalGoods, functionName: "listFixed", args: [metadataURI, parseUnits(price, 18), category, deliveryURI] } as any),
    listDutch: (metadataURI: string, startPrice: string, reservePrice: string, durationSec: bigint, category: string, deliveryURI: string) =>
      write({ abi: DIGITAL_GOODS_ABI, address: digitalGoods, functionName: "listDutch", args: [metadataURI, parseUnits(startPrice, 18), parseUnits(reservePrice, 18), durationSec, category, deliveryURI] } as any),
    buyWithTokenListing: (id: number, token: Address, amount: string) =>
      write({ abi: DIGITAL_GOODS_ABI, address: digitalGoods, functionName: "buyWithToken", args: [BigInt(id), token, parseUnits(amount, 18)] } as any),
    approveToken: (token: Address, spender: Address, amount: bigint) =>
      write({ abi: ERC20_ABI, address: token, functionName: "approve", args: [spender, amount] } as any),

    freelancerEscrowReady: isCorrectChain,
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

    rwaReady: isCorrectChain,
    rwaAddr: digitalRWA,
    rwaABI: RWA_ABI,
    mintRWA: (to: Address, amount: string) =>
      write({ abi: RWA_ABI, address: digitalRWA, functionName: "mint", args: [to, parseUnits(amount, 18)] } as any),
    setManualWhitelist: (account: Address, status: boolean) =>
      write({ abi: RWA_ABI, address: digitalRWA, functionName: "setManualWhitelist", args: [account, status] } as any),
    setWhitelistToken: (token: Address, minBalance: string) =>
      write({ abi: RWA_ABI, address: digitalRWA, functionName: "setWhitelistToken", args: [token, parseUnits(minBalance, 18)] } as any),

    userProfileReady: isCorrectChain,
    userProfileAddr: userProfile,
    userProfileABI: USER_PROFILE_ABI,
    setProfile: (name: string, avatarURI: string, bio: string) =>
      write({ abi: USER_PROFILE_ABI, address: userProfile, functionName: "setProfile", args: [name, avatarURI, bio] } as any),
    submitReview: (user: Address, rating: number, comment: string) =>
      write({ abi: USER_PROFILE_ABI, address: userProfile, functionName: "submitReview", args: [user, rating, comment] } as any),

    govTokenAddr: govToken,
    mockUSDCAddr: mockUSDC,
    mockUSDTAddr: mockUSDT,
    mockXNOBTAddr: mockXNOBT,
    mockXBRTAddr: mockXBRT,
  };
}
