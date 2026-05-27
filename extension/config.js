/**
 * Same default as frontend services/walletService.ts (NEXT_PUBLIC_WALLET_API_URL).
 * Override by editing before load, or replace with your deployed API origin + /api.
 */
window.SENSEIGUARD = window.SENSEIGUARD || {};
window.SENSEIGUARD.WALLET_API_BASE_URL =
  window.SENSEIGUARD.WALLET_API_BASE_URL || 'https://senseifi-backend.onrender.com/api';
window.SENSEIGUARD.DASHBOARD_URL =
  window.SENSEIGUARD.DASHBOARD_URL || 'https://senseifi.io/guard';
