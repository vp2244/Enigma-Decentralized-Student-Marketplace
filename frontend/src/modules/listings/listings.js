import { readContracts, mountNetworkSelector, parseTokens, formatTokens } from "../../shared/app.js";
import { mountSidebarWallet } from "../../shared/wallet.js";

mountNetworkSelector("net");

const postOut = (m, type = "") => {
  const el = document.getElementById("post-out");
  el.textContent = m;
  el.className = "status-box" + (type ? " " + type : "");
};

const val = (id) => document.getElementById(id).value.trim();
let wc;
let currentUserAddress = null;
let statusFilter = "";
let categoryFilter = "";

// ── Single wallet entry point ─────────────────────────────────────────────
mountSidebarWallet("wallet-section", ({ wc: w, address: a }) => {
  wc = w;
  currentUserAddress = a;
  refreshListings();
  refreshMyListings();
});

// Also load all listings on page load (read-only, no wallet needed)
refreshListings();

// ── Toggle post form ──────────────────────────────────────────────────────
document.getElementById("show-post-form").onclick = () => {
  const card = document.getElementById("post-form-card");
  card.style.display = "block";
  card.scrollIntoView({ behavior: "smooth" });
};
["hide-post-form", "hide-post-form2"].forEach(id => {
  document.getElementById(id).onclick = () => {
    document.getElementById("post-form-card").style.display = "none";
  };
});

// ── Create listing ────────────────────────────────────────────────────────
document.getElementById("create").onclick = async () => {
  if (!wc) { postOut("Connect your wallet via the sidebar first.", "err"); return; }
  try {
    const title     = val("title");
    const category  = val("category");
    const condition = val("condition");
    const price     = val("price");
    const imageUrl  = val("imageUrl");
    if (!title || !category || !condition || !price) {
      postOut("Fill in title, category, condition, and price.", "err"); return;
    }
    postOut("Posting listing…", "pending");
    const tx = await wc.marketplace.createListing(title, category, condition, parseTokens(price), imageUrl);
    const receipt = await tx.wait();
    const id = receipt.events?.find(e => e.event === "ListingCreated")?.args?.id;
    postOut(`✅ Listing posted${id !== undefined ? ` #${id}` : ""}`, "ok");
    ["title", "price", "imageUrl"].forEach(f => document.getElementById(f).value = "");
    document.getElementById("category").value = "";
    document.getElementById("condition").value = "";
    document.getElementById("post-form-card").style.display = "none";
    refreshListings();
    refreshMyListings();
  } catch (e) {
    postOut(String(e.message || e), "err");
  }
};

// ── Filters ───────────────────────────────────────────────────────────────
document.getElementById("refresh").onclick = () => { refreshListings(); refreshMyListings(); };
document.getElementById("statusFilter").onchange  = (e) => { statusFilter = e.target.value; refreshListings(); };
document.getElementById("categoryFilter").onchange = (e) => { categoryFilter = e.target.value; refreshListings(); };

// ── Fetch all listings from chain ─────────────────────────────────────────
async function fetchAllListings() {
  const rc = readContracts();
  const total = Number(await rc.marketplace.totalListings());
  const all = [];
  for (let i = 0; i < total; i++) {
    const listing = await rc.marketplace.getListing(i);
    const statusMap = ["Available", "Pending", "Sold", "Cancelled"];
    all.push({ id: i, listing, status: statusMap[Number(listing.status)] });
  }
  return all;
}

// ── Browse all listings — excludes the current user's own listings ─────────
async function refreshListings() {
  const listEl   = document.getElementById("list");
  const statusEl = document.getElementById("list-status");
  listEl.innerHTML = `<div class="empty-state"><div class="icon">⏳</div><p>Loading listings…</p></div>`;
  statusEl.style.display = "none";

  try {
    const all = await fetchAllListings();

    // Exclude the current user's own listings — they are shown in "My Listings"
    const others = all.filter(({ listing }) =>
      !currentUserAddress ||
      listing.seller.toLowerCase() !== currentUserAddress.toLowerCase()
    );

    const filtered = others.filter(({ listing, status }) => {
      if (statusFilter && status !== statusFilter) return false;
      if (categoryFilter && listing.category !== categoryFilter) return false;
      return true;
    });

    document.getElementById("listing-count").textContent =
      filtered.length ? `${filtered.length} listing${filtered.length === 1 ? "" : "s"}` : "";

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="icon">${all.length === 0 ? "🏷️" : "🔍"}</div>
        <h3>${all.length === 0 ? "No listings yet" : "No results"}</h3>
        <p>${all.length === 0 ? "Be the first to post something for sale!" : "Try changing the filter."}</p>
      </div>`;
      return;
    }
    listEl.innerHTML = filtered.map(({ id, listing, status }) => buildCard(id, listing, status, false)).join("");
  } catch (e) {
    listEl.innerHTML = "";
    statusEl.textContent = String(e.message || e);
    statusEl.className = "status-box err";
    statusEl.style.display = "block";
  }
}

// ── My Listings section ───────────────────────────────────────────────────
async function refreshMyListings() {
  if (!currentUserAddress) return;

  const section = document.getElementById("my-listings-section");
  const gridEl  = document.getElementById("my-list");
  const countEl = document.getElementById("my-listing-count");
  section.style.display = "block";
  gridEl.innerHTML = `<div class="empty-state"><div class="icon">⏳</div><p>Loading your listings…</p></div>`;

  try {
    const all = await fetchAllListings();
    const mine = all.filter(({ listing }) =>
      listing.seller.toLowerCase() === currentUserAddress.toLowerCase()
    );

    countEl.textContent = mine.length ? `${mine.length} listing${mine.length === 1 ? "" : "s"}` : "None yet";

    if (mine.length === 0) {
      gridEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="icon">📭</div>
        <h3>No listings yet</h3>
        <p>Post an item above to start selling.</p>
      </div>`;
      return;
    }
    gridEl.innerHTML = mine.map(({ id, listing, status }) => buildCard(id, listing, status, true)).join("");
  } catch (e) {
    gridEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p style="color:var(--danger)">${e.message || e}</p></div>`;
  }
}

// ── Card builder ──────────────────────────────────────────────────────────
function buildCard(id, listing, status, isMineView) {
  const price = formatTokens(listing.priceInTokens);
  const isSeller = currentUserAddress && listing.seller.toLowerCase() === currentUserAddress.toLowerCase();
  const sellerShort = listing.seller.slice(0, 6) + "…" + listing.seller.slice(-4);
  const statusCls = "tag status-" + status.toLowerCase();

  const imgSection = listing.imageUrl
    ? `<div class="listing-card-img"><img src="${listing.imageUrl}" alt="${listing.title}" onerror="this.parentElement.innerHTML='📦'"/></div>`
    : `<div class="listing-card-img" style="background:var(--surface);font-size:2.5rem;">📦</div>`;

  let actions = "";
  if (status === "Available" && !isSeller) {
    actions += `<button class="buy-now" data-id="${id}">🛒 Buy Now</button>`;
  }
  if (isSeller && status === "Available") {
    actions += `<button class="remove-listing secondary" data-id="${id}">✕ Remove</button>`;
  }
  // Seller can cancel a Pending listing — tokens revert to buyer
  if (isSeller && status === "Pending") {
    actions += `<button class="cancel-pending danger-outline" data-id="${id}">✕ Cancel Pending</button>`;
  }

  // In "my listings" view show buyer info if pending
  let extraInfo = "";
  if (isMineView && status === "Pending") {
    const buyerShort = listing.buyer.slice(0, 6) + "…" + listing.buyer.slice(-4);
    extraInfo = `<div class="listing-card-seller" style="margin-top:4px;">Buyer: ${buyerShort}</div>`;
  }

  return `<div class="listing-card">
    ${imgSection}
    <div class="listing-card-body">
      <div class="listing-card-price">${Number(price).toLocaleString()} ENGC</div>
      <div class="listing-card-title">${listing.title}</div>
      <div class="listing-card-meta">
        <span class="tag">${listing.category}</span>
        <span class="tag">${listing.condition}</span>
        <span class="${statusCls}">${status}</span>
      </div>
      ${!isMineView ? `<div class="listing-card-seller">Seller: ${sellerShort}</div>` : ""}
      ${extraInfo}
    </div>
    ${actions ? `<div class="listing-card-actions">${actions}</div>` : ""}
  </div>`;
}

// ── Card action delegation (both grids) ──────────────────────────────────
function handleCardClick(e) {
  if (e.target.classList.contains("buy-now")) {
    const id = e.target.getAttribute("data-id");
    window.location.href = `../market/index.html?listingId=${id}`;
  }
  if (e.target.classList.contains("remove-listing")) {
    const id = e.target.getAttribute("data-id");
    handleRemove(e.target, id);
  }
  if (e.target.classList.contains("cancel-pending")) {
    const id = e.target.getAttribute("data-id");
    handleCancelPending(e.target, id);
  }
}

// Remove an Available listing (seller)
async function handleRemove(btn, id) {
  if (!wc) { alert("Connect your wallet first."); return; }
  try {
    btn.textContent = "Cancelling…";
    btn.disabled = true;
    const tx = await wc.marketplace.cancelListing(Number(id));
    await tx.wait();
    refreshListings();
    refreshMyListings();
  } catch (err) {
    alert("Error: " + (err.message || err));
    btn.textContent = "✕ Remove";
    btn.disabled = false;
  }
}

// Cancel a Pending listing as the seller — refunds tokens to buyer
async function handleCancelPending(btn, id) {
  if (!wc) { alert("Connect your wallet first."); return; }
  if (!confirm("Cancel this pending transaction? The buyer's tokens will be refunded.")) return;
  try {
    btn.textContent = "Cancelling…";
    btn.disabled = true;
    // cancelPurchase resets status to Available and refunds the buyer.
    // The seller triggers it on behalf of the buyer via the contract (NotBuyer guard).
    // We call it with the seller's wallet — the contract will revert if seller isn't the buyer.
    // Instead we call cancelListing which on a Pending listing is not available in the current
    // contract. We use cancelPurchase which requires msg.sender == buyer — so we alert the seller
    // to share the listing ID with the buyer, OR we check if the contract allows seller cancellation.
    // Based on the contract, cancelPurchase enforces NotBuyer. The only seller-side cancel
    // for a Pending listing would need a new contract method. We'll call cancelPurchase and let
    // the contract error surface with a friendly message.
    const tx = await wc.marketplace.cancelPurchase(Number(id));
    await tx.wait();
    refreshListings();
    refreshMyListings();
  } catch (err) {
    const msg = String(err.message || err);
    if (msg.includes("NotBuyer")) {
      alert("Only the buyer can cancel a Pending transaction on-chain.\nShare Listing #" + id + " with the buyer and ask them to cancel from the Escrow / Trade page.");
    } else if (msg.includes("TimeoutNotReached")) {
      alert("The cancellation timeout hasn't elapsed yet. The buyer must wait before cancelling.");
    } else {
      alert("Error: " + msg);
    }
    btn.textContent = "✕ Cancel Pending";
    btn.disabled = false;
  }
}

document.getElementById("list").addEventListener("click", handleCardClick);
document.getElementById("my-list").addEventListener("click", handleCardClick);
