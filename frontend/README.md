# Testnet Frontend

Next.js frontend for the Trestle DeFi testnet platform. Multi-chain support via wagmi + Reown AppKit.

## Supported Networks

| Chain | Chain ID | Native Token | Explorer |
|-------|----------|--------------|----------|
| Polygon Amoy | 80002 | POL | amoy.polygonscan.com |
| Base Sepolia | 84532 | ETH | sepolia.basescan.org |
| Arbitrum Sepolia | 421614 | ETH | sepolia.arbiscan.io |

Contract addresses are auto-resolved per chain from `src/config/contracts.ts`.

## Commands

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
npm start
```

## Architecture

- **Web3 Stack**: wagmi v3 + viem + Reown AppKit (WalletConnect)
- **Chains**: Polygon Amoy, Base Sepolia, Arbitrum Sepolia
- **Wallet**: Email/social login (Google, GitHub, Discord) + MetaMask
- **Contract ABIs**: Hardcoded in `src/hooks/useContracts.ts`
- **Multi-chain registry**: `src/config/contracts.ts` — all addresses per chain

## Key Files

| File | Purpose |
|------|---------|
| `src/config/web3.ts` | wagmi/AppKit initialization, RPC fallbacks |
| `src/config/contracts.ts` | Chain config + contract address registry |
| `src/hooks/useContracts.ts` | All ABIs + chain-aware write functions |
| `src/app/shell.tsx` | App shell with chain switch banner |
| `src/lib/blockscout.ts` | Blockscout REST API (chain-aware) |

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
