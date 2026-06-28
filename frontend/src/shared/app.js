// Shared ethers.js wiring — dual-network (Anvil + Sepolia). Reads via public RPC; writes via MetaMask.
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.13.0/dist/ethers.min.js";
import { ABIS } from "./abi.js";
import { NETWORKS, DEFAULT_NETWORK } from "./config.js";

const KEY = "enigma.network";
export function activeNetworkKey() { return localStorage.getItem(KEY) || DEFAULT_NETWORK; }
export function setActiveNetwork(k) { localStorage.setItem(KEY, k); }
export function net() { return NETWORKS[activeNetworkKey()]; }

export function readProvider() { return new ethers.JsonRpcProvider(net().rpcUrl); }
export async function connect() {
  if (!window.ethereum) throw new Error("No wallet found. Reads work without one; writes need MetaMask on " + net().label + ".");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return { provider, signer: await provider.getSigner() };
}
function build(runner) {
  const a = net().addresses;
  return {
    token:       new ethers.Contract(a.EnigCredit,  ABIS.EnigCredit,  runner),
    marketplace: new ethers.Contract(a.Marketplace, ABIS.Marketplace, runner),
    reputation:  new ethers.Contract(a.Reputation,  ABIS.Reputation,  runner),
  };
}
export function readContracts()        { return build(readProvider()); }
export function writeContracts(signer) { return build(signer); }

export function parseTokens(x) { return ethers.parseUnits(String(x), 18); }
export function formatTokens(x) { return ethers.formatUnits(x, 18); }
export const STATUS = ["Available", "Pending", "Sold", "Cancelled"];

export function mountNetworkSelector(elId) {
  const el = document.getElementById(elId); if (!el) return;
  el.innerHTML = Object.entries(NETWORKS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("");
  el.value = activeNetworkKey();
  el.onchange = () => { setActiveNetwork(el.value); location.reload(); };
}
