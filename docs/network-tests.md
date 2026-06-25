# Validating Slice 1 (Token + Wallet) — Local Anvil & Hosted Sepolia

> Audience: every team member. This guide shows how to validate the **EnigCredit** token
> (mint · owner-only · balance) end-to-end on **two networks**, using the **same** GUI:
>
> | Network | GUI you use | Why |
> |---|---|---|
> | **Local Anvil** (chainId 31337) | the page served **locally** at `http://localhost:8080` | local HTTP ↔ local chain — no browser security limits |
> | **Hosted Sepolia** (chainId 11155111) | the **GitHub Pages** site `https://<user>.github.io/Enigma-Decentralized-Student-Marketplace/` | public HTTPS page ↔ public HTTPS RPC |
>
> **Golden rule — only the contract *owner* can `mint`.** The owner is whoever **deployed**:
> on Anvil that's account[0] (`0xf39F…2266`); on Sepolia it's the wallet you deployed with.
> A non-owner `mint` reverts with `execution reverted … CALL_EXCEPTION` (the `onlyOwner` guard).

---

## A · Local Anvil Network Test

Realistic local-dev flow: run a throwaway chain, deploy, serve the page, drive it with MetaMask.

### A1. Start the chain & deploy
```bash
# terminal 1 — local chain (accounts pre-funded, deterministic addresses)
anvil

# terminal 2 — deploy from the repo root (account[0] = deployer = owner)
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast \
  --sender 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 \
  --unlocked
```
Because account[0] deploys in a fixed order, the printed addresses match the **`anvil` block in
`frontend/src/shared/config.js`** out of the box (EnigCredit `0x5fbd…80aa3`). The constructor mints the
**1,000,000 ENGC** initial supply to the deployer.

### A2. Serve the GUI
```bash
cd frontend/src && python3 -m http.server 8080
```

### A3. Point MetaMask at the local chain
- Add a network: RPC `http://127.0.0.1:8545`, **chainId 31337**, then **import account[0]'s private key**
  (Anvil prints it on startup) as the owner.
- ℹ️ MetaMask labels chainId 31337 as **"GoChain Testnet"** with a **"GO"** symbol — that's cosmetic
  (GoChain's testnet shares the chainId). It's still your local Anvil chain; the "GO" gas is fake.

### A4. Connect & mint
Open **`http://localhost:8080/modules/token/index.html`**, choose **"Local Anvil (dev)"** in the Network
dropdown, **Connect wallet** (balance shows your ENGC), then fill the mint form and **Mint ENGC** →
MetaMask **Confirm**.

![Anvil: mint → MetaMask Confirm](resources/token-wallet/anvil-mint-confirm.png)

On success the page prints `✅ Minted … New balance: …`. Switch MetaMask to a **non-owner** account and
try again → it reverts with `CALL_EXCEPTION` (proof the `onlyOwner` guard works).

> ✅ **Validated:** owner mint succeeds, balance updates, non-owner mint is rejected — all on your local chain.

---

## B · Hosted Sepolia Network Test (GitHub Pages)

Same contract and UI on a **public** testnet, driven through the **hosted** site. Reads/writes are real
on-chain transactions.

### B1. A funded deployer wallet
Create a **throwaway** MetaMask account (this becomes the Sepolia owner) and fund it with Sepolia ETH.

⚠️ **Faucet gotcha:** the **Alchemy faucet requires a mainnet balance** — a fresh wallet is rejected with
*"Insufficient balance! You need at least 0.001 ETH on Ethereum Mainnet."*

![Alchemy faucet mainnet-balance gate](resources/token-wallet/sepolia-faucet-gate.png)

Use a **no-gate** faucet instead — [pk910 PoW](https://sepolia-faucet.pk910.de) (mine in-browser) or the
[Google Cloud faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia).

### B2. Get a Sepolia RPC (Alchemy)
In your Alchemy app, enable **Ethereum Sepolia** and copy the **Endpoint URL**
(`https://eth-sepolia.g.alchemy.com/v2/<key>`). ⚠️ Make sure it says **`eth-sepolia`**, not `eth-mainnet`,
and **never commit the key**.

![Alchemy Sepolia RPC (key redacted)](resources/token-wallet/22-alchemy-app-rpc.png)

### B3. Deploy to Sepolia
Store the key securely (`cast wallet import sepolia-deployer --interactive`), then:
```bash
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/<key>"
forge script script/Deploy.s.sol:Deploy \
  --rpc-url sepolia \
  --account sepolia-deployer \
  --broadcast
```

![forge deploy — on-chain execution complete](resources/token-wallet/sepolia-deploy-success.png)

Paste the three printed addresses into the **`sepolia` block** of `config.js`.

### B4. Publish the GUI to GitHub Pages
Commit the updated `config.js` (+ `abi.js`), then on **your fork**: **Settings → Pages → Source = GitHub
Actions**, and run the **"Deploy Pages"** workflow. The app publishes to
`https://<user>.github.io/Enigma-Decentralized-Student-Marketplace/`.

### B5. Connect & mint on the hosted site
Open the hosted **`/modules/token/index.html`**, choose **"Sepolia (hosted demo)"**, switch MetaMask to
**Sepolia**, and **Connect** the owner wallet.

![Sepolia hosted GUI — mint form + owner account](resources/token-wallet/sepolia-mint-setup.png)

Fill the mint form → **Mint ENGC** → MetaMask **Confirm** (this spends real Sepolia gas, ~12–15s to
confirm).

![Sepolia hosted GUI — mint success](resources/token-wallet/sepolia-mint-success.png)

Confirm independently on **[Sepolia Etherscan](https://sepolia.etherscan.io)** (read `owner`,
`totalSupply`, `balanceOf`). A non-owner mint reverts with `CALL_EXCEPTION`, exactly as on Anvil.

> ✅ **Validated:** the live Sepolia contract mints for the owner, rejects non-owners, and the hosted GUI
> reads/writes it correctly.

---

## Why Anvil uses the *local* page (not the hosted URL)

The hosted page is served over **HTTPS**; the frontend reads balances via a direct call to the network's
`rpcUrl`. Sepolia's RPC is **public HTTPS**, so the hosted site reaches it fine. Anvil's RPC is
**`http://127.0.0.1:8545`** — the browser's **Private Network Access** policy blocks a public HTTPS page
from calling a local/loopback address, so balance reads fail. That's why **Anvil → local page**,
**Sepolia → hosted page**.

---

_See also: `PROCEDURES.md` (§A5b Anvil CLI walkthrough, §B3a Alchemy RPC) and `CONTRIBUTING.md` (PR workflow)._
