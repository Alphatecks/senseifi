'use client';

import type { Config } from 'wagmi';
import { getAccount, watchAccount } from 'wagmi/actions';
import {
  activateWalletSessionStorage,
  LAST_CONNECTED_WALLET_KEY,
} from '@/utils/walletSession';

export type WalletConnectFlowResult = {
  address: `0x${string}`;
  chainId: number | null;
};

function readConnectedAccount(config: Config): WalletConnectFlowResult | null {
  const account = getAccount(config);
  if (account.status !== 'connected' || !account.address) return null;
  return {
    address: account.address,
    chainId: account.chainId ?? null,
  };
}

export function persistEvmWalletSession(address: string): void {
  activateWalletSessionStorage();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LAST_CONNECTED_WALLET_KEY, address.trim());
    window.dispatchEvent(new CustomEvent('senseifi:wallet-session-activated'));
  }
}

/**
 * Resolves when wagmi reports a connected EVM account, or rejects on timeout.
 * Safe to call before opening the AppKit modal so we never miss a fast connect.
 */
export function waitForEvmWalletConnection(
  config: Config,
  timeoutMs = 120_000,
): Promise<WalletConnectFlowResult> {
  const existing = readConnectedAccount(config);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (result: WalletConnectFlowResult | null, error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      unwatch();
      if (result) resolve(result);
      else reject(error ?? new Error('Wallet connection timed out.'));
    };

    const timeoutId = window.setTimeout(() => {
      finish(null, new Error('Wallet connection timed out. Try again.'));
    }, timeoutMs);

    const unwatch = watchAccount(config, {
      onChange(account) {
        if (account.status === 'connected' && account.address) {
          finish({
            address: account.address,
            chainId: account.chainId ?? null,
          });
        }
      },
    });

    const latest = readConnectedAccount(config);
    if (latest) finish(latest);
  });
}
