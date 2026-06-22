# Enigma-Decentralized-Student-Marketplace

> 🧩 **STUDENT TEMPLATE.** Implement every `TODO(memberN)` in `contracts/` + `frontend/src/modules/`. Tests in `test/` are the spec — `forge test` until green. Auto-Grade runs on push.

> Team Enigma (Group E) · CS-GY 9215 Applied Blockchain · **Intermediate–Advanced**
> Buy/sell student goods with **EnigCredit (ENGC)** — smart-contract escrow + on-chain reputation. No backend.
> A standalone prototype (token + marketplace), distinct from the attestation-registry prototypes. **4 vertical slices.**

<!-- TRYIT_START -->
## ▶ Try it

- 🌐 **Live GUI (GitHub Pages):** <https://enigma-group-project.github.io/Enigma-Decentralized-Student-Marketplace/>
- 💻 **Run locally:** `cd frontend/src && python3 -m http.server 8080` → open <http://localhost:8080>
- 📖 **Procedures:** [docs/PROCEDURES.md](docs/PROCEDURES.md)

## 🛠 Build · deploy · run · test (per slice)

```bash
forge build                                                              # compile
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.1.0   # one-time
forge test -vvvv                                                         # run every slice test
anvil &                                                                  # terminal 2: local chain
forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --broadcast
# then: cd frontend/src && python3 -m http.server 8080  →  open the module pages below
```

| # | Slice | Contract | Test this slice | Frontend page | Key functions |
|---|-------|----------|-----------------|---------------|---------------|
| 1 | Token + Wallet | `contracts/EnigCredit.sol` | `forge test --match-contract EnigCreditTest` | `frontend/src/modules/token/` | `mint / transfer / approve` |
| 2 | Listings | `contracts/Marketplace.sol` | `forge test --match-contract ListingsTest` | `frontend/src/modules/listings/` | `createListing / getListing / totalListings` |
| 3 | Escrow / Trade | `contracts/Marketplace.sol` | `forge test --match-contract EscrowTest` | `frontend/src/modules/market/` | `purchaseItem / purchaseWithPermit / confirmDelivery / cancelPurchase` |
| 4 | Reputation / Ratings | `contracts/Reputation.sol` | `forge test --match-contract ReputationTest` | `frontend/src/modules/reputation/` | `rateUser / getAverageRating` |

> Compile = `forge build` · deploy = `forge script script/Deploy.s.sol:Deploy --rpc-url ... --broadcast` · run = `python3 -m http.server 8080` · test = `forge test -vvv`
<!-- TRYIT_END -->

## Roles
| Role | Who | Can |
|------|-----|-----|
| Seller | student | create listings, receive escrow on delivery, earn ratings |
| Buyer | student | purchase (escrow), confirm/cancel, rate seller |
| Owner | faculty/deployer | mint ENGC to student wallets |

## Tech
Solidity 0.8.20 · **OpenZeppelin** (ERC-20 + Burnable + Permit, Ownable, ReentrancyGuard, Pausable, SafeERC20) · Foundry · ethers.js + vanilla HTML/JS (dual-network) · Sepolia.

## Quickstart (local Anvil)
```bash
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.1.0
forge build
forge test -vvvv
forge test --gas-report

anvil &
forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --broadcast
# paste EnigCredit + Marketplace + Reputation addresses into frontend/src/shared/config.js (anvil block),
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
| member3 | Escrow / Trade | `Marketplace` escrow · `modules/market` | `Escrow.t.sol` |
| member4 | Reputation / Ratings | `Reputation.sol` · `modules/reputation` | `Reputation.t.sol` |

> `Marketplace.sol` is co-owned by member2 (listings) + member3 (escrow). `Reputation.sol` is member4's own contract; it reads completed-sale state from the Marketplace.

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
| member3 | Escrow / Trade | `feature/member3-escrow` | _…_ |
| member4 | Reputation / Ratings | `feature/member4-reputation` | _…_ |

## 🔐 Security, standards & study
- [`SECURITY_ASSURANCE.md`](SECURITY_ASSURANCE.md) · [`docs/token-standards.md`](docs/token-standards.md) · [`docs/study-guide.md`](docs/study-guide.md) · Slither + fuzz/invariant (`test/Invariant.t.sol`).
