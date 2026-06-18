# Slice 3 — Buy · Escrow · Ratings (`Marketplace` escrow/ratings)
> Owner: member3 · Branch: `feature/member3-escrow` · co-owns `Marketplace.sol` with member2.

## Implements
- `purchaseItem` (pull ENGC into escrow; CEI + nonReentrant), `confirmDelivery` (release to seller),
  `cancelPurchase` (refund after `CANCELLATION_TIMEOUT`), `rateUser` (1–5, once per Sold listing), `getAverageRating`.
- Frontend: 2-step buy (approve + purchase), confirm, cancel, rate, show avg.

## Threat model (Security — 5 pts)
| Threat | Mitigation |
|--------|------------|
| Reentrancy on token transfer | `nonReentrant` + CEI on all token paths |
| Self-purchase / wrong status | `SelfPurchase` / `NotAvailable` checks |
| Seller never delivers | buyer `cancelPurchase` after timeout (trustless refund) |
| Rating manipulation | only buyer, only after Sold, once per listing |
| Approval front-running | standard ERC-20 approve caveat — note in report |

## Tests (`test/Escrow.t.sol`)
purchase escrows · self-purchase revert · confirm pays seller · cancel-before-timeout revert ·
cancel-after-timeout refunds · rate + average · rate-twice revert · rate-unsold revert.

## TODO checklist
- [ ] step-indicator UI · [ ] skip approve if allowance sufficient · [ ] star-picker widget.
