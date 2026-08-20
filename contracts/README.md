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
| MockGovernanceToken | `0xe7bFE19CeEd30871d50394E0c7C0b3b647aa85A0` | [View](https://sepolia.basescan.org/address/0xe7bFE19CeEd30871d50394E0c7C0b3b647aa85A0#code) |
| FeeDistributor | `0x6AE0E1bBE014D222417eF3A350088A0204Ed9bF4` | [View](https://sepolia.basescan.org/address/0x6AE0E1bBE014D222417eF3A350088A0204Ed9bF4#code) |
| DigitalGoods | `0xf22e65B24B3236B6B4983e81792541139Df6e3Dc` | [View](https://sepolia.basescan.org/address/0xf22e65B24B3236B6B4983e81792541139Df6e3Dc#code) |
| FreelancerEscrow | `0x7928BE357160d31B6ab378D0566Ce360BE0228B0` | [View](https://sepolia.basescan.org/address/0x7928BE357160d31B6ab378D0566Ce360BE0228B0#code) |
| DigitalRWA | `0x13A40Cea2156984B54fd337c51B6a5B47d569C2C` | [View](https://sepolia.basescan.org/address/0x13A40Cea2156984B54fd337c51B6a5B47d569C2C#code) |
| UserProfile | `0x727B3915A7048a43814e4BD8Ac6c48269796c551` | [View](https://sepolia.basescan.org/address/0x727B3915A7048a43814e4BD8Ac6c48269796c551#code) |
| Mock USDC | `0x9F52847AFaaB2504c560bC6c098b3D81772fa8C6` | [View](https://sepolia.basescan.org/address/0x9F52847AFaaB2504c560bC6c098b3D81772fa8C6#code) |
| Mock USDT | `0x5c6F85EdcCC12E4B0c096bd002fD27699B7Ae740` | [View](https://sepolia.basescan.org/address/0x5c6F85EdcCC12E4B0c096bd002fD27699B7Ae740#code) |
| Mock xNOBT | `0xD5De2C3f68ab67ccD2556ED976AE3d591c757a6d` | [View](https://sepolia.basescan.org/address/0xD5De2C3f68ab67ccD2556ED976AE3d591c757a6d#code) |
| Mock xBRT | `0xCF1295f1f4F72eD6A2289EACc13673C53a5Ef865` | [View](https://sepolia.basescan.org/address/0xCF1295f1f4F72eD6A2289EACc13673C53a5Ef865#code) |

**Chainlink ETH/USD (Base Sepolia):** `0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1`

## Deployed — Arbitrum Sepolia (421614)

| Contract | Address | Explorer |
|----------|---------|----------|
| MockGovernanceToken | `0x13A40Cea2156984B54fd337c51B6a5B47d569C2C` | [View](https://sepolia.arbiscan.io/address/0x13A40Cea2156984B54fd337c51B6a5B47d569C2C#code) |
| FeeDistributor | `0x93b1152F710d325154bF7A095c7509DA173DA25F` | [View](https://sepolia.arbiscan.io/address/0x93b1152F710d325154bF7A095c7509DA173DA25F#code) |
| DigitalGoods | `0x479832CE889A41d57b8f9ACb3E191F08eA6e5856` | [View](https://sepolia.arbiscan.io/address/0x479832CE889A41d57b8f9ACb3E191F08eA6e5856#code) |
| FreelancerEscrow | `0xB0aAcF8b6345f3342781d1A3D995D84375DB7d8E` | [View](https://sepolia.arbiscan.io/address/0xB0aAcF8b6345f3342781d1A3D995D84375DB7d8E#code) |
| DigitalRWA | `0xB2a759C6FB0076FBBe3EEae20975537a999091bA` | [View](https://sepolia.arbiscan.io/address/0xB2a759C6FB0076FBBe3EEae20975537a999091bA#code) |
| UserProfile | `0x812b404524EaFA0540C4BE773a14176bdFdC1B7E` | [View](https://sepolia.arbiscan.io/address/0x812b404524EaFA0540C4BE773a14176bdFdC1B7E#code) |
| Mock USDC | `0x917E41b870708dea08Ab237E153ad72aF62FFc34` | [View](https://sepolia.arbiscan.io/address/0x917E41b870708dea08Ab237E153ad72aF62FFc34#code) |
| Mock USDT | `0x44E54c3F5B30e3a7D53c1cab71b99dFCC764eB9b` | [View](https://sepolia.arbiscan.io/address/0x44E54c3F5B30e3a7D53c1cab71b99dFCC764eB9b#code) |
| Mock xNOBT | `0x692cCC86f47A0277a1550aB81BB954f39a01820E` | [View](https://sepolia.arbiscan.io/address/0x692cCC86f47A0277a1550aB81BB954f39a01820E#code) |
| Mock xBRT | `0x8Eef8aD9d3951F6AbdB27d65299F3949E43FAe20` | [View](https://sepolia.arbiscan.io/address/0x8Eef8aD9d3951F6AbdB27d65299F3949E43FAe20#code) |

**Chainlink ETH/USD (Arb Sepolia):** `0x26dA680D98e805D54f0934f46b4669149c14d1cA`

## Deployed — Polygon Amoy (80002)

| Contract | Address | Explorer |
|----------|---------|----------|
| MockGovernanceToken | `0x5582496273a71E60e457D19773050CC848A2F52C` | [View](https://amoy.polygonscan.com/address/0x5582496273a71E60e457D19773050CC848A2F52C) |
| FeeDistributor | `0xa1889d658601c7fA649a70516341fF4aac761ca8` | [View](https://amoy.polygonscan.com/address/0xa1889d658601c7fA649a70516341fF4aac761ca8) |
| DigitalGoods | `0xcc5f9C02cD093002cE3921180e32f76cE03F01C0` | [View](https://amoy.polygonscan.com/address/0xcc5f9C02cD093002cE3921180e32f76cE03F01C0) |
| FreelancerEscrow | `0x6baEA890Ef24F1e2dc9A5f46E7e0aeD2516BC518` | [View](https://amoy.polygonscan.com/address/0x6baEA890Ef24F1e2dc9A5f46E7e0aeD2516BC518) |
| DigitalRWA | `0x88fB6Ae65B2c6011F4dE243BbDa100dC57Cd5FE5` | [View](https://amoy.polygonscan.com/address/0x88fB6Ae65B2c6011F4dE243BbDa100dC57Cd5FE5) |
| UserProfile | `0x4012A59428C8A4b7f5D2ad8C0572e1da6060440c` | [View](https://amoy.polygonscan.com/address/0x4012A59428C8A4b7f5D2ad8C0572e1da6060440c) |
| Mock USDC | `0x3944f16c03892de837f9C18Dab752Cd09dF113eF` | [View](https://amoy.polygonscan.com/address/0x3944f16c03892de837f9C18Dab752Cd09dF113eF) |
| Mock USDT | `0x0061E989c93c38aAd363a86e1AD66875A93226d7` | [View](https://amoy.polygonscan.com/address/0x0061E989c93c38aAd363a86e1AD66875A93226d7) |
| Mock xNOBT | `0x301C0CD35e76Ae3956f6410b46D2aD0E3f60Bd5B` | [View](https://amoy.polygonscan.com/address/0x301C0CD35e76Ae3956f6410b46D2aD0E3f60Bd5B) |
| Mock xBRT | `0xAe743AC8eBE1fe05114bB82F68b51A9a2BabD9Df` | [View](https://amoy.polygonscan.com/address/0xAe743AC8eBE1fe05114bB82F68b51A9a2BabD9Df) |

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
