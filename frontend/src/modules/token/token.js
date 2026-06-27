import { connect, writeContracts, readContracts, mountNetworkSelector, net, parseTokens, formatTokens } from "../../shared/app.js";
mountNetworkSelector("net");
const out = (m) => (document.getElementById("out").textContent = m);
const val = (id) => document.getElementById(id).value.trim();
let signer, wc, addr;

document.getElementById("connect").onclick = async () => {
  try {
    ({ signer } = await connect());
    wc = writeContracts(signer);
    addr = await signer.getAddress();
    const bal = await readContracts().token.balanceOf(addr);
    document.getElementById("who").textContent = "Connected: " + addr + " · " + net().label;
    document.getElementById("bal").textContent = "Balance: " + formatTokens(bal) + " ENGC";
  } catch (e) { out(String(e.message || e)); }
};

document.getElementById("mint").onclick = async () => {
  try {
    if (!wc) { out("Connect your wallet first."); return; }
    const to = val("to") || addr;
    const amount = val("amt");
    if (!amount) { out("Enter an amount to mint."); return; }
    out("Sending mint transaction...");
    const tx = await wc.token.mint(to, parseTokens(amount));
    out("Waiting for confirmation...  tx: " + tx.hash);
    await tx.wait();
    const bal = await readContracts().token.balanceOf(to);
    out("✅ Minted " + amount + " ENGC to " + to + "\nNew balance: " + formatTokens(bal) + " ENGC");
  } catch (e) { out(String(e.message || e)); }
};
