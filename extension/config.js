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
