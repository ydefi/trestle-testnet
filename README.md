# testnet.trestle.website

---

**Legal Disclaimer:** Trestle DeFi (trestle.website) is an independent Web3 ecosystem operating exclusively on the Polygon network. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with the Celestia-based "Trestle Protocol" bridge project or any of its subsidiaries.

Testnet platform for Trestle DeFi. Smart contracts deployed on **Polygon Amoy**, **Base Sepolia**, and **Arbitrum Sepolia**, with a Next.js frontend.

## Smart Contracts

| Contract | Purpose |
|----------|---------|
| **DigitalGoods** | Marketplace listings — fixed-price & Dutch auction with description, tags, and NFT flag |
| **FreelancerEscrow** | Milestone-based gigs & projects (GitHub, portfolio, category, min-budget, duration) |
| **DigitalRWA** | Tokenized real-world assets, whitelist-gated (token type, jurisdiction, issuer, risk level) |
| **FeeDistributor** | Fee splitting (yield vault / treasury / buyback), reentrancy-guarded |
| **GovernanceToken** | Mock governance token (tGOV) |
| **MockUSDC / MockUSDT** | Test stablecoins (6 decimals) |
| **MockXNOBT / MockXBRT** | Test tokens (18 decimals) |
| **UserProfile** | On-chain profiles (all fields optional, incl. socials) & reviews |

Deployed addresses are maintained in `frontend/src/config/contracts.ts` (`CONTRACT_ADDRESSES`).

### Arbitrum Sepolia Deployments (latest)

| Contract | Address |
|----------|---------|
| **DigitalGoods** | `0x272475feaD659100E6DD8EBd8dB88E6f064DC112` |
| **FreelancerEscrow** | `0x6A08C1eE8102B41935a758b5E3093b075113E615` |
| **DigitalRWA** | `0x18dF08d96F303c6149a7f8CC4800BCa7fcAEB0Fd` |
| **FeeDistributor** | `0x754C549355215022453bDd9Cd19Cbc7b52B1E490` |
| **GovernanceToken (tGOV)** | `0x50915a301fF73278B3eaC09B42301abbC866F1Dc` |
| **MockUSDC** | `0xfe50dA41BfC13e99E9276149d0b534609C39633E` |
| **MockUSDT** | `0x635Ab939A2997eFDB42AD38F6A4919d8ae45b912` |
| **MockXNOBT** | `0x4cEaa30839E3E463484c2D66900fdD6484022054` |
| **MockXBRT** | `0xbA3B12F5633da2794c97CF330B19E510aE2BbB05` |
| **UserProfile** | `0xdd89E04e5bB9B79775A87Fa9666C5Fe03a01e169` |

All verified on [Arbiscan](https://sepolia.arbiscan.io). RWA price oracle: Chainlink ETH/USD (`0x26dA680D98e805D54f0934f46b4669149c14d1cA`).

## Features

- **Marketplace**: fixed & Dutch listings with description, tags, and NFT flag; native (ETH/POL), USDC, and USDT payments via an owner-set token allowlist.
- **Freelance**: gigs and projects with GitHub / portfolio / category / min-budget / duration metadata; milestone escrow with yield.
- **RWA**: tokenized real-world assets with full metadata (token type, jurisdiction, issuer, risk level); holder whitelist via USDC/USDT balance (multi-token whitelist).
- **Profiles**: user profiles with optional social fields (GitHub, website, location, skills, Twitter, Telegram) plus reviews.
- **Faucet**: mint test tokens with configurable per-token amounts.

## Tech Stack

- **Smart Contracts**: Hardhat (Solidity 0.8.36, EVM cancun, viaIR)
- **Frontend**: Next.js + wagmi + Reown AppKit
- **Styling**: Tailwind CSS

## Commands

```bash
# Contracts
cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network amoy
npx hardhat run scripts/deploy.js --network arbitrumSepolia

# Frontend
cd frontend
npm install
npm run dev    # http://localhost:3000
npm run build
```

## Security

Previously identified findings are addressed: ERC-20 payment token allowlists (`setTokenAllowed`), reentrancy guard on fee distribution, participant-only auto-approve / auto-resolve, strictly increasing milestone deadlines, single-set RWA asset info, and string RWA metadata URI. See `SECURITY.md`.

## Deploy

Cloudflare Pages — auto-deploys on push to main. Build command: `npm run build`, publish dir: `out/`.

## 📬 Contact

- **Website**: [https://trestle.website](https://trestle.website)
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