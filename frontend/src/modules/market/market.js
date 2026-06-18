import { connect, writeContracts, readContracts, mountNetworkSelector, net } from "../../shared/app.js";
mountNetworkSelector("net");
const out = (m) => (document.getElementById("out").textContent = m);
let signer, wc;
document.getElementById("connect").onclick = async () => {
  try { ({ signer } = await connect()); wc = writeContracts(signer);
    document.getElementById("who").textContent = "Connected: " + (await signer.getAddress()) + " · " + net().label;
  } catch (e) { out(String(e.message || e)); }
};
// TODO(member3): wire buy(approve+purchaseItem), confirmDelivery, cancelPurchase, rateUser, show avg
document.getElementById("buy").onclick = () => out("TODO(member3): implement approve + purchaseItem");
document.getElementById("confirm").onclick = () => out("TODO(member3): implement confirmDelivery");
document.getElementById("cancel").onclick = () => out("TODO(member3): implement cancelPurchase");
document.getElementById("rate").onclick = () => out("TODO(member3): implement rateUser");
document.getElementById("avg").onclick = () => out("TODO(member3): implement getAverageRating");
