/**
 * Same default as frontend services/walletService.ts (NEXT_PUBLIC_WALLET_API_URL).
 * Override by editing before load, or replace with your deployed API origin + /api.
 */
window.SENSEIGUARD = window.SENSEIGUARD || {};
window.SENSEIGUARD.WALLET_API_BASE_URL =
  window.SENSEIGUARD.WALLET_API_BASE_URL || 'https://senseifi-backend.onrender.com/api';
window.SENSEIGUARD.EXTENSION_TRADE_INSIGHTS_DEFAULTS =
  window.SENSEIGUARD.EXTENSION_TRADE_INSIGHTS_DEFAULTS || {
    page: 1,
    per_page: 10,
    period: '7d',
    risk_level: 'high',
    search: 'approval',
  };
window.SENSEIGUARD.DASHBOARD_URL =
  window.SENSEIGUARD.DASHBOARD_URL || 'https://senseifi.io/guard';
/** Injected-provider bridge (MetaMask / Coinbase on senseifi.io). */
window.SENSEIGUARD.INJECTED_WALLET_BRIDGE_URL =
  window.SENSEIGUARD.INJECTED_WALLET_BRIDGE_URL || 'https://senseifi.io/guard';
/** Reown AppKit bridge — same /connect-wallet page as the web app (?extension=1 added at runtime). */
window.SENSEIGUARD.WALLET_CONNECT_BRIDGE_URL =
  window.SENSEIGUARD.WALLET_CONNECT_BRIDGE_URL || 'https://senseifi.io/connect-wallet';
/** For local dev with `npm run dev`, point both bridge URLs at localhost. */
// window.SENSEIGUARD.WALLET_CONNECT_BRIDGE_URL = 'http://localhost:3000/connect-wallet';
// window.SENSEIGUARD.INJECTED_WALLET_BRIDGE_URL = 'http://localhost:3000/guard';
