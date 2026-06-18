# Architecture — Enigma Decentralized Student Marketplace

> Buy/sell student goods with EnigCredit (ENGC); smart-contract escrow + on-chain ratings. No backend server.

## Roles
- **Seller** — lists items, confirms nothing (waits for buyer), earns ratings.
- **Buyer** — holds ENGC, purchases (escrow), confirms delivery or cancels after timeout, rates the seller.
- **Owner/Faculty** — deploys, mints ENGC to student wallets.
- Identity = wallet address (no email/password).

## Contracts (2)
- **EnigCredit (ENGC)** — OpenZeppelin ERC-20 + Ownable; fixed initial supply + owner `mint()`.
- **Marketplace** — OpenZeppelin ReentrancyGuard; `createListing → purchaseItem(escrow) → confirmDelivery | cancelPurchase(timeout) → rateUser`.

## Escrow flow
```
Seller                Marketplace (escrow)              Buyer
  | createListing() ------> Available                     |
  |                                   <--- approve(ENGC) --|
  |                                   <--- purchaseItem() -|  (ENGC locked, status Pending)
  |                         confirmDelivery() <------------|  (ENGC -> seller, status Sold)
  |                         rateUser(1..5)   <------------|
  |   --- if no delivery: buyer cancelPurchase() after CANCELLATION_TIMEOUT -> refund ---
```

## On-chain vs off-chain
| On-chain | Off-chain |
|----------|-----------|
| listing fields, status, escrow balance, ratings totals, events | item photos (image URL), chat/handoff (out-of-band) |

## Why blockchain (and where a DB is fine)
- **Wins:** trustless escrow (neither party can cheat — code holds funds), transparent ratings, no central server.
- **DB still better for:** fuzzy search, private messaging, high-volume mutable catalog data.

## Concepts demonstrated (course mapping)
dApp (no server) · ERC-20 token economics (ENGC) · escrow pattern · trustless dispute (timeout refund) ·
reentrancy protection (`nonReentrant`) · on-chain event indexing (listings/ratings) · testnet deploy + verify.
