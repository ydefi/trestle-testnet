# jweb3 Status

Date: 2026-08-20

Trestle DeFi testnet platform — `trestle-testnet` monorepo (Hardhat contracts + Next.js frontend).

## Current State

- **All 134 contract tests passing**, frontend build clean, in both `jweb3-git` and `ydefi-git` (kept in sync).
- **Fresh full redeploy on Arbitrum Sepolia** — 10 contracts, all verified on Arbiscan.
- **Token allowlists configured** on the new deployments.
- Repos pushed and clean:
  - jweb3-git → `jooweb3/trestle-testnet` (`44a2402`)
  - ydefi-git → `ydefi/trestle-testnet` (`bf01680`)

## Recent Commits (jweb3-git)

| Commit | Summary |
|--------|---------|
| `44a2402` | docs: README + frontend config updated for fresh Arbitrum Sepolia deployment |
| `ed28640` | feat: DigitalRWA multi-token whitelist (USDC + USDT); deploy.js per-network Chainlink feed |
| `570a600` | docs: README + gitignore refresh for Solidity 0.8.36, multi-chain, new fields |
| `2acdaa2` | feat: Solidity 0.8.36 + new metadata fields across all sections |
| `3c10b74` | feat: auto-yield escrow expansion + frontend bug fixes |

## Contract Updates

### DigitalRWA — multi-token whitelist (new)
- `whitelistTokens` mapping (token → min balance) + `whitelistTokenList` array.
- `isWhitelisted` checks ANY whitelisted token's balance (manual override still honored).
- `setWhitelistToken` adds / updates / removes tokens; constructor seeds the initial token.
- `govToken` / `minGovBalance` getters retained for compatibility.

### New metadata fields (Solidity 0.8.36, cancun + viaIR)
- **DigitalGoods**: `description`, `tags`, `isNFT` added to listings.
  - `listFixed(metadataURI, description, tags, isNFT, price, category, deliveryURI)`
  - `listDutch(metadataURI, description, tags, isNFT, startPrice, reservePrice, duration, category, deliveryURI)`
- **FreelancerEscrow**: gigs add `github`, `portfolioURI`, `category`, `minBudget`; projects add `github`, `category`, `durationDays`; strictly-increasing milestone deadlines.
- **DigitalRWA**: `setAssetInfo` 11-arg — `tokenType`, `jurisdiction`, `issuer`, `riskLevel` added.
- **UserProfile**: profiles add `github`, `website`, `location`, `skills`, `twitter`, `telegram` (all optional).

### Security backports (previously missing)
- **DigitalGoods / FreelancerEscrow**: ERC-20 payment token allowlist (`allowedTokens` / `setTokenAllowed`), dispute deadline checks, participant-only auto-approve / auto-resolve / resolve-after-timeout.
- **FeeDistributor**: reentrancy guard on fee distribution.
- **DigitalRWA**: `metadataURI` converted from `bytes32` to `string`.

## Arbitrum Sepolia Deployment (fresh, all verified)

| Contract | Address |
|----------|---------|
| DigitalGoods | `0x272475feaD659100E6DD8EBd8dB88E6f064DC112` |
| FreelancerEscrow | `0x6A08C1eE8102B41935a758b5E3093b075113E615` |
| DigitalRWA | `0x18dF08d96F303c6149a7f8CC4800BCa7fcAEB0Fd` |
| FeeDistributor | `0x754C549355215022453bDd9Cd19Cbc7b52B1E490` |
| GovernanceToken (tGOV) | `0x50915a301fF73278B3eaC09B42301abbC866F1Dc` |
| MockUSDC | `0xfe50dA41BfC13e99E9276149D0b534609C39633E` |
| MockUSDT | `0x635Ab939A2997eFDB42AD38F6A4919d8ae45b912` |
| MockXNOBT | `0x4cEaa30839E3E463484c2D66900fdD6484022054` |
| MockXBRT | `0xbA3B12F5633da2794c97CF330B19E510aE2BbB05` |
| UserProfile | `0xdd89E04e5bB9B79775A87Fa9666C5Fe03a01e169` |

- RWA price oracle: Chainlink ETH/USD `0x26dA680D98e805D54f0934f46b4669149c14d1cA` (Arbitrum Sepolia).
- Treasury / buyback-burn: `0x64A7ef92229D2D97d1C4fd3DB15Db2d94d3D66F6`.

## Allowlists Configured

- **DigitalGoods**: USDC + USDT allowed for `buyWithToken` (native ETH always allowed).
- **FreelancerEscrow**: USDC + USDT allowed for `fundProjectWithToken` (native ETH always allowed).
- **DigitalRWA**: USDC (1000, constructor) + USDT (1000) whitelist for holder token-gating.

## Deploy Notes

- `deploy.js` now selects the Chainlink feed per network (`CHAINLINK_FEEDS`): amoy → POL/USD, arbitrumSepolia → ETH/USD, baseSepolia → ETH/USD; falls back to amoy.
- Deploy: `npx hardhat run scripts/deploy.js --network arbitrumSepolia` (deploys 10 contracts, verifies each).

## Frontend Updates

- `frontend/src/config/contracts.ts` — new Arbitrum Sepolia addresses.
- **Marketplace**: ListingCard shows description, tags, NFT badge.
- **Freelance**: gig/project forms and cards for the new metadata (github, portfolio, category, budgets, durations).
- **RWA**: token type, jurisdiction, issuer, risk-level display.
- **Faucet**: configurable per-token mint amounts.
- **UserProfile**: full profile form (optional socials).
- Deploys to Cloudflare Pages on push to main (build `npm run build`, publish `out/`).

## Verification & Hygiene

- 134 tests passing (incl. new multi-token whitelist coverage).
- Temp/recovery scripts removed after use; `.gitignore` tracks `.env.example` templates and ignores build/verify artifacts.
- Both repos verified content-identical except `frontend/dist` (gitignored).