# Screenshot resources — Token + Wallet validation

Images used by [`../../network-tests.md`](../../network-tests.md) (the Local Anvil + Hosted Sepolia
walkthrough) and `../../PROCEDURES.md`. These are the **curated, redacted** set actually in use:

| File | Network | Shows |
| --- | --- | --- |
| `anvil-mint-confirm.png` | Local Anvil | Owner connected on Local Anvil → mint form → MetaMask **Confirm** |
| `sepolia-faucet-gate.png` | Sepolia | Alchemy faucet **mainnet-balance gate** error (the funding gotcha) |
| `22-alchemy-app-rpc.png` | Sepolia | Alchemy Sepolia RPC endpoint (**API key fully redacted**) |
| `sepolia-deploy-success.png` | Sepolia | `forge script` → **ONCHAIN EXECUTION COMPLETE** + addresses |
| `sepolia-mint-setup.png` | Sepolia | Hosted GitHub Pages GUI on Sepolia → mint form + owner account |
| `sepolia-mint-success.png` | Sepolia | Hosted GUI → `✅ Minted … New balance` on Sepolia |

## ⚠️ Redaction rules (before adding any new screenshot)

These pages are **public**. Fully mask (not just partially) anything sensitive:

- **Alchemy / Infura API keys & full RPC URLs** — mask the *entire* key. Leaving prefix/suffix
  (e.g. `nTS…P1PV`) is **not** enough. `22-alchemy-app-rpc.png` is the reference (fully blurred).
- **Private keys / seed phrases** — never capture the value.
- Local **Anvil** dev addresses (`0xf39F…`, `0x5FbD…`) are well-known public test accounts — safe to show.
- If a real secret was ever visible in a capture, **rotate it** — blurring the image isn't enough.
