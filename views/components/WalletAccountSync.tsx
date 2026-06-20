'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { persistEvmWalletSession } from '@/utils/walletConnectFlow';

/** Keeps local wallet session in sync with wagmi on every page — not only /connect-wallet. */
export default function WalletAccountSync() {
  const { address, status } = useAccount();

  useEffect(() => {
    if (status !== 'connected' || !address?.trim()) return;
    persistEvmWalletSession(address.trim());
  }, [address, status]);

  return null;
}
