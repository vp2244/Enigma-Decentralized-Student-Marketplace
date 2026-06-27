// Renders the sidebar and wraps page in the .layout div.
import { mountNetworkSelector } from "./app.js";

export function buildSidebar({ activePage }) {
  const pages = [
    { key: "token",      icon: "💳", label: "Token & Wallet",   href: "../token/index.html" },
    { key: "listings",   icon: "🏷️", label: "Browse Listings",  href: "../listings/index.html" },
    { key: "market",     icon: "🤝", label: "Escrow / Trade",   href: "../market/index.html" },
    { key: "reputation", icon: "⭐", label: "Reputation",       href: "../reputation/index.html" },
  ];

  const navItems = pages.map(p => {
    const cls = p.key === activePage ? "active" : "";
    return `<a href="${p.href}" class="${cls}">
      <span class="nav-icon">${p.icon}</span>
      <span>${p.label}</span>
    </a>`;
  }).join("");

  return `
<div class="sidebar">
  <div class="sidebar-logo">
    <div class="logo-mark">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polygon points="12,2 22,8 22,16 12,22 2,16 2,8"/>
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
      </svg>
      Enigma Market
    </div>
    <div class="tagline">Decentralized · Student Goods</div>
  </div>
  <div class="sidebar-wallet" id="wallet-section"></div>
  <nav class="sidebar-nav">
    <div class="nav-section-label">Modules</div>
    ${navItems}
    <div class="nav-section-label">Docs</div>
    <a href="../../docs/index.html">
      <span class="nav-icon">📖</span>
      <span>Documentation</span>
    </a>
    <a href="../../tracker/index.html">
      <span class="nav-icon">📊</span>
      <span>Tracker</span>
    </a>
  </nav>
  <div class="sidebar-footer">
    <div class="net-row">
      <span>Net:</span>
      <select id="net" class="net"></select>
    </div>
  </div>
</div>`;
}

export function initLayout({ activePage }) {
  // Wrap body content
  const originalBody = document.body.innerHTML;
  document.body.innerHTML = `
    <div class="layout">
      ${buildSidebar({ activePage })}
      <div class="main-content" id="main-content">
        ${originalBody}
      </div>
    </div>`;
  mountNetworkSelector("net");
}
