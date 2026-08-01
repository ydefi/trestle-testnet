# Trestle DeFi — Smart Contracts

Hardhat project with Solidity smart contracts for the Trestle DeFi Marketplace.

## Contracts

| Contract | Description | Security |
|----------|-------------|----------|
| `DigitalRWA.sol` | RWA tokenization — Chainlink price feed, USDC-gated whitelist, mint/subscribe | nonReentrant, custom errors, zero-address guards |
| `DigitalGoods.sol` | Marketplace — fixed-price + Dutch auction, delivery flow, dispute resolution | Custom errors, zero-address validation |
| `FreelancerEscrow.sol` | Freelance escrow — fixed/Dutch budget, milestones, gig marketplace, auto-approve | nonReentrant on all state-changing functions, custom errors |
| `FeeDistributor.sol` | 40/40/20 fee split (treasury/yield/buyback-burn), ETH + ERC20 | Custom errors |
| `UserProfile.sol` | On-chain profiles + token-gated reviews with cooldown | Custom errors, zero-address guard |
| `MockGovernanceToken.sol` | ERC-20 governance token (tGOV) for whitelisting | Used by DigitalRWA |
| `MockERC20.sol` | Generic mock ERC-20 for testing (USDC, USDT, xNOBT, xBRT) | — |

## Deployed — Base Sepolia (84532)

| Contract | Address | Explorer |
|----------|---------|----------|
| MockGovernanceToken | `0x9eD90e296D078Ec4621Dc18d4737dDe951551c88` | [View](https://sepolia.basescan.org/address/0x9eD90e296D078Ec4621Dc18d4737dDe951551c88#code) |
| FeeDistributor | `0x1199e771BC3CB847FBd27362b65b74879E7D979D` | [View](https://sepolia.basescan.org/address/0x1199e771BC3CB847FBd27362b65b74879E7D979D#code) |
| DigitalGoods | `0x28f00E0CAaC46D2A2EEBB47A5B8A141bAcCe9963` | [View](https://sepolia.basescan.org/address/0x28f00E0CAaC46D2A2EEBB47A5B8A141bAcCe9963#code) |
| FreelancerEscrow | `0x686C4711a35633479F3Fed0D83b34DA63878CA00` | [View](https://sepolia.basescan.org/address/0x686C4711a35633479F3Fed0D83b34DA63878CA00#code) |
| DigitalRWA | `0xE8FC7AbF3F4B95A2843C879F894AF6B9d8D297cC` | [View](https://sepolia.basescan.org/address/0xE8FC7AbF3F4B95A2843C879F894AF6B9d8D297cC#code) |
| UserProfile | `0x976c6D9F4544E0b2f471698AdaeF54777C6FA3D2` | [View](https://sepolia.basescan.org/address/0x976c6D9F4544E0b2f471698AdaeF54777C6FA3D2#code) |
| Mock USDC | `0x27fcAdD5142ECB1b6FC13314a2bDfB71dC92CeF3` | [View](https://sepolia.basescan.org/address/0x27fcAdD5142ECB1b6FC13314a2bDfB71dC92CeF3#code) |
| Mock USDT | `0xc0D3bf40b488339cbBD55a3fE9167233682d2a27` | [View](https://sepolia.basescan.org/address/0xc0D3bf40b488339cbBD55a3fE9167233682d2a27#code) |
| Mock xNOBT | `0xf4Fef25b23171586E8C87994B8f3D1a3AfCe4c71` | [View](https://sepolia.basescan.org/address/0xf4Fef25b23171586E8C87994B8f3D1a3AfCe4c71#code) |
| Mock xBRT | `0x5DA85b68886d1fB7948C3eb5E7Ec0EB0E9B38B0f` | [View](https://sepolia.basescan.org/address/0x5DA85b68886d1fB7948C3eb5E7Ec0EB0E9B38B0f#code) |

**Chainlink ETH/USD (Base Sepolia):** `0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1`

## Deployed — Arbitrum Sepolia (421614)

| Contract | Address | Explorer |
|----------|---------|----------|
| MockGovernanceToken | `0xb9e8EB95E725bd80c2397c5796A1B7EB060D4ae7` | [View](https://sepolia.arbiscan.io/address/0xb9e8EB95E725bd80c2397c5796A1B7EB060D4ae7#code) |
| FeeDistributor | `0xE8FC7AbF3F4B95A2843C879F894AF6B9d8D297cC` | [View](https://sepolia.arbiscan.io/address/0xE8FC7AbF3F4B95A2843C879F894AF6B9d8D297cC#code) |
| DigitalGoods | `0xe7bFE19CeEd30871d50394E0c7C0b3b647aa85A0` | [View](https://sepolia.arbiscan.io/address/0xe7bFE19CeEd30871d50394E0c7C0b3b647aa85A0#code) |
| FreelancerEscrow | `0x6AE0E1bBE014D222417eF3A350088A0204Ed9bF4` | [View](https://sepolia.arbiscan.io/address/0x6AE0E1bBE014D222417eF3A350088A0204Ed9bF4#code) |
| DigitalRWA | `0xCF1295f1f4F72eD6A2289EACc13673C53a5Ef865` | [View](https://sepolia.arbiscan.io/address/0xCF1295f1f4F72eD6A2289EACc13673C53a5Ef865#code) |
| UserProfile | `0xf22e65B24B3236B6B4983e81792541139Df6e3Dc` | [View](https://sepolia.arbiscan.io/address/0xf22e65B24B3236B6B4983e81792541139Df6e3Dc#code) |
| Mock USDC | `0x7928BE357160d31B6ab378D0566Ce360BE0228B0` | [View](https://sepolia.arbiscan.io/address/0x7928BE357160d31B6ab378D0566Ce360BE0228B0#code) |
| Mock USDT | `0x727B3915A7048a43814e4BD8Ac6c48269796c551` | [View](https://sepolia.arbiscan.io/address/0x727B3915A7048a43814e4BD8Ac6c48269796c551#code) |
| Mock xNOBT | `0x9F52847AFaaB2504c560bC6c098b3D81772fa8C6` | [View](https://sepolia.arbiscan.io/address/0x9F52847AFaaB2504c560bC6c098b3D81772fa8C6#code) |
| Mock xBRT | `0x5c6F85EdcCC12E4B0c096bd002fD27699B7Ae740` | [View](https://sepolia.arbiscan.io/address/0x5c6F85EdcCC12E4B0c096bd002fD27699B7Ae740#code) |

**Chainlink ETH/USD (Arb Sepolia):** `0x26dA680D98e805D54f0934f46b4669149c14d1cA`

## Deployed — Polygon Amoy (80002)

| Contract | Address | Explorer |
|----------|---------|----------|
| MockGovernanceToken | `0x556f8e6dc3cb93b2bf74587b6750dff61918eaab` | [View](https://www.oklink.com/amoy/address/0x556f8e6dc3cb93b2bf74587b6750dff61918eaab) |
| FeeDistributor | `0xC878166Bc446cb6Db91Dc55e9CcD1405834bc06B` | [View](https://www.oklink.com/amoy/address/0xC878166Bc446cb6Db91Dc55e9CcD1405834bc06B) |
| DigitalGoods | `0x612B5dda1BCBe17Dff554bb446A8018a574DBe37` | [View](https://www.oklink.com/amoy/address/0x612B5dda1BCBe17Dff554bb446A8018a574DBe37) |
| FreelancerEscrow | `0xBF4588E207c2191Ee9D3f114370a6dbf4BACFFf3` | [View](https://www.oklink.com/amoy/address/0xBF4588E207c2191Ee9D3f114370a6dbf4BACFFf3) |
| DigitalRWA | `0x89f5394a468343F405285040664Fd77843D2a2e6` | [View](https://www.oklink.com/amoy/address/0x89f5394a468343F405285040664Fd77843D2a2e6) |
| UserProfile | `0xe5665d1D2F180D27d328acCBB83f5fBE32A6666A` | [View](https://www.oklink.com/amoy/address/0xe5665d1D2F180D27d328acCBB83f5fBE32A6666A) |
| Mock USDC | `0xb0a742a2302B043718b60053b135dC432C892852` | [View](https://www.oklink.com/amoy/address/0xb0a742a2302B043718b60053b135dC432C892852) |
| Mock USDT | `0x432aCe196DFD335396257e0CDF33B3f815b6fF0B` | [View](https://www.oklink.com/amoy/address/0x432aCe196DFD335396257e0CDF33B3f815b6fF0B) |
| Mock xNOBT | `0x4710d00AC3C2B6d0375F762076BDCE5ef835E64f` | [View](https://www.oklink.com/amoy/address/0x4710d00AC3C2B6d0375F762076BDCE5ef835E64f) |
| Mock xBRT | `0xc550F40566C2aFEe6980aC3d64b9B3A2A0B8b914` | [View](https://www.oklink.com/amoy/address/0xc550F40566C2aFEe6980aC3d64b9B3A2A0B8b914) |

**Chainlink ETH/USD (Polygon Amoy):** `0x001382149eBa3441043c1c66972b4772963f5D43`

## Supported Networks

| Network | Chain ID | Native | RPC | Status |
|---------|----------|--------|-----|--------|
| Polygon Amoy | 80002 | POL | `https://rpc-amoy.polygon.technology/` | Deployed |
| Base Sepolia | 84532 | ETH | `https://sepolia.base.org` | Deployed |
| Arbitrum Sepolia | 421614 | ETH | `https://sepolia-rollup.arbitrum.io/rpc` | Deployed |
| Polygon PoS | 137 | POL | `https://polygon-rpc.com/` | Configured |
| Base Mainnet | 8453 | ETH | `https://mainnet.base.org` | Configured |
| Arbitrum One | 42161 | ETH | `https://arb1.arbitrum.io/rpc` | Configured |

## Setup

```bash
npm install
cp .env.example .env   # add PRIVATE_KEY, RPC URLs, ETHERSCAN_API_KEY
npx hardhat compile
npx hardhat test
```

## Deploy

```bash
# Deploy to Base Sepolia
npx hardhat run scripts/deploy_v2.js --network baseSepolia

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy_v2.js --network arbitrumSepolia

# Deploy to Polygon Amoy
npx hardhat run scripts/deploy_v2.js --network amoy

# Deploy to Base Mainnet
npx hardhat run scripts/deploy_v2.js --network base
```

The deploy script auto-detects chain ID and selects the correct:
- Native token symbol (ETH / POL)
- Chainlink ETH/USD price feed address
- Block explorer for verification

## Security

- `nonReentrant` on all external state-changing functions (FreelancerEscrow, DigitalRWA.syncPrice)
- Custom errors instead of require strings (gas-efficient)
- Zero-address validation in constructors
- Access control via `Ownable` + `AccessControl` roles
- Pausable contracts (DigitalRWA)
- Token-gated whitelist (DigitalRWA — requires USDC balance, swappable via `setWhitelistToken()`)

## Architecture

```
contracts/
├── src/
│   ├── DigitalRWA.sol          # RWA tokenization + Chainlink oracle
│   ├── DigitalGoods.sol        # Marketplace (fixed + Dutch auction)
│   ├── FreelancerEscrow.sol    # Freelance escrow + gig marketplace
│   ├── FeeDistributor.sol      # 40/40/20 fee split
│   ├── UserProfile.sol         # On-chain profiles + reviews
│   └── mocks/
│       ├── MockGovernanceToken.sol
│       ├── MockERC20.sol
│       └── MockV3Aggregator.sol
├── scripts/
│   ├── deploy_v2.js            # Multi-chain deploy (auto-detect chain)
│   ├── deploy_all.js           # Lightweight deploy (5 contracts)
│   └── deploy.js               # Full deploy with mock stablecoins
├── test/
│   ├── Heavy.test.js           # 91 security-focused tests
│   └── TrestleProtocol.test.js # 37 integration tests
└── hardhat.config.js           # Multi-network config
```
