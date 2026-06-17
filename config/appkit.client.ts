'use client';

import type { Config } from 'wagmi';
import type { AppKitNetwork } from '@reown/appkit-common';
import type { AppKit } from '@reown/appkit/react';
import {
  APP_KIT_METADATA,
  WALLETCONNECT_PROJECT_ID,
} from '@/config/appkit';
import { getWalletChains } from '@/config/walletChains';

let initPromise: Promise<Config> | null = null;
let appKitModal: AppKit | null = null;

export function getAppKitModal(): AppKit | null {
  return appKitModal;
}

/**
 * Loads Reown AppKit + WagmiAdapter only in the browser.
 * Must not be imported from server-rendered modules.
 */
export function initClientWalletStack(): Promise<Config> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Wallet stack can only initialize in the browser.'));
  }

  if (!initPromise) {
    initPromise = (async () => {
      const [{ WagmiAdapter }, { createAppKit }] = await Promise.all([
        import('@reown/appkit-adapter-wagmi'),
        import('@reown/appkit/react'),
      ]);

      const networks = getWalletChains() as unknown as [AppKitNetwork, ...AppKitNetwork[]];

      if (networks.length === 0) {
        throw new Error('No supported networks configured for WalletConnect.');
      }

      const wagmiAdapter = new WagmiAdapter({
        networks,
        projectId: WALLETCONNECT_PROJECT_ID,
        ssr: false,
      });

      appKitModal = createAppKit({
        adapters: [wagmiAdapter],
        networks,
        projectId: WALLETCONNECT_PROJECT_ID,
        metadata: APP_KIT_METADATA,
        themeMode: 'dark',
        features: { analytics: false },
      });

      return wagmiAdapter.wagmiConfig;
    })();
  }

  return initPromise;
}
