import { connect, writeContracts, readContracts, mountNetworkSelector, net, parseTokens, formatTokens } from "../../shared/app.js";
mountNetworkSelector("net");
const out = (m) => (document.getElementById("out").textContent = m);
let signer, wc;
document.getElementById("connect").onclick = async () => {
  try { ({ signer } = await connect()); wc = writeContracts(signer);
    document.getElementById("who").textContent = "Connected: " + (await signer.getAddress()) + " · " + net().label;
  } catch (e) { out(String(e.message || e)); }
};
document.getElementById("create").onclick = () => out("TODO(member2): implement createListing call");
document.getElementById("refresh").onclick = () => out("TODO(member2): browse via totalListings()/getListing()");
