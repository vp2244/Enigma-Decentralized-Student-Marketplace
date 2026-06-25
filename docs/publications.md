# 📄 Publications

## Enigma: A Decentralized Student Marketplace with Token Credits, On-Chain Escrow, and Reputation

A 2-page **IEEE** conference paper describing the system, written as **modular LaTeX**: `main.tex`
consolidates one folder per section, with a **section per slice owned by each member** — so everyone
edits only their part.

### Read / review (no LaTeX needed)
Every section has a Markdown mirror:

- [Abstract](https://github.com/rangasam/Enigma-Decentralized-Student-Marketplace/blob/publications/publications/Enigma-Decentralized-Student-Marketplace-Publications/abstract/abstract.md) · [Introduction](https://github.com/rangasam/Enigma-Decentralized-Student-Marketplace/blob/publications/publications/Enigma-Decentralized-Student-Marketplace-Publications/introduction/introduction.md) · [Architecture](https://github.com/rangasam/Enigma-Decentralized-Student-Marketplace/blob/publications/publications/Enigma-Decentralized-Student-Marketplace-Publications/architecture/architecture.md)
- [Slice 1 — Token + Wallet (M1)](https://github.com/rangasam/Enigma-Decentralized-Student-Marketplace/blob/publications/publications/Enigma-Decentralized-Student-Marketplace-Publications/slice1_token/slice1_token.md) · [Slice 2 — Listings (M2)](https://github.com/rangasam/Enigma-Decentralized-Student-Marketplace/blob/publications/publications/Enigma-Decentralized-Student-Marketplace-Publications/slice2_listings/slice2_listings.md)
- [Slice 3 — Escrow + Ratings (M3)](https://github.com/rangasam/Enigma-Decentralized-Student-Marketplace/blob/publications/publications/Enigma-Decentralized-Student-Marketplace-Publications/slice3_escrow/slice3_escrow.md) · [Slice 4 — Reputation (M4)](https://github.com/rangasam/Enigma-Decentralized-Student-Marketplace/blob/publications/publications/Enigma-Decentralized-Student-Marketplace-Publications/slice4_reputation/slice4_reputation.md)
- [Evaluation](https://github.com/rangasam/Enigma-Decentralized-Student-Marketplace/blob/publications/publications/Enigma-Decentralized-Student-Marketplace-Publications/evaluation/evaluation.md) · [Conclusions](https://github.com/rangasam/Enigma-Decentralized-Student-Marketplace/blob/publications/publications/Enigma-Decentralized-Student-Marketplace-Publications/conclusions_future_work/conclusions_future_work.md)

### Source & compiled PDF
- **LaTeX source + README:** [`publications/` folder](https://github.com/rangasam/Enigma-Decentralized-Student-Marketplace/tree/publications/publications/Enigma-Decentralized-Student-Marketplace-Publications)
- **Compiled PDF:** builds in CI on every push — download the latest **`enigma-paper-pdf`** artifact from
  the [Build paper workflow](https://github.com/rangasam/Enigma-Decentralized-Student-Marketplace/actions/workflows/build-paper.yml). *(Overleaf: upload the folder, set the main document to `main.tex`.)*

### Evaluation: gas and latency

Per-operation cost. **EnigCredit (Slice 1) figures are measured** via `forge test --gas-report`; Slices 2–4 are not yet implemented (`TODO` stubs), so their gas is an **engineering estimate** anchored to the measured costs — replace with a real gas report once each owner implements their function.

| Operation | Gas | Latency | Notes |
| --- | --- | --- | --- |
| `createListing` | ~150,000 *(est.)* | ~12 s | one SSTORE-heavy write (struct + strings) |
| `purchaseItem` | ~85,000 *(est.)* | ~12 s | escrow `transferFrom` |
| `confirmDelivery` | ~60,000 *(est.)* | ~12 s | release to seller |
| `rateUser` | ~65,000 *(est.)* | ~12 s | rating storage |
| `mint` *(Slice 1, measured)* | 38,698 | ~12 s | owner issuance — baseline |
| `transfer` *(Slice 1, measured)* | 51,400 | ~12 s | ERC-20 value move — baseline |

> Latency ≈ one block confirmation: **Sepolia ~12 s**, **local Anvil < 1 s** (mines on demand). Gas is network-independent.

### Per-section ownership
| Section | Owner | Status |
| --- | --- | --- |
| Slice 1 — Token + Wallet | Member 1 | drafted (validated: 7/7 tests, Anvil + Sepolia) |
| Slice 2 — Listings | Member 2 | design draft — `[refine]` |
| Slice 3 — Escrow + Ratings | Member 3 | design draft — `[refine]` |
| Slice 4 — Reputation | Member 4 | design draft — `[refine]` |

> Architecture, Slice 1, and Evaluation are drafted from validated results; Slices 2–4 are accurate
> design-level drafts for their owners to complete.
