export const CHAIN_CONFIG = {
  amoy: {
    id: 80002,
    name: "Polygon Amoy",
    shortName: "Amoy",
    rpc: "https://rpc-amoy.polygon.technology/",
    explorer: "https://amoy.polygonscan.com",
    currency: { name: "POL", symbol: "POL", decimals: 18 },
  },
  baseSepolia: {
    id: 84532,
    name: "Base Sepolia",
    shortName: "Base",
    rpc: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    currency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockscout: "https://base-sepolia.blockscout.com",
  },
  arbitrumSepolia: {
    id: 421614,
    name: "Arbitrum Sepolia",
    shortName: "Arbitrum",
    rpc: "https://sepolia-rollup.arbitrum.io/rpc",
    explorer: "https://sepolia.arbiscan.io",
    currency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockscout: "https://arbitrum-sepolia.blockscout.com",
  },
} as const;

export type ChainKey = keyof typeof CHAIN_CONFIG;
export const SUPPORTED_CHAIN_IDS = Object.values(CHAIN_CONFIG).map(c => c.id) as readonly number[];

export const CONTRACT_ADDRESSES: Record<number, {
  digitalGoods: `0x${string}`;
  freelancerEscrow: `0x${string}`;
  digitalRWA: `0x${string}`;
  govToken: `0x${string}`;
  feeDistributor: `0x${string}`;
  userProfile: `0x${string}`;
  mockUSDC: `0x${string}`;
  mockUSDT: `0x${string}`;
  mockXNOBT: `0x${string}`;
  mockXBRT: `0x${string}`;
}> = {
  // Polygon Amoy
  [CHAIN_CONFIG.amoy.id]: {
    digitalGoods: "0xcc5f9C02cD093002cE3921180e32f76cE03F01C0",
    freelancerEscrow: "0x6baEA890Ef24F1e2dc9A5f46E7e0aeD2516BC518",
    digitalRWA: "0x88fB6Ae65B2c6011F4dE243BbDa100dC57Cd5FE5",
    govToken: "0x5582496273a71E60e457D19773050CC848A2F52C",
    feeDistributor: "0xa1889d658601c7fA649a70516341fF4aac761ca8",
    userProfile: "0x4012A59428C8A4b7f5D2ad8C0572e1da6060440c",
    mockUSDC: "0x3944f16c03892de837f9C18Dab752Cd09dF113eF",
    mockUSDT: "0x0061E989c93c38aAd363a86e1AD66875A93226d7",
    mockXNOBT: "0x301C0CD35e76Ae3956f6410b46D2aD0E3f60Bd5B",
    mockXBRT: "0xAe743AC8eBE1fe05114bB82F68b51A9a2BabD9Df",
  },
  // Base Sepolia
  [CHAIN_CONFIG.baseSepolia.id]: {
    digitalGoods: "0xf22e65B24B3236B6B4983e81792541139Df6e3Dc",
    freelancerEscrow: "0x7928BE357160d31B6ab378D0566Ce360BE0228B0",
    digitalRWA: "0x13A40Cea2156984B54fd337c51B6a5B47d569C2C",
    govToken: "0xe7bFE19CeEd30871d50394E0c7C0b3b647aa85A0",
    feeDistributor: "0x6AE0E1bBE014D222417eF3A350088A0204Ed9bF4",
    userProfile: "0x727B3915A7048a43814e4BD8Ac6c48269796c551",
    mockUSDC: "0x9F52847AFaaB2504c560bC6c098b3D81772fa8C6",
    mockUSDT: "0x5c6F85EdcCC12E4B0c096bd002fD27699B7Ae740",
    mockXNOBT: "0xD5De2C3f68ab67ccD2556ED976AE3d591c757a6d",
    mockXBRT: "0xCF1295f1f4F72eD6A2289EACc13673C53a5Ef865",
  },
  // Arbitrum Sepolia
  [CHAIN_CONFIG.arbitrumSepolia.id]: {
    digitalGoods: "0x479832CE889A41d57b8f9ACb3E191F08eA6e5856",
    freelancerEscrow: "0xB0aAcF8b6345f3342781d1A3D995D84375DB7d8E",
    digitalRWA: "0xB2a759C6FB0076FBBe3EEae20975537a999091bA",
    govToken: "0x13A40Cea2156984B54fd337c51B6a5B47d569C2C",
    feeDistributor: "0x93b1152F710d325154bF7A095c7509DA173DA25F",
    userProfile: "0x812b404524EaFA0540C4BE773a14176bdFdC1B7E",
    mockUSDC: "0x917E41b870708dea08Ab237E153ad72aF62FFc34",
    mockUSDT: "0x44E54c3F5B30e3a7D53c1cab71b99dFCC764eB9b",
    mockXNOBT: "0x692cCC86f47A0277a1550aB81BB954f39a01820E",
    mockXBRT: "0x8Eef8aD9d3951F6AbdB27d65299F3949E43FAe20",
  },
} as const;

export const DEFAULT_CHAIN = CHAIN_CONFIG.amoy.id;
