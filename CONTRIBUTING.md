# Contributing — PR Workflow

All changes to any prototype repo in the `enigma-group-project` org must go through a pull request.
Direct pushes to `main` or `develop` are blocked for all members. This document is the single source
of truth for the workflow every member follows.

---

## Branch model

```
main          ← final, graded state (instructor merges from develop at submission)
  └── develop ← integration branch (all member PRs target this)
        ├── feature/member1-<slice>
        ├── feature/member2-<slice>
        ├── feature/member3-<slice>
        └── feature/member4-<slice>
```

- **`main`** — never push here directly. Only the instructor (admin bypass) or a final PR from `develop` lands here.
- **`develop`** — the shared integration branch. Open all PRs here.
- **`feature/<member>-<slice>`** — your personal working branch. One branch per slice.

---

## Step-by-step: opening a PR

### 1. Clone the repo (first time only)

```bash
git clone --recursive git@github.com:enigma-group-project/<Repo-Name>.git
cd <Repo-Name>
git checkout develop                       # start from develop, not main
git submodule update --init --recursive    # pulls pinned deps per foundry.lock (OZ v5.1.0, forge-std)
forge build                                 # must be green before you touch anything
```

> Dependencies are pinned as git submodules via `foundry.lock` — `--recursive` (or the
> `git submodule update` line) restores OZ **v5.1.0** and forge-std automatically.
> If you cloned without `--recursive` and see `Source "@openzeppelin/contracts/…" not found`,
> run: `forge install` (no args — it syncs to `foundry.lock`).

### 2. Create your feature branch

```bash
git checkout -b feature/member1-token       # member1 example
# or
git checkout -b feature/member2-listings    # member2 example
# or
git checkout -b feature/member3-escrow      # member3 example
# or
git checkout -b feature/member4-reputation  # member4 example
```

Branch naming is `feature/<your-member-id>-<slice-slug>`. Use your exact member number.

### 3. Implement your slice

Edit only the files in your slice (see [CODEOWNERS](.github/CODEOWNERS) for the exact list).
Each member owns:

| Member | Contract | Frontend | Test |
|--------|----------|----------|------|
| member1 | `contracts/IssuerRegistry.sol` (or `EnigCredit.sol`) | `frontend/src/modules/issuer/` (or `token/`) | `test/IssuerRegistry.t.sol` |
| member2 | `contracts/RecordRegistry.sol` (or `Marketplace.sol` listings) | `frontend/src/modules/record/` (or `listings/`) | `test/RecordRegistry.t.sol` |
| member3 | `contracts/Verification.sol` (or `Marketplace.sol` escrow) | `frontend/src/modules/verification/` (or `market/`) | `test/Verification.t.sol` |
| member4 | `contracts/AuditTrail.sol` (or `Reputation.sol`) | `frontend/src/modules/audit/` (or `reputation/`) | `test/AuditTrail.t.sol` |

Clear every `TODO(memberN)` in your files — the autograder deducts points for any remaining.

### 4. Verify locally before pushing

```bash
forge build                        # must return exit 0
forge test --match-contract <YourTest> -vvv   # your slice's tests must be green
forge test -vvv                    # full suite must also stay green
```

Never push a build that fails `forge build`.

### 5. Commit your changes

```bash
git add contracts/<YourContract>.sol \
        frontend/src/modules/<your-module>/ \
        test/<YourTest>.t.sol \
        docs/<your-module>.md    # if your slice has a doc
git commit -m "feat(memberN): implement <slice name>"
```

Keep commits atomic: one logical unit per commit. Do not commit `out/`, `cache/`, `.env`, or secrets.

### 6. Push your branch

```bash
git push -u origin feature/member1-token    # first push (sets tracking)
git push                                     # subsequent pushes
```

### 7. Open a pull request on GitHub

1. Go to `https://github.com/enigma-group-project/<Repo-Name>`
2. GitHub will show a **"Compare & pull request"** banner — click it.
3. Set **base** branch to `develop` (not `main`).
4. Fill in the PR template (all checkboxes must be ticked or N/A'd with a reason).
5. Attach a screenshot or paste `forge test` output in the **Evidence** section.
6. Submit — CI runs automatically.

---

## PR template checklist (required)

The `.github/pull_request_template.md` pre-fills when you open a PR. Every box must be addressed:

| Item | What "done" looks like |
|------|------------------------|
| 1 smart-contract change | Your `.sol` file with no `TODO(memberN)` left |
| 1 frontend change | Your module's `.js` / `.html` calling the contract |
| 1 test file | Tests pass: `forge test --match-contract <YourTest>` green |
| 1 documentation update | Your module doc in `docs/` updated or added |
| 1 screenshot or test output | Pasted in the Evidence section of the PR body |

---

## CI gates

Every PR triggers two workflows automatically:

| Workflow | What it checks | Required to merge |
|----------|---------------|-------------------|
| **CI** (`.github/workflows/ci.yml`) | `forge build` + `forge test` | Yes — PR is blocked if red |
| **Auto-Grade** (`.github/workflows/grade.yml`) | Full rubric (compile, tests, files, docs, hygiene) | Informational — see score in Actions tab |

Fix any CI failure before requesting review. Do not ask reviewers to look at a red PR.

---

## Code review and CODEOWNERS

Branch protection requires **at least one approving review** before merge, and **CODEOWNERS review** for files in your slice directory.

- Your PR will be auto-assigned to your CODEOWNER (set in `.github/CODEOWNERS`).
- Reviewers: use the **reviewer checklist** in the PR template (`forge build` green, `forge test` green, no PII, targets `develop`, CEI respected).
- Respond to review comments within 24 hours. Push fixups to the same branch; GitHub re-requests review automatically.

---

## After your PR is merged

1. Delete your feature branch (GitHub shows a **"Delete branch"** button after merge).
2. Update your local `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   ```
3. Start the next iteration from the updated `develop`.

---

## develop → main (owners only)

When all four slice PRs are merged to `develop` and the group is ready to submit:

1. The instructor (or member1 as Tech Lead, with instructor approval) opens a final PR: `develop → main`.
2. Full CI must be green.
3. Instructor reviews and merges. This is the graded snapshot.

Members do **not** open PRs directly to `main`.

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Pushed directly to `develop` | Open a PR from a feature branch instead; instructor rolls back direct pushes |
| PR targets `main` instead of `develop` | Close and re-open with the correct base |
| `forge build` failing in CI | Run `forge build` locally and fix errors before pushing |
| Evidence section left blank | Paste `forge test -vvv` output or a screenshot; autograder also checks |
| Committed `out/` or `cache/` | These are in `.gitignore`; run `git rm -r --cached out/ cache/` and re-commit |
| Edited another member's files | Revert those changes; CODEOWNERS review will catch cross-slice edits |

---

## Quick reference

```bash
# Start a new slice
git checkout develop && git pull origin develop
git checkout -b feature/memberN-<slice>

# Before every push
forge build && forge test -vvv

# Push and open PR
git push -u origin feature/memberN-<slice>
# → open PR on GitHub, base = develop

# After merge
git checkout develop && git pull origin develop
git branch -d feature/memberN-<slice>
```
