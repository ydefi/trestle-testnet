# testnet.trestle.website

---

**Legal Disclaimer:** Trestle DeFi (trestle.website) is an independent Web3 ecosystem operating exclusively on the Polygon network. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with the Celestia-based "Trestle Protocol" bridge project or any of its subsidiaries. 

Testnet platform for Trestle DeFi. Smart contracts deployed on Polygon Amoy, with a Next.js frontend.

## Smart Contracts (Amoy)

| Contract | Purpose | Address |
|----------|---------|---------|
| **DigitalGoods** | Fixed-price & Dutch auction listings | See `.env` `NEXT_PUBLIC_DIGITAL_GOODS` |
| **FreelancerEscrow** | Milestone-based gigs & projects | See `.env` `NEXT_PUBLIC_FREELANCER_ESCROW` |
| **DigitalRWA** | Tokenized real-world assets (whitelist-gated) | See `.env` `NEXT_PUBLIC_DIGITAL_RWA` |
| **FeeDistributor** | Fee splitting (yield vault / treasury / buyback) | See `.env` `NEXT_PUBLIC_FEE_DISTRIBUTOR` |
| **GovernanceToken** | Mock governance token | See `.env` `NEXT_PUBLIC_GOV_TOKEN` |
| **MockUSDC / MockUSDT** | Test stablecoins (18 decimals) | See `.env` `NEXT_PUBLIC_MOCK_USDC` / `NEXT_PUBLIC_MOCK_USDT` |
| **UserProfile** | On-chain profiles & reviews | See `.env` `NEXT_PUBLIC_USER_PROFILE` |

## Tech Stack

- **Smart Contracts**: Hardhat (Solidity 0.8.28)
- **Frontend**: Next.js + wagmi + Reown AppKit
- **Styling**: Tailwind CSS

## Commands

```bash
# Contracts
cd testnet-trestle-website/contracts
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network amoy

# Frontend
cd testnet-trestle-website/frontend
npm install
npm run dev    # http://localhost:3000
npm run build
```

## Deploy

Cloudflare Pages — auto-deploys on push to main. Build command: `npm run build`, publish dir: `out/`.

## 📬 Contact

- **Website**: [https://trestle.website](https://trestle.website)
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
