import { readContracts, mountNetworkSelector, net, formatTokens } from "../../shared/app.js";
import { mountSidebarWallet } from "../../shared/wallet.js";

mountNetworkSelector("net");

const outEl = document.getElementById("out");
const out = (m, type = "") => {
  outEl.textContent = m;
  outEl.className = "status-box" + (type ? " " + type : "");
};

function friendlyError(e) {
  const msg = String(e.message || e.reason || e);
  if (msg.includes("SelfPurchase"))               return "❌ You cannot buy your own listing.";
  if (msg.includes("NotAvailable"))               return "❌ This listing is no longer available (already Pending, Sold, or Cancelled).";
  if (msg.includes("NotPending"))                 return "❌ Not in Pending state — delivery can only be confirmed after a purchase.";
  if (msg.includes("NotBuyer"))                   return "❌ Only the buyer of this listing can perform this action.";
  if (msg.includes("TimeoutNotReached"))          return "❌ The cancellation timeout hasn't elapsed yet.";
  if (msg.includes("EnforcedPause"))              return "❌ The marketplace is currently paused. Try again later.";
  if (msg.includes("ReentrancyGuard"))            return "❌ Transaction already in progress — please wait and try again.";
  if (msg.includes("ERC20InsufficientBalance"))   return "❌ Insufficient ENGC balance to complete this purchase.";
  if (msg.includes("ERC20InsufficientAllowance")) return "❌ Token allowance error — please retry the Buy action.";
  if (msg.includes("user rejected"))              return "❌ Transaction rejected in MetaMask.";
  if (msg.includes("network") || msg.includes("chain")) return "❌ Network mismatch — check your MetaMask network matches the sidebar selection.";
  return "❌ " + (e.reason || e.message || e);
}

let wc, signer;
let currentListingId = null;

// ── Single wallet entry point ─────────────────────────────────────────────
mountSidebarWallet("wallet-section", ({ signer: s, wc: w }) => {
  signer = s; wc = w;
});

// ── Load listing from URL param only ─────────────────────────────────────
const listingIdFromUrl = new URLSearchParams(window.location.search).get("listingId");

if (listingIdFromUrl !== null) {
  currentListingId = Number(listingIdFromUrl);
  document.getElementById("no-listing-msg").style.display = "none";
  document.getElementById("trade-card").style.display = "block";
  loadListingDetail(currentListingId);
} else {
  document.getElementById("no-listing-msg").style.display = "block";
  document.getElementById("trade-card").style.display = "none";
}

async function loadListingDetail(id) {
  const previewEl = document.getElementById("listing-preview");
  const detailEl  = document.getElementById("listing-detail");
  try {
    const rc = readContracts();
    const listing = await rc.marketplace.getListing(id);
    const statusMap = ["Available", "Pending", "Sold", "Cancelled"];
    const status    = statusMap[Number(listing.status)];
    const price     = formatTokens(listing.priceInTokens);
    const statusCls = "tag status-" + status.toLowerCase();

    const imgHtml = listing.imageUrl
      ? `<img src="${listing.imageUrl}" alt="${listing.title}" class="product-img"/>`
      : `<div class="product-img-placeholder">📦</div>`;

    detailEl.innerHTML = `
      <div class="product-info-grid">
        <div class="product-img-wrap">${imgHtml}</div>
        <div class="product-meta">
          <div class="product-title">${listing.title}</div>
          <div class="product-tags">
            <span class="tag">${listing.category}</span>
            <span class="tag">${listing.condition}</span>
            <span class="${statusCls}">${status}</span>
          </div>
          <div class="product-price">${Number(price).toLocaleString()} ENGC</div>
          ${listing.description ? `<div class="product-desc">${listing.description}</div>` : ""}
          <div class="product-seller">
            <span class="product-seller-label">Seller</span>
            <span class="product-seller-addr" title="${listing.seller}">${listing.seller.slice(0,10)}…${listing.seller.slice(-6)}</span>
          </div>
          <div class="product-listing-id">Listing #${id}</div>
        </div>
      </div>`;
    previewEl.style.display = "block";

    if (status === "Sold")      out("ℹ️ This listing has already been sold.", "");
    else if (status === "Cancelled") out("ℹ️ This listing has been cancelled.", "");
    else if (status === "Pending")   out("ℹ️ This listing is Pending — use Confirm Delivery or Cancel below.", "");
  } catch (e) {
    detailEl.innerHTML = `<span style="color:var(--danger)">Could not load listing #${id}: ${e.message || e}</span>`;
    previewEl.style.display = "block";
  }
}

function setStep(n) {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById("step" + i);
    el.className = "step" + (i < n ? " done" : i === n ? " active" : "");
  });
}

document.getElementById("buy").onclick = async () => {
  if (!wc) { out("Connect your wallet via the sidebar first.", "err"); return; }
  try {
    if (currentListingId === null) { out("No listing selected.", "err"); return; }
    const rc = readContracts();
    const l = await rc.marketplace.getListing(currentListingId);
    const buyerAddr = await signer.getAddress();

    if (l.seller.toLowerCase() === buyerAddr.toLowerCase()) { out(friendlyError({ message: "SelfPurchase" }), "err"); return; }
    if (Number(l.status) !== 0) { out(friendlyError({ message: "NotAvailable" }), "err"); return; }
    const balance = await rc.token.balanceOf(buyerAddr);
    if (balance < l.priceInTokens) { out(friendlyError({ message: "ERC20InsufficientBalance" }), "err"); return; }

    setStep(1);
    out("Step 1 / 2 — Approving ENGC transfer…", "pending");
    const a = await wc.token.approve(net().addresses.Marketplace, l.priceInTokens);
    await a.wait();
    setStep(2);
    out("Step 2 / 2 — Purchasing (locking tokens in escrow)…", "pending");
    const p = await wc.marketplace.purchaseItem(currentListingId);
    await p.wait();
    setStep(3);
    out("✅ Purchased — tokens held in escrow. Confirm delivery once you receive the item.", "ok");
    loadListingDetail(currentListingId);
  } catch (e) { out(friendlyError(e), "err"); }
};

document.getElementById("confirm").onclick = async () => {
  if (!wc) { out("Connect your wallet via the sidebar first.", "err"); return; }
  try {
    if (currentListingId === null) { out("No listing selected.", "err"); return; }
    const rc = readContracts();
    const l = await rc.marketplace.getListing(currentListingId);
    const callerAddr = await signer.getAddress();
    if (Number(l.status) !== 1) { out(friendlyError({ message: "NotPending" }), "err"); return; }
    if (l.buyer.toLowerCase() !== callerAddr.toLowerCase()) { out(friendlyError({ message: "NotBuyer" }), "err"); return; }

    out("Confirming delivery…", "pending");
    const tx = await wc.marketplace.confirmDelivery(currentListingId);
    await tx.wait();
    out("✅ Delivery confirmed — seller has been paid.", "ok");
    loadListingDetail(currentListingId);
  } catch (e) { out(friendlyError(e), "err"); }
};

document.getElementById("cancel").onclick = async () => {
  if (!wc) { out("Connect your wallet via the sidebar first.", "err"); return; }
  try {
    if (currentListingId === null) { out("No listing selected.", "err"); return; }
    const rc = readContracts();
    const l = await rc.marketplace.getListing(currentListingId);
    const callerAddr = await signer.getAddress();
    if (Number(l.status) !== 1) { out(friendlyError({ message: "NotPending" }), "err"); return; }
    if (l.buyer.toLowerCase() !== callerAddr.toLowerCase()) { out(friendlyError({ message: "NotBuyer" }), "err"); return; }

    out("Cancelling purchase…", "pending");
    const tx = await wc.marketplace.cancelPurchase(currentListingId);
    await tx.wait();
    out("✅ Purchase cancelled — tokens refunded.", "ok");
    loadListingDetail(currentListingId);
  } catch (e) { out(friendlyError(e), "err"); }
};
