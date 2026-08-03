<<<<<<< HEAD
# Trestle TMA — Telegram Mini App

**Legal Disclaimer:** Trestle DeFi (trestle.website) is an independent Web3 ecosystem. We are not affiliated with the Celestia-based "Trestle Protocol" bridge project or any of its subsidiaries.

## Overview

Telegram Mini App for Trestle DeFi — unified interface for testnet + reward hub.

- **Dashboard**: Reward stats, chain status, quick actions
- **Marketplace**: Browse/buy digital goods across testnets + mainnet
- **Tasks**: Complete tasks to earn hNOBT points
- **Bug Bounty**: Report vulnerabilities, earn rewards
- **Stake**: Lock hNOBT, earn yield
- **Verify**: Biometric + passport verification

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 5, TypeScript, Tailwind CSS |
| Wallet | Reown AppKit + Wagmi |
| Telegram | @telegram-apps/sdk v2 |
| Backend | Cloudflare Worker (Hono) + D1 + KV + AI |
| Chains | Polygon Mainnet, Polygon Amoy, Base Sepolia, Arbitrum Sepolia |

## Structure

```
trestle-tma/
├── frontend/          # Vite React app (deployed via CF Pages)
│   ├── src/
│   │   ├── pages/     # Dashboard, Marketplace, Tasks, Bounty, Staking, Verify, Withdraw
│   │   ├── hooks/     # useContracts, useAuth, useTelegram, useTelegramLink
│   │   ├── lib/       # api, astra, vault, reward, testnet
│   │   └── components/
│   └── public/avatars/
└── worker/            # Cloudflare Worker (vault.trestle.website)
    └── src/           # index.js, vault.js, provider.js, log.js
```

## Setup

```bash
# Frontend
cd frontend
cp .env .env.local    # fill in WalletConnect project ID
npm install
npm run dev

# Worker
cd worker
npm install
npx wrangler dev
```

## Deploy

- **Frontend**: Push to `main` → GitHub Actions → Cloudflare Pages
- **Worker**: `npx wrangler deploy`

## API Endpoints

| Service | URL |
|---------|-----|
| Reward API | `https://reward-api.trestle.website` |
| Testnet API | `https://testnet-api.trestle.website` |
| Vault Worker | `https://vault.trestle.website` |
=======
# testnet.trestle.website

Testnet platform for Trestle DeFi. Smart contracts deployed on Polygon Amoy (Chain ID: 80002), with a React/Vite frontend.

## Features

- **Dashboard** - Wallet connection and balance display
- **Marketplace** - Browse and trade digital assets (coming soon)
- **RWA** - Real-world asset tokenization with KYC verification
- **Wallet** - Withdraw functionality

## Smart Contracts (Amoy Testnet)

| Contract | Address (env var) | Purpose |
|----------|-----------------|---------|
| MarketplaceCore | `VITE_MARKETPLACE_CORE` | Digital asset marketplace |
| DigitalRWA | `VITE_DIGITAL_RWA` | RWA tokenization |
| DigitalGoods | `VITE_DIGITAL_GOODS` | Digital goods registry |
| FreelancerEscrow | `VITE_FREELANCER_ESCROW` | Freelance payment escrow |
| AIDisputeResolver | `VITE_AI_DISPUTE` | AI-powered dispute resolution |
| FeeDistributor | `VITE_FEE_DISTRIBUTOR` | Protocol fee distribution |

## Environment Variables

```bash
# Required - WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Contract addresses (deployed on Amoy testnet)
VITE_MARKETPLACE_CORE=0x...
VITE_DIGITAL_RWA=0x...
VITE_DIGITAL_GOODS=0x...
VITE_FREELANCER_ESCROW=0x...
VITE_AI_DISPUTE=0x...
VITE_FEE_DISTRIBUTOR=0x...
```

## Tech Stack

- Hardhat (Solidity)
- React + Vite + Wagmi
- WalletConnect/Web3Modal

## Commands

```bash
# Contracts
cd contracts
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network amoy

# Frontend
cd frontend
npm install
npm run dev
npm run build
```
>>>>>>> 7c29aad (initial commit)

## 📬 Contact

- **Website**: [https://trestle.website](https://trestle.website)
<<<<<<< HEAD
- **Testnet Hub**: [Testnet Hub](https://testnet.trestle.website)
- **Reward Hub**: [Reward Hub](https://reward.trestle.website)
- **GitHub**: [Trestle DeFi](https://github.com/Trestle-DeFi)
- **Documentation**: [https://docs.trestle.website](https://docs.trestle.website)
- **X (Twitter)**: [Trestle DeFi](https://x.com/Trestle_0xArch)
- **BlueSky**: [Trestle DeFi](https://bsky.app/profile/trestle-0xarch.bsky.social)
- **Medium**: [Trestle DeFi](https://medium.com/@trestle_defi)
- **Discord**: [Trestle DeFi](https://discord.gg/4dCCvnJYGT)
- **Telegram**: [trestleDeFi](https://t.me/trestleDeFi)
- **Telegram App**: [trestlehub_bot](https://t.me/trestlehub_bot)
- **Email**: contact@trestle.website

---

**Disclaimer:** Not affiliated with Trestle Protocol (Celestia Bridge).
=======
- **GitHub**: [Trestle DeFi](https://github.com/Trestle-DeFi)
- **Discord**: [Trestle DeFi](https://discord.gg/4dCCvnJYGT)
- **Telegram**: [TrestleDeFi](https://t.me/TrestleDeFi)
- **Email**: contact@trestle.website
>>>>>>> 7c29aad (initial commit)
