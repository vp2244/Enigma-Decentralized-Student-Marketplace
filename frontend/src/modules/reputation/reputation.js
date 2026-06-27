import { writeContracts, readContracts, mountNetworkSelector } from "../../shared/app.js";
import { mountSidebarWallet } from "../../shared/wallet.js";

mountNetworkSelector("net");

const rateOut = (m, type = "") => {
  const el = document.getElementById("rate-out");
  el.textContent = m; el.className = "status-box" + (type ? " " + type : "");
};
const avgOut = (m, type = "") => {
  const el = document.getElementById("avg-out");
  el.textContent = m; el.className = "status-box" + (type ? " " + type : "");
};
const val = (id) => document.getElementById(id).value.trim();

let wc;
let selectedStars = 0;

// ── Wallet — single entry point ───────────────────────────────────────────
mountSidebarWallet("wallet-section", ({ wc: w }) => {
  wc = w;
});

// ── Star input ────────────────────────────────────────────────────────────
const starSpans = document.querySelectorAll("#star-input span");
starSpans.forEach(span => {
  span.onmouseover = () => highlightStars(Number(span.dataset.val));
  span.onmouseout  = () => highlightStars(selectedStars);
  span.onclick     = () => {
    selectedStars = Number(span.dataset.val);
    document.getElementById("stars").value = selectedStars;
    highlightStars(selectedStars);
  };
});
function highlightStars(n) {
  starSpans.forEach(s => s.classList.toggle("active", Number(s.dataset.val) <= n));
}

// ── Submit rating ─────────────────────────────────────────────────────────
document.getElementById("rate").onclick = async () => {
  if (!wc) { rateOut("Connect your wallet via the sidebar first.", "err"); return; }
  try {
    const id = val("id");
    const stars = selectedStars;
    if (!id) { rateOut("Enter a listing ID.", "err"); return; }
    if (stars < 1 || stars > 5) { rateOut("Select a rating (1–5 stars).", "err"); return; }
    rateOut("Submitting rating…", "pending");
    const tx = await wc.reputation.rateUser(Number(id), stars);
    await tx.wait();
    rateOut("✅ Rating submitted — thank you!", "ok");
  } catch (e) {
    rateOut(String(e.message || e), "err");
  }
};

// ── Look up reputation ────────────────────────────────────────────────────
document.getElementById("avg").onclick = async () => {
  try {
    const rc = readContracts();
    let seller = val("seller");
    const lookupId = val("lookup-id");
    if (!seller) {
      if (!lookupId && lookupId !== "0") { avgOut("Enter a seller address or listing ID.", "err"); return; }
      seller = (await rc.marketplace.getListing(Number(lookupId))).seller;
    }
    avgOut("Looking up reputation…", "pending");
    const [total, count] = await rc.reputation.getAverageRating(seller);
    const n = Number(count);
    if (!n) {
      document.getElementById("rep-result").style.display = "none";
      avgOut("No ratings found for this seller yet.", "");
      return;
    }
    const avg = (Number(total) / n).toFixed(2);
    const filledStars = Math.round(Number(total) / n);
    document.getElementById("rep-score-num").textContent = avg;
    document.getElementById("rep-stars").textContent = "★".repeat(filledStars) + "☆".repeat(5 - filledStars);
    document.getElementById("rep-count").textContent = `${n} rating${n === 1 ? "" : "s"} · ${seller.slice(0, 10)}…`;
    document.getElementById("rep-result").style.display = "block";
    avgOut("", "");
  } catch (e) {
    avgOut(String(e.message || e), "err");
  }
};
