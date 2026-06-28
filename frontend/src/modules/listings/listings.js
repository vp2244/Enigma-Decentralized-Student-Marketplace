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
    const iface = wc.marketplace.interface;
    const log = receipt.logs
      .map(l => { try { return iface.parseLog(l); } catch { return null; } })
      .find(l => l?.name === "ListingCreated");
    const id = log?.args?.id;
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
  const statusMap = ["Available", "Pending", "Sold", "Cancelled"];
  const ids = Array.from({ length: total }, (_, i) => i);
  const listings = await Promise.all(ids.map(i => rc.marketplace.getListing(i)));
  return listings.map((listing, i) => ({ id: i, listing, status: statusMap[Number(listing.status)] }));
}

// ── Fetch rating string for an address ───────────────────────────────────
async function fetchRating(address) {
  try {
    const rc = readContracts();
    const [total, count] = await rc.reputation.getAverageRating(address);
    if (Number(count) > 0) {
      const avg = (Number(total) / Number(count)).toFixed(1);
      return ` <span class="rating-badge">⭐ ${avg}</span>`;
    }
  } catch (_) { /* best-effort */ }
  return ` <span class="rating-badge">⭐ 0.0</span>`;
}

// ── Browse all listings — excludes the current user's own listings ─────────
async function refreshListings() {
  const listEl   = document.getElementById("list");
  const statusEl = document.getElementById("list-status");
  listEl.innerHTML = `<div class="empty-state"><div class="icon">⏳</div><p>Loading listings…</p></div>`;
  statusEl.style.display = "none";

  try {
    const all = await fetchAllListings();

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

    const cards = await Promise.all(filtered.map(async ({ id, listing, status }) => {
      const sellerRating = await fetchRating(listing.seller);
      const zeroAddr = "0x0000000000000000000000000000000000000000";
      const buyerRating = (status === "Pending" || status === "Sold") && listing.buyer && listing.buyer !== zeroAddr
        ? await fetchRating(listing.buyer)
        : ` <span class="rating-badge">⭐ 0.0</span>`;
      return buildCard(id, listing, status, false, sellerRating, buyerRating);
    }));
    listEl.innerHTML = cards.join("");
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

    const cards = await Promise.all(mine.map(async ({ id, listing, status }) => {
      const sellerRating = await fetchRating(listing.seller);
      const zeroAddr = "0x0000000000000000000000000000000000000000";
      const buyerRating = (status === "Pending" || status === "Sold") && listing.buyer && listing.buyer !== zeroAddr
        ? await fetchRating(listing.buyer)
        : ` <span class="rating-badge">⭐ 0.0</span>`;
      return buildCard(id, listing, status, true, sellerRating, buyerRating);
    }));
    gridEl.innerHTML = cards.join("");
  } catch (e) {
    gridEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p style="color:var(--danger)">${e.message || e}</p></div>`;
  }
}

// ── Card builder ──────────────────────────────────────────────────────────
function buildCard(id, listing, status, isMineView, sellerRating = " <span class=\"rating-badge\">⭐ 0.0</span>", buyerRating = " <span class=\"rating-badge\">⭐ 0.0</span>") {
  const price = formatTokens(listing.priceInTokens);
  const isSeller = currentUserAddress && listing.seller.toLowerCase() === currentUserAddress.toLowerCase();
  const isBuyer  = currentUserAddress && listing.buyer !== "0x0000000000000000000000000000000000000000"
                   && listing.buyer.toLowerCase() === currentUserAddress.toLowerCase();
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
  if (isSeller && status === "Pending") {
    actions += `<button class="cancel-listing-pending danger-outline" data-id="${id}">✕ Cancel & Refund Buyer</button>`;
  }
  if (isSeller && status === "Sold") {
    actions += `<button class="rate-buyer" data-id="${id}">⭐ Rate Buyer</button>`;
  }

  const zeroAddr = "0x0000000000000000000000000000000000000000";

  // In "my listings" view show buyer info if pending or sold
  let extraInfo = "";
  if (listing.buyer && listing.buyer !== zeroAddr && (status === "Pending" || status === "Sold")) {
    const buyerShort = listing.buyer.slice(0, 6) + "…" + listing.buyer.slice(-4);
    extraInfo = `<div class="listing-card-seller" style="margin-top:4px;">Buyer: ${buyerShort}${buyerRating}</div>`;
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
      ${!isMineView ? `<div class="listing-card-seller">Seller: ${sellerShort}${sellerRating}</div>` : ""}
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
  if (e.target.classList.contains("cancel-listing-pending")) {
    const id = e.target.getAttribute("data-id");
    handleCancelPending(e.target, id);
  }
  if (e.target.classList.contains("rate-seller") || e.target.classList.contains("rate-buyer")) {
    const id = e.target.getAttribute("data-id");
    handleRate(e.target, id);
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

// Cancel a Pending listing as the seller — contract refunds escrowed tokens to buyer
async function handleCancelPending(btn, id) {
  if (!wc) { alert("Connect your wallet first."); return; }
  if (!confirm("Cancel this listing? The buyer's tokens will be refunded immediately.")) return;
  try {
    btn.textContent = "Cancelling…";
    btn.disabled = true;
    const tx = await wc.marketplace.cancelListing(Number(id));
    await tx.wait();
    refreshListings();
    refreshMyListings();
  } catch (err) {
    alert("Error: " + (err.message || err));
    btn.textContent = "✕ Cancel & Refund Buyer";
    btn.disabled = false;
  }
}

// Rate the other party after a Sold listing (buyer rates seller, seller rates buyer)
async function handleRate(btn, id) {
  if (!wc) { alert("Connect your wallet first."); return; }
  const stars = Number(prompt("Rate 1–5 stars:", "5"));
  if (!stars || stars < 1 || stars > 5) { alert("Enter a number between 1 and 5."); return; }
  try {
    btn.textContent = "Submitting…";
    btn.disabled = true;
    const tx = await wc.reputation.rateUser(Number(id), stars);
    await tx.wait();
    btn.textContent = "✅ Rated";
    refreshListings();
    refreshMyListings();
    // Leave disabled — they've used their one rating for this listing
  } catch (err) {
    const msg = String(err.message || err);
    if (msg.includes("AlreadyRated")) {
      btn.textContent = "✅ Already Rated";
      btn.disabled = true;
    } else {
      alert("Error: " + msg);
      btn.textContent = "⭐ Rate";
      btn.disabled = false;
    }
  }
}

document.getElementById("list").addEventListener("click", handleCardClick);
document.getElementById("my-list").addEventListener("click", handleCardClick);