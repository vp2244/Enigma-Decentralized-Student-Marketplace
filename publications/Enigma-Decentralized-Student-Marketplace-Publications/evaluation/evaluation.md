Foundry evaluation. `EnigCreditTest` passes **7/7** (metadata, initial supply, owner mint, non-owner revert, transfer, permit, burn). Deployed to Anvil and **Sepolia** (`0x3162…F0de5`); the hosted client minted as owner and rejected non-owner mints (`CALL_EXCEPTION`) on both networks. Listings/escrow/reputation suites reported by their owners as completed.


**Per-operation gas and latency** (EnigCredit measured; Slices 2–4 estimated, pending implementation):

| Operation | Gas | Latency | Notes |
| --- | --- | --- | --- |
| `createListing` | ~150,000 (est.) | ~12 s | SSTORE-heavy write |
| `purchaseItem` | ~85,000 (est.) | ~12 s | escrow `transferFrom` |
| `confirmDelivery` | ~60,000 (est.) | ~12 s | release to seller |
| `rateUser` | ~65,000 (est.) | ~12 s | rating storage |
| `mint` (meas.) | 38,698 | ~12 s | owner issuance |
| `transfer` (meas.) | 51,400 | ~12 s | ERC-20 move |
