import { connect, writeContracts, readContracts, mountNetworkSelector, net, parseTokens, formatTokens } from "../../shared/app.js";
mountNetworkSelector("net");
const out = (m) => (document.getElementById("out").textContent = m);
const val = (id) => document.getElementById(id).value.trim();
let signer, wc;
let currentUserAddress = null;
let statusFilter = "";

document.getElementById("connect").onclick = async () => {
  try {
    ({ signer } = await connect());
    wc = writeContracts(signer);
    currentUserAddress = await signer.getAddress();
    document.getElementById("who").textContent = "Connected: " + currentUserAddress + " · " + net().label;
  } catch (e) {
    out(String(e.message || e));
  }
};

document.getElementById("create").onclick = async () => {
  try {
    if (!wc) throw new Error("Connect a wallet first.");
    const title = val("title");
    const category = val("category");
    const condition = val("condition");
    const price = val("price");
    const imageUrl = val("imageUrl");
    if (!title || !category || !condition || !price) throw new Error("Fill out title, category, condition, and price.");

    out("Posting listing…");
    const tx = await wc.marketplace.createListing(title, category, condition, parseTokens(price), imageUrl);
    const receipt = await tx.wait();
    const id = receipt.events?.find((e) => e.event === "ListingCreated")?.args?.id;
    out(`✅ listing posted ${id !== undefined ? `#${id}` : "(created)"}`);
    refreshListings();
  } catch (e) {
    out(String(e.message || e));
  }
};

document.getElementById("refresh").onclick = refreshListings;

document.getElementById("statusFilter").onchange = (e) => {
  statusFilter = e.target.value;
  refreshListings();
};

async function refreshListings() {
  try {
    const rc = readContracts();
    const total = Number(await rc.marketplace.totalListings());
    const listEl = document.getElementById("list");
    listEl.innerHTML = "";
    if (total === 0) {
      listEl.textContent = "No listings yet.";
      return;
    }

    let displayedCount = 0;
    for (let i = 0; i < total; i++) {
      const listing = await rc.marketplace.getListing(i);
      const status = ["Available", "Pending", "Sold", "Cancelled"][Number(listing.status)];
      
      // Apply status filter
      if (statusFilter && status !== statusFilter) {
        continue;
      }
      
      const price = formatTokens(listing.priceInTokens);
      const buyer = listing.buyer === "0x0000000000000000000000000000000000000000" ? "none" : listing.buyer;
      const isSeller = currentUserAddress && listing.seller.toLowerCase() === currentUserAddress.toLowerCase();
      const isBuyer = currentUserAddress && listing.buyer.toLowerCase() === currentUserAddress.toLowerCase();
      
      // Build action buttons
      let actionButtons = "";
      if (status === "Available") {
        actionButtons = `<button class="buy-now" data-listing-id="${i}" style="margin-right: 8px; margin-top: 8px;">Buy Now</button>`;
      }
      if (isSeller && status !== "Cancelled") {
        actionButtons += `<button class="remove-listing secondary" data-listing-id="${i}" style="margin-top: 8px;">Remove Listing</button>`;
      }
      
      listEl.insertAdjacentHTML(
        "beforeend",
        `<div class="listing">
          <strong>${listing.title}</strong> · ${listing.category} · ${listing.condition} · ${price} ENGC<br/>
          seller: ${listing.seller}<br/>
          buyer: ${buyer}<br/>
          status: ${status}
          ${actionButtons}
        </div>`
      );
      
      displayedCount++;
    }
    
    if (displayedCount === 0) {
      listEl.textContent = "No listings match the selected filter.";
    } else {
      out(`Loaded ${displayedCount} listing${displayedCount === 1 ? "" : "s"}.`);
    }
  } catch (e) {
    out(String(e.message || e));
  }
}

// Event delegation for Buy Now buttons
document.getElementById("list").addEventListener("click", async (e) => {
  if (e.target.classList.contains("buy-now")) {
    const listingId = e.target.getAttribute("data-listing-id");
    const marketPageUrl = `http://127.0.0.1:8080/modules/market/index.html?listingId=${listingId}`;
    window.location.href = marketPageUrl;
  }
  
  if (e.target.classList.contains("remove-listing")) {
    const listingId = e.target.getAttribute("data-listing-id");
    try {
      if (!wc) throw new Error("Connect a wallet first.");
      out(`Cancelling listing #${listingId}…`);
      const tx = await wc.marketplace.cancelListing(Number(listingId));
      await tx.wait();
      out(`✅ listing #${listingId} cancelled`);
      refreshListings();
    } catch (e) {
      out(String(e.message || e));
    }
  }
});

refreshListings();
