#!/usr/bin/env python3
"""Auto-grader for an Enigma prototype repo (spine or marketplace). Structure-based; run from repo root."""
import glob, json, os, re, subprocess

def sh(cmd, timeout=900):
    try:
        return subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
    except Exception as e:
        class R:  # noqa
            returncode = 1; stdout = ""; stderr = str(e)
        return R()

rows, score, maxs = [], 0.0, 0.0
def add(cat, got, mx, note=""):
    global score, maxs
    score += got; maxs += mx
    rows.append(f"| {cat} | {got:.1f} / {mx} | {note} |")

# 1) compiles (15)
build = sh("forge build")
ok = build.returncode == 0
add("Compiles (forge build)", 15 if ok else 0, 15, "ok" if ok else "build failed")

# 2) tests passing (35)
passed = total = 0
if ok:
    t = sh("forge test --json")
    for line in reversed((t.stdout or "").strip().splitlines()):
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            data = json.loads(line)
        except Exception:
            continue
        for suite in data.values():
            for r in (suite.get("test_results") or {}).values():
                total += 1
                if r.get("status") == "Success":
                    passed += 1
        break
ratio = (passed / total) if total else 0.0
add("Tests passing", 35 * ratio, 35, f"{passed}/{total} passing")

# 3) required structure (15) — layout-based, works for any prototype
checks = [
    ("contracts/*.sol",     len(glob.glob("contracts/**/*.sol", recursive=True)) >= 1),
    (">=2 contracts",       len(glob.glob("contracts/**/*.sol", recursive=True)) >= 2),
    ("test/*.t.sol",        len(glob.glob("test/**/*.t.sol", recursive=True)) >= 1),
    ("script/Deploy.s.sol", os.path.exists("script/Deploy.s.sol")),
    ("frontend app",        os.path.exists("frontend/src/index.html") and os.path.exists("frontend/src/shared/app.js")),
    ("schemas/*.json",      len(glob.glob("schemas/*.json")) >= 1),
    ("README.md",           os.path.exists("README.md")),
]
present = sum(1 for _, okk in checks if okk)
add("Required structure", 15 * present / len(checks), 15, f"{present}/{len(checks)}")

# 4) implementation completeness (15) — contract TODO markers cleared
csrc = ""
for f in glob.glob("contracts/**/*.sol", recursive=True):
    try: csrc += open(f).read()
    except Exception: pass
todos = len(re.findall(r"TODO\(member", csrc)) + csrc.count('revert("TODO')
impl = 15.0 if todos == 0 else max(0.0, 15 - todos)
add("Contract impl (TODOs cleared)", impl, 15, f"{todos} contract TODO markers left")

# 5) docs (10) — architecture + module docs (any names)
dp = len(glob.glob("docs/*.md"))
add("Docs present", 10.0 if dp >= 4 else 10 * dp / 4, 10, f"{dp} docs")

# 6) hygiene (10)
readme = open("README.md").read() if os.path.exists("README.md") else ""
hy, notes = 10.0, []
if "~_____" in readme: hy -= 3; notes.append("eval table not filled")
if not os.path.exists(".gitignore"): hy -= 2; notes.append("missing .gitignore")
sec = sh("grep -rIlE "
         "'(PRIVATE_KEY|MNEMONIC)[A-Za-z0-9_]*[[:space:]]*=[[:space:]]*[^[:space:]]{16,}"
         "|BEGIN (RSA|EC|OPENSSH) PRIVATE KEY' "
         "--exclude=grade.py --exclude-dir=.autograder --exclude-dir=.git --exclude-dir=lib . || true")
if (sec.stdout or "").strip(): hy -= 5; notes.append("possible secret committed")
hy = max(0.0, hy)
add("Hygiene", hy, 10, ", ".join(notes) or "ok")

pct = 100 * score / maxs if maxs else 0
report = ("# Auto-grade report\n\n| Category | Score | Notes |\n|---|---|---|\n" + "\n".join(rows)
          + f"\n\n**Automated total: {score:.1f} / {maxs:.0f} ({pct:.0f}%)**\n\n"
          + "> Manually graded by the instructor: problem definition & fit, system-design narrative, "
            "evaluation/trade-offs, security depth, report & presentation. See PROJECT_BRIEF §11.\n")
print(report)
json.dump({"score": round(score,1), "max": maxs, "pct": round(pct,1),
           "tests_passed": passed, "tests_total": total, "contract_todos": todos},
          open("grade.json", "w"), indent=2)
