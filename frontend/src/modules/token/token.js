import { readContracts, mountNetworkSelector, parseTokens, formatTokens } from "../../shared/app.js";
import { mountSidebarWallet } from "../../shared/wallet.js";

mountNetworkSelector("net");

const outEl = document.getElementById("out");
const out = (m, type = "") => {
  outEl.textContent = m;
  outEl.className = "status-box" + (type ? " " + type : "");
};
const val = (id) => document.getElementById(id).value.trim();

let wc, addr;

async function loadBalance(address) {
  try {
    const bal = await readContracts().token.balanceOf(address);
    const formatted = formatTokens(bal);
    document.getElementById("bal-display").textContent = Number(formatted).toLocaleString() + " ENGC";
    document.getElementById("balance-display").innerHTML =
      `<div class="balance-chip">💰 ${Number(formatted).toLocaleString()} ENGC</div>`;
  } catch (e) {
    document.getElementById("bal-display").textContent = "Error loading";
  }
}

function showConnected(address) {
  document.getElementById("connected-info").style.display = "block";
  document.getElementById("addr-display").textContent = address;
  loadBalance(address);
}

document.getElementById("refresh-bal").onclick = () => {
  if (addr) loadBalance(addr);
};

document.getElementById("mint").onclick = async () => {
  if (!wc) { out("Connect your wallet via the sidebar first.", "err"); return; }
  try {
    const to = val("to") || addr;
    const amount = val("amt");
    if (!amount) { out("Enter an amount to mint.", "err"); return; }
    out("Sending mint transaction…", "pending");
    const tx = await wc.token.mint(to, parseTokens(amount));
    out("Waiting for confirmation… tx: " + tx.hash, "pending");
    await tx.wait();
    const bal = await readContracts().token.balanceOf(to);
    out(`✅ Minted ${amount} ENGC to ${to}\nNew balance: ${formatTokens(bal)} ENGC`, "ok");
    if (to.toLowerCase() === addr?.toLowerCase()) loadBalance(addr);
  } catch (e) {
    out(String(e.message || e), "err");
  }
};

// ── Single wallet entry point ─────────────────────────────────────────────
mountSidebarWallet("wallet-section", ({ wc: w, address: a }) => {
  wc = w; addr = a;
  showConnected(a);
});
