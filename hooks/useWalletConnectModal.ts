'use client';

import { useCallback } from 'react';
import { useConfig } from 'wagmi';
import {
  persistEvmWalletSession,
  waitForEvmWalletConnection,
  type WalletConnectFlowResult,
} from '@/utils/walletConnectFlow';

export function useWalletConnectModal() {
  const config = useConfig();

  const openWalletConnectModal = useCallback(async (): Promise<WalletConnectFlowResult | null> => {
    if (!config) {
      throw new Error('WalletConnect is still loading. Try again in a moment.');
    }

    const { getAppKitModal } = await import('@/config/appkit.client');
    const modal = getAppKitModal();
    if (!modal) {
      throw new Error('WalletConnect is still loading. Try again in a moment.');
    }

    const connectionPromise = waitForEvmWalletConnection(config);

    await modal.open({ view: 'Connect' });

    try {
      const connected = await Promise.race([
        connectionPromise,
        new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 3000)),
      ]);

      if (!connected?.address) return null;

      persistEvmWalletSession(connected.address);
      return connected;
    } catch (error) {
      connectionPromise.catch(() => {
        // Ignore late rejection after the modal flow ended.
      });
      throw error;
    }
  }, [config]);

  return { openWalletConnectModal };
}
