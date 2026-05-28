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

## 📬 Contact

- **Website**: [https://trestle.website](https://trestle.website)
- **GitHub**: [Trestle DeFi](https://github.com/Trestle-DeFi)
- **Discord**: [Trestle DeFi](https://discord.gg/4dCCvnJYGT)
- **Telegram**: [TrestleDeFi](https://t.me/TrestleDeFi)
- **Email**: contact@trestle.website