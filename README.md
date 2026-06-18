# Enigma-Decentralized-Student-Marketplace

> 🧩 **STUDENT TEMPLATE.** Implement every `TODO(memberN)` in `contracts/` + `frontend/src/modules/`. Tests in `test/` are the spec — run `forge test` until green. Auto-Grade runs on every push.

> Team Enigma (Group E) · CS-GY 9215 Applied Blockchain · **Intermediate–Advanced**
> Buy/sell student goods with **EnigCredit (ENGC)** — smart-contract escrow + on-chain ratings. No backend.
> A standalone prototype (token + marketplace), distinct from the attestation-registry prototypes. **3 vertical slices.**

## Roles
| Role | Who | Can |
|------|-----|-----|
| Seller | student | create listings, receive escrow on delivery, earn ratings |
| Buyer | student | purchase (escrow), confirm/cancel, rate seller |
| Owner | faculty/deployer | mint ENGC to student wallets |

## Tech
Solidity 0.8.20 · **OpenZeppelin** (ERC-20, Ownable, ReentrancyGuard) · Foundry · ethers.js + vanilla HTML/JS (dual-network) · Sepolia.

## Quickstart (local Anvil)
```bash
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts
forge build
forge test -vvvv
forge test --gas-report

anvil &
forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --broadcast
# paste EnigCredit + Marketplace addresses into frontend/src/shared/config.js (anvil block),
# ABIs into shared/abi.js, then open frontend/src/index.html
```

## Hosted demo on GitHub Pages (Sepolia)
```bash
forge script script/Deploy.s.sol:Deploy --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```
Paste Sepolia addresses into `config.js`, set `DEFAULT_NETWORK="sepolia"`, push — `pages.yml` publishes `frontend/src`.

## Vertical slices (one member each)
| Member | Slice | Contract / Frontend | Tests |
|--------|-------|---------------------|-------|
| member1 | Token + Wallet | `EnigCredit.sol` · `modules/token` | `EnigCredit.t.sol` |
| member2 | Listings | `Marketplace.createListing` · `modules/listings` | `Listings.t.sol` |
| member3 | Escrow + Ratings | `Marketplace` escrow/ratings · `modules/market` | `Escrow.t.sol` |

> `Marketplace.sol` is co-owned by member2 (listings) + member3 (escrow/ratings).

## Concepts demonstrated
dApp (no server) · token economics (ENGC) · escrow pattern · trustless dispute (timeout refund) ·
reentrancy protection · on-chain event indexing · testnet deploy + Etherscan verify. See `docs/architecture.md`.

## Evaluation table (fill with real numbers)
| Operation | Gas | Latency | Notes |
|-----------|----:|--------:|-------|
| createListing | ~_____ | ~__s | one SSTORE-heavy write |
| purchaseItem | ~_____ | ~__s | escrow transferFrom |
| confirmDelivery | ~_____ | ~__s | release to seller |
| rateUser | ~_____ | ~__s | rating storage |

## Contribution statement
| Member | Slice | Branch | Evidence |
|--------|-------|--------|----------|
| member1 | Token + Wallet | `feature/member1-token` | _screenshot / test output_ |
| member2 | Listings | `feature/member2-listings` | _…_ |
| member3 | Escrow + Ratings | `feature/member3-escrow` | _…_ |
