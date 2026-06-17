import {
  SOLANA_SESSION_PROVIDER_KEY,
  SOLANA_SESSION_STORAGE_KEY,
} from '@/config/solana';
import type { SolanaBrowserWallet } from '@/utils/solanaWallet';

export const LAST_CONNECTED_WALLET_KEY = 'senseifi:last-connected-wallet';
export const WALLET_SESSION_REVOKED_KEY = 'senseifi:wallet-session-revoked';

export function isWalletSessionRevoked(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(WALLET_SESSION_REVOKED_KEY) === '1';
}

export function activateWalletSessionStorage(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(WALLET_SESSION_REVOKED_KEY);
}

export function revokeWalletSessionStorage(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WALLET_SESSION_REVOKED_KEY, '1');
  window.localStorage.removeItem(LAST_CONNECTED_WALLET_KEY);
  window.localStorage.removeItem(SOLANA_SESSION_STORAGE_KEY);
  window.localStorage.removeItem(SOLANA_SESSION_PROVIDER_KEY);
}

export function readStoredWalletAddresses(): {
  evm: string | null;
  solana: string | null;
  solanaProvider: SolanaBrowserWallet | null;
} {
  if (typeof window === 'undefined') {
    return { evm: null, solana: null, solanaProvider: null };
  }

  const evm = window.localStorage.getItem(LAST_CONNECTED_WALLET_KEY)?.trim() || null;
  const solana = window.localStorage.getItem(SOLANA_SESSION_STORAGE_KEY)?.trim() || null;
  const providerRaw = window.localStorage.getItem(SOLANA_SESSION_PROVIDER_KEY);
  const solanaProvider =
    providerRaw === 'phantom' || providerRaw === 'solflare' || providerRaw === 'backpack'
      ? providerRaw
      : null;

  return { evm, solana, solanaProvider };
}
