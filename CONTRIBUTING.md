# Contributing — Enigma Group Project

## Fork-and-PR workflow
1. **Fork** the org repo into your own GitHub account.
2. **Clone** your fork and add the org repo as `upstream`.
3. **Branch** off `develop`: `feature/<member>-<slice>` (e.g. `feature/member1-issuer-registration`).
4. **Commit** your vertical change, **push** to your fork.
5. Open a **Pull Request into `develop`** (never `main`).

## Every PR must bundle one complete vertical change
1 smart-contract change · 1 frontend change · 1 test file · 1 documentation update · 1 screenshot or test output.
(See `.github/pull_request_template.md`.)

## Branch model
```
main      ← protected; release-ready, demo-tested only. Never push directly.
develop   ← integration; all feature branches merge here first.
  ├── feature/member1-issuer-registration
  ├── feature/member2-record-creation
  ├── feature/member3-verification
  └── feature/member4-transfer-audit
```

## Rules
- At least 1 approval before merge (self-approval allowed for the class per instructor).
- CI (`forge build` + `forge test`) must be green.
- Conversations resolved before merge; no force-pushes to `main`/`develop`.
- Apply CEI on every external call; never put PII on-chain (hashes/CIDs only).
