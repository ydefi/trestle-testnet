# Security Audit — Trestle DeFi
# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it privately via **contact@trestle.website**. Do not open public GitHub issues for security bugs.

## Bug Bounty

We run a bug bounty program with tiered rewards. All hNOBT rewards are 10× the base rate.

**To claim rewards:** Join [reward.trestle.website](https://reward.trestle.website), submit your vulnerability report, and complete verification.

### Submission Format

1. **Vulnerability Title**
2. **Steps to Reproduce**
3. **Proof of Concept** (Amoy Testnet tx hash or code)

### Response Timeline

- Acknowledgement: 48 hours
- Triage: 7 days
- Reward: 14 days after validation

### Reward Tiers

| Severity | Target Systems & Scope | hNOBT Reward | xGov Reward | Payout Release |
|----------|------------------------|--------------|-------------|----------------|
| 🔴 **Critical (S1)** | • Escrow protocol bypassing vectors.<br>• Dutch Auction pricing or clearing logic exploits.<br>• Wallet-draining smart contract flaws. | 100,000 hNOBT | 2,500 xGov | **Instant Release** *(Within 48 hours of patch)* |
| 🔥 **High (S2)** | • Deadlocked contract states.<br>• Transaction verification loop failures.<br>• Telegram Mini-App backend API manipulation. | 50,000 hNOBT | 1,000 xGov | **7-Day Security Hold** |
| ⚡ **Medium (S3)** | • RPC node desynchronization errors.<br>• App state integration dropping inside Telegram.<br>• Incorrect event emission configurations. | 20,000 hNOBT | 250 xGov | **14-Day Processing Cycle** |
| 🟡 **Low (S4)** | • Text typos in documentation.<br>• Layout shifting/cropping inside webviews.<br>• UI styling/cosmetic discrepancies. | 2,500 hNOBT | 0 xGov | **End of Testnet Phase** |

### Sybil-Defense Rules

1. **Proof-of-Concept Requirement:** No S1, S2, or S3 bug bounty points will be logged without an accompanying active **Polygon Amoy Testnet Transaction Hash** or a valid, reproducible local code fork.

2. **Retention Rule:** Growth referrals are only counted if the incoming users pass Trestle Telegram/Discord captcha gate and stay active for at least 72 hours.

3. **Multi-Account Rule:** If two different profiles (e.g., Joe and Cress) submit identical bugs or referral lists, the payout is split 50/50 or canceled entirely pending identity verification.

### Payout Options

Join [reward.trestle.website](https://reward.trestle.website) to validate and claim rewards. Two options:

| Option | Requirements | Bug Bounty Payout |
|--------|-------------|-------------------|
| **A: Full Reward** | Stage 1 (Gitcoin Passport + Accounts) + Stage 2 (Biometric) | **100% hNOBT + 100% xGov** |
| **B: Early Withdrawal** | Stage 1 (Gitcoin Passport + Accounts) only | **50% hNOBT + 0 xGov** |


## Scope

**In-scope:**
- Smart contracts (Solidity 0.8.28) — FreelancerEscrow, DigitalGoods, DigitalRWA, FeeDistributor, UserProfile, MockGovernanceToken, MockERC20
- Frontend (Next.js + wagmi) — useContracts, web3 config, Marketplace/Freelance/RWA views
- Deploy scripts (Hardhat)

**Out-of-scope:**
- UI/UX, missing features, third-party integrations, social engineering, private/internal code

## Contract Addresses (Polygon Amoy Testnet)

| Contract | Address |
|----------|---------|
| MockGovernanceToken (xGOV) | `0x5582496273a71E60e457D19773050CC848A2F52C` |
| FeeDistributor | `0xa1889d658601c7fA649a70516341fF4aac761ca8` |
| DigitalGoods | `0xcc5f9C02cD093002cE3921180e32f76cE03F01C0` |
| FreelancerEscrow | `0x6baEA890Ef24F1e2dc9A5f46E7e0aeD2516BC518` |
| DigitalRWA | `0x88fB6Ae65B2c6011F4dE243BbDa100dC57Cd5FE5` |
| UserProfile | `0x4012A59428C8A4b7f5D2ad8C0572e1da6060440c` |
| Mock USDC | `0x3944f16c03892de837f9C18Dab752Cd09dF113eF` |
| Mock USDT | `0x0061E989c93c38aAd363a86e1AD66875A93226d7` |
| Mock xNOBT | `0x301C0CD35e76Ae3956f6410b46D2aD0E3f60Bd5B` |
| Mock xBRT | `0xAe743AC8eBE1fe05114bB82F68b51A9a2BabD9Df` |

## Contract Addresses (Base Sepolia Testnet)

| Contract | Address |
|----------|---------|
| MockGovernanceToken (xGOV) | `0xe7bFE19CeEd30871d50394E0c7C0b3b647aa85A0` |
| FeeDistributor | `0x6AE0E1bBE014D222417eF3A350088A0204Ed9bF4` |
| DigitalGoods | `0xf22e65B24B3236B6B4983e81792541139Df6e3Dc` |
| FreelancerEscrow | `0x7928BE357160d31B6ab378D0566Ce360BE0228B0` |
| DigitalRWA | `0x13A40Cea2156984B54fd337c51B6a5B47d569C2C` |
| UserProfile | `0x727B3915A7048a43814e4BD8Ac6c48269796c551` |
| Mock USDC | `0x9F52847AFaaB2504c560bC6c098b3D81772fa8C6` |
| Mock USDT | `0x5c6F85EdcCC12E4B0c096bd002fD27699B7Ae740` |
| Mock xNOBT | `0xD5De2C3f68ab67ccD2556ED976AE3d591c757a6d` |
| Mock xBRT | `0xCF1295f1f4F72eD6A2289EACc13673C53a5Ef865` |

## Contract Addresses (Arbitrum Sepolia Testnet)

| Contract | Address |
|----------|---------|
| MockGovernanceToken (xGOV) | `0x13A40Cea2156984B54fd337c51B6a5B47d569C2C` |
| FeeDistributor | `0x93b1152F710d325154bF7A095c7509DA173DA25F` |
| DigitalGoods | `0x479832CE889A41d57b8f9ACb3E191F08eA6e5856` |
| FreelancerEscrow | `0xB0aAcF8b6345f3342781d1A3D995D84375DB7d8E` |
| DigitalRWA | `0xB2a759C6FB0076FBBe3EEae20975537a999091bA` |
| UserProfile | `0x812b404524EaFA0540C4BE773a14176bdFdC1B7E` |
| Mock USDC | `0x917E41b870708dea08Ab237E153ad72aF62FFc34` |
| Mock USDT | `0x44E54c3F5B30e3a7D53c1cab71b99dFCC764eB9b` |
| Mock xNOBT | `0x692cCC86f47A0277a1550aB81BB954f39a01820E` |
| Mock xBRT | `0x8Eef8aD9d3951F6AbdB27d65299F3949E43FAe20` |

Always verify addresses on Polygonscan (Amoy) before interacting.
