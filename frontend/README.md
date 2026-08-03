<<<<<<< HEAD
# Telegram Mini-App Frontend

React/Vite Telegram Mini-App for Trestle DeFi. Wallet via Reown AppKit + wagmi. Testnet contracts on Amoy + Virtual Vault for off-chain staking.

## Pages

- **Dashboard** — Vault balance overview, quick links
- **Stake** — Lock virtual hNOBT, earn BTR yield
- **Tasks** — Earn hNOBT points by completing tasks
- **Verify** — Stage 1 (Gitcoin Passport) + Stage 2 (biometric)
- **Marketplace** — Testnet digital goods stub
- **Withdraw** — Yield refresh + on-chain settlement voucher
- **Astra AI** — AI chat assistant (floating widget)

## Setup

```bash
cp .env.example .env   # fill in VITE_WALLETCONNECT_PROJECT_ID
npm install
npm run dev             # http://localhost:5173
npm run build
```

## Required Env

| Variable | Description |
|---|---|
| `VITE_WALLETCONNECT_PROJECT_ID` | Reown Cloud project ID |
| `VITE_API_URL` | Reward worker API (`https://reward-api.trestle.website`) |
| `VITE_VAULT_API_URL` | Vault worker API (`https://vault.trestle.website`) |

---

**Disclaimer:** Not affiliated with Trestle Protocol (Celestia Bridge).
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
- **Medium**: [Trestle DeFi](https://medium.com/@trestle_defi)
- **Discord**: [Trestle DeFi](https://discord.gg/4dCCvnJYGT)
- **Telegram**: [trestleDeFi](https://t.me/trestleDeFi)
- **Telegram App**: [trestlehub_bot](https://t.me/trestlehub_bot)
- **Email**: contact@trestle.website

=======
- **GitHub**: [Trestle DeFi](https://github.com/Trestle-DeFi)
- **Discord**: [Trestle DeFi](https://discord.gg/4dCCvnJYGT)
- **Telegram**: [TrestleDeFi](https://t.me/TrestleDeFi)
- **Email**: contact@trestle.website
>>>>>>> 7c29aad (initial commit)
