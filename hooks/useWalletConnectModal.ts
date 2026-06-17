'use client';

import { useCallback } from 'react';

export function useWalletConnectModal() {
  const openWalletConnectModal = useCallback(async () => {
    const { getAppKitModal } = await import('@/config/appkit.client');
    const modal = getAppKitModal();
    if (!modal) {
      throw new Error('WalletConnect is still loading. Try again in a moment.');
    }
    await modal.open({ view: 'Connect' });
  }, []);

  return { openWalletConnectModal };
}
