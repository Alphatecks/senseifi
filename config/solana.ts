/** Backend stores Solana wallets with chain_id 101 regardless of client payload. */
export const SOLANA_CHAIN_ID = 101;

/** Passed to POST /wallets/connect for Solana mainnet. */
export const SOLANA_CONNECT_NETWORK = 'mainnet-beta';

/** Persisted after a successful Solana browser-wallet connect (Guard session). */
export const SOLANA_SESSION_STORAGE_KEY = 'senseifi:last-connected-solana-wallet';

/** Phantom / Solflare / Backpack — stored alongside the Solana session address. */
export const SOLANA_SESSION_PROVIDER_KEY = 'senseifi:last-connected-solana-provider';

export const SOLANA_WALLET_INSTALL_URLS = {
  phantom: 'https://phantom.app/',
  solflare: 'https://solflare.com/',
  backpack: 'https://backpack.app/',
} as const;
