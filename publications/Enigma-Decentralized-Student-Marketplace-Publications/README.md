# Enigma Marketplace — Publication Paper

Modular IEEE (`IEEEtran`, 2-page conference) source for the project paper. Each section is its own
folder with a `.tex` (compiled) and a `.md` (readable mirror), consolidated by `main.tex`.

## Structure (one folder per section; slices owned per member)
| Folder | Section | Owner |
| --- | --- | --- |
| `abstract/` | Abstract | all |
| `introduction/` | Introduction | all |
| `architecture/` | System Architecture + Threat Model | all |
| `slice1_token/` | Slice 1 — Token + Wallet | **Member 1** |
| `slice2_listings/` | Slice 2 — Listings | **Member 2** |
| `slice3_escrow/` | Slice 3 — Escrow + Ratings | **Member 3** |
| `slice4_reputation/` | Slice 4 — Reputation | **Member 4** |
| `evaluation/` | Evaluation | all |
| `conclusions_future_work/` | Conclusions + Future Work | all |
| `references/` | BibTeX references | all |

**Each member edits only their `sliceN_*` folder.** Leave the other files alone unless coordinating.

## Build
- **Overleaf:** upload this folder, set the main document to `main.tex`.
- **Local (TeX Live / MacTeX):** `make`  → produces `main.pdf`.
- **CI:** `.github/workflows/build-paper.yml` compiles `main.tex` and uploads `main.pdf` as an artifact.

> ⚠️ Fill the author names/emails for Members 2–4 in `main.tex`, and complete the `[Member N: refine]`
> notes in each slice section.
