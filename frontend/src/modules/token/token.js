import { connect, writeContracts, readContracts, mountNetworkSelector, net, parseTokens, formatTokens } from "../../shared/app.js";
mountNetworkSelector("net");
const out = (m) => (document.getElementById("out").textContent = m);
const val = (id) => document.getElementById(id).value.trim();
let signer, wc, addr;
document.getElementById("connect").onclick = async () => {
  try { ({ signer } = await connect()); wc = writeContracts(signer); addr = await signer.getAddress();
    document.getElementById("who").textContent = "Connected: " + addr + " · " + net().label;
    // TODO(member1): show balance via readContracts().token.balanceOf(addr) + formatTokens
  } catch (e) { out(String(e.message || e)); }
};
document.getElementById("mint").onclick = () => out("TODO(member1): implement mint call");
