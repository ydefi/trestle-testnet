# Security Audit — Trestle Protocol

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
| MockGovernanceToken (xGOV) | `0x556f8e6dc3cb93b2bf74587b6750dff61918eaab` |
| FeeDistributor | `0xC878166Bc446cb6Db91Dc55e9CcD1405834bc06B` |
| DigitalGoods | `0x612B5dda1BCBe17Dff554bb446A8018a574DBe37` |
| FreelancerEscrow | `0xBF4588E207c2191Ee9D3f114370a6dbf4BACFFf3` |
| DigitalRWA | `0x89f5394a468343F405285040664Fd77843D2a2e6` |
| UserProfile | `0xe5665d1D2F180D27d328acCBB83f5fBE32A6666A` |
| Mock USDC | `0xb0a742a2302B043718b60053b135dC432C892852` |
| Mock USDT | `0x432aCe196DFD335396257e0CDF33B3f815b6fF0B` |
| Mock xNOBT | `0x4710d00AC3C2B6d0375F762076BDCE5ef835E64f` |
| Mock xBRT | `0xc550F40566C2aFEe6980aC3d64b9B3A2A0B8b914` |

## Contract Addresses (Base Sepolia Testnet)

| Contract | Address |
|----------|---------|
| MockGovernanceToken (xGOV) | `0x9eD90e296D078Ec4621Dc18d4737dDe951551c88` |
| FeeDistributor | `0x1199e771BC3CB847FBd27362b65b74879E7D979D` |
| DigitalGoods | `0x28f00E0CAaC46D2A2EEBB47A5B8A141bAcCe9963` |
| FreelancerEscrow | `0x686C4711a35633479F3Fed0D83b34DA63878CA00` |
| DigitalRWA | `0xE8FC7AbF3F4B95A2843C879F894AF6B9d8D297cC` |
| UserProfile | `0x976c6D9F4544E0b2f471698AdaeF54777C6FA3D2` |
| Mock USDC | `0x27fcAdD5142ECB1b6FC13314a2bDfB71dC92CeF3` |
| Mock USDT | `0xc0D3bf40b488339cbBD55a3fE9167233682d2a27` |
| Mock xNOBT | `0xf4Fef25b23171586E8C87994B8f3D1a3AfCe4c71` |
| Mock xBRT | `0x5DA85b68886d1fB7948C3eb5E7Ec0EB0E9B38B0f` |

## Contract Addresses (Arbitrum Sepolia Testnet)

| Contract | Address |
|----------|---------|
| MockGovernanceToken (xGOV) | `0xb9e8EB95E725bd80c2397c5796A1B7EB060D4ae7` |
| FeeDistributor | `0xE8FC7AbF3F4B95A2843C879F894AF6B9d8D297cC` |
| DigitalGoods | `0xe7bFE19CeEd30871d50394E0c7C0b3b647aa85A0` |
| FreelancerEscrow | `0x6AE0E1bBE014D222417eF3A350088A0204Ed9bF4` |
| DigitalRWA | `0xCF1295f1f4F72eD6A2289EACc13673C53a5Ef865` |
| UserProfile | `0xf22e65B24B3236B6B4983e81792541139Df6e3Dc` |
| Mock USDC | `0x7928BE357160d31B6ab378D0566Ce360BE0228B0` |
| Mock USDT | `0x727B3915A7048a43814e4BD8Ac6c48269796c551` |
| Mock xNOBT | `0x9F52847AFaaB2504c560bC6c098b3D81772fa8C6` |
| Mock xBRT | `0x5c6F85EdcCC12E4B0c096bd002fD27699B7Ae740` |

Always verify addresses on Polygonscan (Amoy) before interacting.
