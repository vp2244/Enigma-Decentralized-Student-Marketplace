# Slice 2 — Listings (`Marketplace.createListing` + browse)
> Owner: member2 · Branch: `feature/member2-listings` · co-owns `Marketplace.sol` with member3.

## Implements
- `createListing(title, category, condition, priceInTokens, imageUrl)` → emits `ListingCreated`.
- `getListing` / `totalListings` reads.
- Frontend: create-listing form + browse Available listings.

## Tests (`test/Listings.t.sol`)
create stores+returns id · empty title revert · zero price revert · ids increment.

## TODO checklist
- [ ] search + category filter + sort · [ ] render avg rating per listing.
