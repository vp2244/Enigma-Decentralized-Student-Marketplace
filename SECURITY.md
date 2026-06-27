# Security Policy

## On-chain privacy rule (graded)
Never store personal or sensitive data on-chain. Store only: `keccak256(file)` hashes,
IPFS CIDs, addresses, status flags, timestamps, and events. The real artifact stays off-chain.

## Threat model (per prototype)
See `docs/audit-module.md` for the slice-4 threat model (fake issuer, unauthorized transfer,
reentrancy, replay, front-running) and the mitigations implemented in the contracts.

## Public deployment & secrets hygiene

This repo and its **GitHub Pages** site (demo app + docs) are **public and search-indexable**. On our
plan there is **no way to restrict Pages to collaborators** — access-controlled ("private") Pages is a
GitHub Enterprise Cloud feature, and a Pages site built from a private repo is *still public* on Free.
Treat everything here as world-readable.

**Rules for every member:**

- **No secrets in the repo, ever** — no private keys, seed phrases, `.env`, or API keys in code, config,
  commits, or screenshots. Git history is public; deleting a secret does **not** remove it from history.
- **Testnet only** — deploy to Anvil/Sepolia with a **throwaway** wallet holding only test ETH. Never
  point the app at mainnet or a wallet with real funds.
- **No PII** — no real names, emails, grades, or student data in the app, docs, or on-chain (see the
  on-chain privacy rule above).
- **Redact screenshots fully** — blur the *entire* secret (API key, RPC URL); a visible prefix/suffix is
  not enough. Public Anvil dev addresses (`0xf39F…`, `0x5FbD…`) are safe to show. If a secret was ever
  visible anywhere, **rotate it** — blurring the image does not undo the exposure.
- **RPC keys** live in environment variables or a Foundry keystore, never committed. The frontend reads
  via a public RPC; writes go through each visitor's own wallet.

**Need a locked-down demo** (real data, pre-publication work)? Do **not** use GitHub Pages — run the GUI
locally (`python3 -m http.server`) or host behind an auth gate (e.g., Cloudflare Access / Netlify password).

## Reporting an issue in this reference repo
Open a private security advisory or contact the Tech Lead (member1). Do not file public issues
for suspected key-management or access-control flaws.
