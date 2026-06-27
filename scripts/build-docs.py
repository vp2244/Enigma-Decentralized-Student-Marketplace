#!/usr/bin/env python3
"""Generate the published HTML docs from Markdown (single source).

Markdown in docs/ + CONTRIBUTING.md  -->  frontend/src/docs/*.html  (themed, navigable).
Run from anywhere:  python3 scripts/build-docs.py    (requires pandoc)
GitHub Pages publishes frontend/src, so these land at <pages-url>/docs/.
"""
import os, shutil, subprocess, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "frontend", "src", "docs")
PANDOC = shutil.which("pandoc") or "/opt/anaconda3/bin/pandoc"

# (source markdown, output html, nav/title, one-line description for the index)
PAGES = [
    ("docs/network-tests.md", "network-tests.html", "Network Tests",
     "Validate the Token + Wallet slice on Local Anvil and Hosted Sepolia, step by step with screenshots."),
    ("CONTRIBUTING.md", "contributing.html", "Workflow",
     "Branch model, the commit → PR → merge workflow, CI gates, and the review checklist."),
    ("docs/PROCEDURES.md", "procedures.html", "Procedures",
     "Build, validate, troubleshoot, deploy, and the local/hosted GUI test procedure."),
    ("docs/publications.md", "publications.html", "Publications",
     "The 2-page IEEE paper (modular LaTeX): source, per-section Markdown mirrors, and the compiled PDF."),
]
NAV = [("index.html", "Docs Home")] + [(o, t) for _, o, t, _ in PAGES] + [("../tracker/index.html", "Tracker")]

def shell(title, body):
    nav = "".join(f'<a href="{h}">{t}</a>' for h, t in NAV)
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Enigma Docs</title>
<link rel="stylesheet" href="docs.css"></head>
<body>
<header class="topbar"><a class="brand" href="../index.html">⟵ Enigma Demo</a><nav>{nav}</nav></header>
<main class="doc">
{body}
</main>
<footer>Enigma-Decentralized-Student-Marketplace · docs generated from Markdown by <code>scripts/build-docs.py</code></footer>
</body></html>
"""

def main():
    os.makedirs(OUT, exist_ok=True)
    # copy screenshots referenced by the docs (relative path resources/token-wallet/*)
    src_img = os.path.join(REPO, "docs", "resources", "token-wallet")
    dst_img = os.path.join(OUT, "resources", "token-wallet")
    os.makedirs(dst_img, exist_ok=True)
    for f in os.listdir(src_img):
        if f.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
            shutil.copy2(os.path.join(src_img, f), os.path.join(dst_img, f))

    for src, out, title, _ in PAGES:
        body = subprocess.run([PANDOC, os.path.join(REPO, src), "-f", "gfm", "-t", "html", "--wrap=none"],
                              capture_output=True, text=True, check=True).stdout
        open(os.path.join(OUT, out), "w").write(shell(title, body))
        print("built", out)

    cards = "".join(
        f'<a class="card" href="{out}"><h3>{title}</h3><p>{desc}</p></a>'
        for _, out, title, desc in PAGES)
    index_body = (
        "<h1>📖 Enigma Documentation</h1>"
        "<p>Guides for building, testing, and contributing to the Enigma Decentralized Student "
        "Marketplace. Generated from the Markdown in the repo.</p>"
        f'<div class="cards">{cards}'
        '<a class="card" href="../tracker/index.html"><h3>Project Tracker</h3>'
        '<p>Per-member task board across the four vertical slices.</p></a></div>')
    open(os.path.join(OUT, "index.html"), "w").write(shell("Documentation", index_body))
    print("built index.html")

if __name__ == "__main__":
    if not (os.path.exists(PANDOC) or shutil.which("pandoc")):
        sys.exit("pandoc not found")
    main()
