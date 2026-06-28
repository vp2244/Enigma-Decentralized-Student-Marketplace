// Persistent wallet session — stores address in sessionStorage so it
// survives page navigation within the same browser tab.
// Single entry point: mountSidebarWallet(). No module should call
// connectWallet() or getSigner() independently — all wallet state
// flows through the sidebar callback.

import { connect, writeContracts, readContracts, net, formatTokens } from "./app.js";

const ADDR_KEY = "enigma.wallet.address";

export function getStoredAddress() {
  return sessionStorage.getItem(ADDR_KEY);
}

// Internal — not exported. Modules get signer via the onConnected callback.
async function connectWallet() {
  const { signer } = await connect();
  const address = await signer.getAddress();
  sessionStorage.setItem(ADDR_KEY, address);
  return { signer, address, wc: writeContracts(signer) };
}

async function fetchTokenBalance(address) {
  try {
    const rc = readContracts();
    const bal = await rc.token.balanceOf(address);
    return Number(formatTokens(bal)).toLocaleString(undefined, { maximumFractionDigits: 2 });
  } catch (_) {
    return null;
  }
}

// The sole wallet entry point. Call once per page.
// onConnected({ signer, wc, address }) fires when a wallet is live.
export async function mountSidebarWallet(containerId, onConnected) {
  const el = document.getElementById(containerId);
  if (!el) return;

  // Check if MetaMask already has an authorized account (no popup)
  let storedAddress = null;
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        storedAddress = accounts[0];
        sessionStorage.setItem(ADDR_KEY, storedAddress);
      }
    } catch (_) {}
  }
  if (!storedAddress) {
    storedAddress = sessionStorage.getItem(ADDR_KEY);
  }

  if (storedAddress) {
    // Show address immediately, then fetch signer + balance async
    renderConnected(el, storedAddress, null);
    try {
      const result = await connectWallet();
      const balance = await fetchTokenBalance(result.address);
      renderConnected(el, result.address, balance);
      onConnected && onConnected(result);
    } catch (_) {
      // MetaMask locked or switched — fall back to disconnected
      sessionStorage.removeItem(ADDR_KEY);
      renderDisconnected(el, () => handleConnect(el, onConnected));
    }
  } else {
    renderDisconnected(el, () => handleConnect(el, onConnected));
  }

  // React to MetaMask account changes
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        sessionStorage.removeItem(ADDR_KEY);
        renderDisconnected(el, () => handleConnect(el, onConnected));
      } else {
        sessionStorage.setItem(ADDR_KEY, accounts[0]);
        location.reload();
      }
    });
  }
}

async function handleConnect(el, onConnected) {
  try {
    const result = await connectWallet();
    const balance = await fetchTokenBalance(result.address);
    renderConnected(el, result.address, balance);
    onConnected && onConnected(result);
  } catch (e) {
    console.error("Wallet connect failed:", e);
  }
}

function disconnectWallet() {
  sessionStorage.removeItem(ADDR_KEY);
  location.reload();
}

function renderConnected(el, address, balance) {
  const short = address.slice(0, 6) + "…" + address.slice(-4);
  const balHtml = balance != null
    ? `<div class="wallet-token-balance"><span class="wallet-token-icon">🪙</span><span>${balance} ENGC</span></div>`
    : `<div class="wallet-token-balance wallet-token-loading">Loading balance…</div>`;
  el.innerHTML = `
    <div class="wallet-label">Connected Wallet</div>
    <div class="wallet-addr">${short}</div>
    <div class="wallet-badge">${net().label}</div>
    ${balHtml}
    <button class="btn-disconnect" id="sidebar-disconnect-btn">Disconnect</button>
  `;
  document.getElementById("sidebar-disconnect-btn").onclick = disconnectWallet;
}

function renderDisconnected(el, onConnect) {
  el.innerHTML = `
    <div class="wallet-disconnected">
      <span>No wallet connected</span>
      <button class="btn-connect-small" id="sidebar-connect-btn">Connect MetaMask</button>
    </div>
  `;
  document.getElementById("sidebar-connect-btn").onclick = onConnect;
}
