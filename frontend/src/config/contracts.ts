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
    digitalGoods: "0x272475feaD659100E6DD8EBd8dB88E6f064DC112",
    freelancerEscrow: "0x6A08C1eE8102B41935a758b5E3093b075113E615",
    digitalRWA: "0x18dF08d96F303c6149a7f8CC4800BCa7fcAEB0Fd",
    govToken: "0x50915a301fF73278B3eaC09B42301abbC866F1Dc",
    feeDistributor: "0x754C549355215022453bDd9Cd19Cbc7b52B1E490",
    userProfile: "0xdd89E04e5bB9B79775A87Fa9666C5Fe03a01e169",
    mockUSDC: "0xfe50dA41BfC13e99E9276149D0b534609C39633E",
    mockUSDT: "0x635Ab939A2997eFDB42AD38F6A4919d8ae45b912",
    mockXNOBT: "0x4cEaa30839E3E463484c2D66900fdD6484022054",
    mockXBRT: "0xbA3B12F5633da2794c97CF330B19E510aE2BbB05",
  },
} as const;

export const DEFAULT_CHAIN = CHAIN_CONFIG.amoy.id;
