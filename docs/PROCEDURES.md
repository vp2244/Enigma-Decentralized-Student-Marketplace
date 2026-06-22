# 🧪 Build · Validate · Troubleshoot · Test — Enigma-Decentralized-Student-Marketplace

> **enigma-group-project** · student template (implement the TODOs)
> Repo: <https://github.com/enigma-group-project/Enigma-Decentralized-Student-Marketplace> · GUI: <https://enigma-group-project.github.io/Enigma-Decentralized-Student-Marketplace/>

This repo has three vertical slices (one per member). Two contracts (`EnigCredit` + `Marketplace`) power an on-chain token economy with escrow:

| # | Slice | Contract | Test this slice | Frontend page | Key functions |
|---|-------|----------|-----------------|---------------|---------------|
| 1 | Token + Wallet | `contracts/EnigCredit.sol` | `forge test --match-contract EnigCreditTest` | `frontend/src/modules/token/` | `mint / transfer / approve` |
| 2 | Listings | `contracts/Marketplace.sol` | `forge test --match-contract ListingsTest` | `frontend/src/modules/listings/` | `createListing / getListing / totalListings` |
| 3 | Escrow + Ratings | `contracts/Marketplace.sol` | `forge test --match-contract EscrowTest` | `frontend/src/modules/market/` | `purchaseItem / confirmDelivery / cancelPurchase / rateUser` |

> `Marketplace.sol` is co-owned by member2 (listings) + member3 (escrow/ratings).

---

## A. Local — compile, validate, troubleshoot, test the GUI

### A0. One-time toolchain (macOS)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"  # if no brew
brew install git gh jq node
curl -L https://foundry.paradigm.xyz | bash && source ~/.zshenv 2>/dev/null; foundryup
forge --version        # ✅ prints a forge version
```

### A1. Get the code
```bash
git clone https://github.com/enigma-group-project/Enigma-Decentralized-Student-Marketplace.git
cd Enigma-Decentralized-Student-Marketplace
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.1.0   # test + OZ deps
```

### A2. Compile
```bash
forge build            # ✅ "Compiler run successful!"
forge build --sizes    # per-contract bytecode sizes
```

### A3. Validate (tests)
`forge test -vvv` → tests **fail by design** until you implement the `TODO(memberN)` markers. Implement a slice, then `forge test --match-contract <Slice>Test` until green.
```bash
forge test -vvv                                  # all slices
forge test --match-contract EnigCreditTest       # slice 1
forge test --match-contract ListingsTest         # slice 2
forge test --match-contract EscrowTest           # slice 3
forge test --gas-report                          # gas numbers for the evaluation table
```

### A4. Troubleshoot
| Symptom | Cause | Fix |
|---|---|---|
| `forge: command not found` | Foundry not installed/loaded | `curl -L https://foundry.paradigm.xyz \| bash` then `foundryup`; reopen shell |
| `Source "forge-std/Test.sol" not found` | dep missing on fresh clone | `forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.1.0` |
| `Source "@openzeppelin/contracts/…" not found` | OZ not installed | `forge install OpenZeppelin/openzeppelin-contracts@v5.1.0` |
| `unexpected argument '--no-commit'` | old flag, removed in forge 1.7+ | run `forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.1.0` (no `--no-commit`) |
| `Source file requires different compiler version` | wrong solc | `foundry.toml` pins `0.8.20`; run `foundryup` (the IDE Solidity plugin may warn — Foundry is authoritative) |
| test reverts `TODO(memberN): implement …` | slice not implemented yet | implement that function in `contracts/EnigCredit.sol` or `contracts/Marketplace.sol` |
| `Connection refused` on deploy | Anvil not running | start `anvil` in a second terminal |
| MetaMask "wrong network" | chain mismatch | Anvil = chainId **31337** (`http://127.0.0.1:8545`); Sepolia = **11155111** |
| `transferFrom` reverts on `purchaseItem` | buyer didn't `approve` first | call `EnigCredit.approve(marketplaceAddress, amount)` before `purchaseItem` |
| GUI buttons do nothing / read empty | ABI/addresses not wired | regenerate `frontend/src/shared/abi.js` and paste deployed addresses into `frontend/src/shared/config.js` |
| Pages **404** | Pages source not set | repo must be public; **Settings ▸ Pages ▸ Source = GitHub Actions**; wait for the **Deploy Pages** run |
| CI: "workflow not allowed" | cross-org reusable workflow blocked | org **Settings ▸ Actions ▸ General** → allow all actions / `cyber-enigma/*` |


### A5. Test the GUI locally (Anvil)
```bash
anvil                                              # terminal 2 — leave running (prints accounts + keys)
# terminal 1, from the repo root:
forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --broadcast
# regenerate the ABI bundle from the build output:
cat > frontend/src/shared/abi.js <<EOF
export const ABIS = {
  EnigCredit:  $(jq -c .abi out/EnigCredit.sol/EnigCredit.json),
  Marketplace: $(jq -c .abi out/Marketplace.sol/Marketplace.json),
};
EOF
# paste the 2 printed addresses into the "anvil" block of frontend/src/shared/config.js, then:
cd frontend/src && python3 -m http.server 8080      # open http://localhost:8080
```
In MetaMask: add network **RPC `http://127.0.0.1:8545`, Chain ID `31337`**, import Anvil **account[0]** as Owner (can mint ENGC).

Walk the three module pages in order:
1. **Token** — mint ENGC to buyer and seller wallets
2. **Listings** — seller creates a listing; copy the listing ID
3. **Market** — buyer approves ENGC spend → `purchaseItem` → seller confirms delivery → optionally `rateUser`

---

## B. Remote — compile, validate, troubleshoot, test the GUI (on GitHub)

### B1. Compile & validate via CI
Every push / PR triggers **`.github/workflows/ci.yml`**. Open the repo's **Actions** tab → latest **CI** run → the
**build-test** job runs `forge build` + `forge test`. A green ✔ = compiles and tests ran (see Auto-Grade for the score).
```bash
gh run list  -R enigma-group-project/Enigma-Decentralized-Student-Marketplace --workflow ci.yml --limit 1
gh run watch -R enigma-group-project/Enigma-Decentralized-Student-Marketplace
```

### B2. Troubleshoot remotely
Open the failed run → **build-test** → expand the red step to read the log, or:
```bash
gh run view -R enigma-group-project/Enigma-Decentralized-Student-Marketplace --log-failed
```
Same root causes as the table in **A4** (most often: OZ install missing or a Solidity error).

### B3. Test the GUI on GitHub Pages
- 🌐 **https://enigma-group-project.github.io/Enigma-Decentralized-Student-Marketplace/** — the live three-module web app (published by `.github/workflows/pages.yml` from `frontend/src`).
Reads work with no wallet on the configured network; writes use the visitor's MetaMask. For a hosted on-chain demo, deploy to **Sepolia** (README §Hosted demo), paste the addresses into `config.js`, set `DEFAULT_NETWORK="sepolia"`, and push.

### B4. Auto-Grade score (template only)
Every push runs **Auto-Grade** (`.github/workflows/grade.yml`, a reusable workflow from `cyber-enigma/autograder`).
Open **Actions ▸ Auto-Grade ▸ latest run ▸ Summary** to see the score table (a fresh skeleton ≈ **57/100**; it rises as tests pass and `TODO(memberN)` markers are cleared).

---

## C. Self-evaluation with the auto-grader (students)

Same rubric the TA uses (defined in `cyber-enigma/autograder/rubric.yml`): compiles 15 · tests 35 · required files 15 · TODOs cleared 15 · docs 10 · hygiene 10.

**Local (fastest, offline):**
```bash
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.1.0
python3 scripts/grade.py            # prints the score table; writes grade.json
```
`scripts/grade.py` is a bundled copy of the canonical grader for quick self-checks.

**On GitHub (the official rubric, fetched at grade time):**
- Every push/PR runs **Auto-Grade** → **Actions ▸ Auto-Grade ▸ latest run ▸ Summary** for the score table (+ `grade-report.md` / `grade.json` artifacts).
- Run it on demand without a code change:
  ```bash
  gh workflow run "Auto-Grade" -R enigma-group-project/Enigma-Decentralized-Student-Marketplace     # or the Actions ▸ Auto-Grade ▸ "Run workflow" button
  ```
  This calls `cyber-enigma/autograder`'s reusable workflow, so you always score against the current rubric (you can't silently fork it).

**Raise your score:** clear every `TODO(memberN)` marker (impl 15), make `forge test` pass (tests 35), keep the 4 module docs + README evaluation table filled (docs 10 + hygiene 10).

---

_Procedure doc generated for the Enigma framework. Compile = `forge build` · validate = `forge test` · GUI = the URL above._
