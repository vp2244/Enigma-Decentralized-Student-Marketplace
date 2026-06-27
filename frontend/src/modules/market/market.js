import { connect, writeContracts, readContracts, mountNetworkSelector, net } from "../../shared/app.js";
mountNetworkSelector("net");
const out = (m) => (document.getElementById("out").textContent = m);
const idVal = () => Number(document.getElementById("id").value.trim());
let signer, wc;

// Check for listingId in URL parameters
const urlParams = new URLSearchParams(window.location.search);
const listingIdFromUrl = urlParams.get("listingId");
if (listingIdFromUrl) {
  document.getElementById("id").value = listingIdFromUrl;
}
document.getElementById("connect").onclick = async () => {
  try { ({ signer } = await connect()); wc = writeContracts(signer);
    document.getElementById("who").textContent = "Connected: " + (await signer.getAddress()) + " · " + net().label;
  } catch (e) { out(String(e.message || e)); }
};
document.getElementById("buy").onclick = async () => {
  try { if (!wc) throw new Error("Connect a wallet first.");
    const l = await readContracts().marketplace.getListing(idVal());
    out("Step 1/2 — approving ENGC…");
    const a = await wc.token.approve(net().addresses.Marketplace, l.priceInTokens); await a.wait();
    out("Step 2/2 — purchasing (escrow)…");
    const p = await wc.marketplace.purchaseItem(idVal()); await p.wait();
    out("✅ purchased — tokens held in escrow");
  } catch (e) { out(String(e.message || e)); }
};
document.getElementById("confirm").onclick = async () => {
  try { const tx = await wc.marketplace.confirmDelivery(idVal()); await tx.wait(); out("✅ delivery confirmed — seller paid"); }
  catch (e) { out(String(e.message || e)); }
};
document.getElementById("cancel").onclick = async () => {
  try { const tx = await wc.marketplace.cancelPurchase(idVal()); await tx.wait(); out("✅ purchase cancelled — refunded"); }
  catch (e) { out(String(e.message || e)); }
};
// TODO(member3): step indicator UI; skip approve if allowance already sufficient; or use purchaseWithPermit.
