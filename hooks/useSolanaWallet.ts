'use client';

import { useCallback, useState } from 'react';
import { useDashboardUser } from '@/context/DashboardUserContext';
import { useWallet } from '@/hooks/useWallet';
import { syncWalletAssets } from '@/services/dashboardService';
import { walletService } from '@/services/walletService';
import { SOLANA_CHAIN_ID, SOLANA_CONNECT_NETWORK, SOLANA_SESSION_STORAGE_KEY, SOLANA_SESSION_PROVIDER_KEY } from '@/config/solana';
import { activateWalletSessionStorage } from '@/utils/walletSession';
import {
  buildExtensionWalletBridgePayload,
  notifyExtensionWalletConnected,
} from '@/utils/extensionWalletBridge';
import {
  connectSolanaBrowserWallet,
  type SolanaBrowserWallet,
} from '@/utils/solanaWallet';
import { notifyWalletsUpdated } from '@/utils/registerWalletNetworks';

export function useSolanaWallet() {
  const { dashboardUser, setDashboardUser } = useDashboardUser();
  const { connectedAddress: evmAddress } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerSolanaWallet = useCallback(
    async (wallet: SolanaBrowserWallet) => {
      setIsConnecting(true);
      setError(null);

      try {
        const { address, walletName } = await connectSolanaBrowserWallet(wallet);
        const userId = dashboardUser?.user_id?.trim();
        const linkAddress = !userId ? evmAddress?.trim() : undefined;

        const result = await walletService.connectWallet(address, SOLANA_CHAIN_ID, wallet, {
          chainFamily: 'solana',
          network: SOLANA_CONNECT_NETWORK,
          userId,
          linkWalletAddress: linkAddress,
          walletProvider: wallet,
          walletName,
        });

        if (result.dashboard_user?.user_id) {
          setDashboardUser(result.dashboard_user);
        }

        if (typeof window !== 'undefined') {
          activateWalletSessionStorage();
          window.localStorage.setItem(SOLANA_SESSION_STORAGE_KEY, address);
          window.localStorage.setItem(SOLANA_SESSION_PROVIDER_KEY, wallet);
          window.dispatchEvent(new CustomEvent('senseifi:wallet-session-activated'));
        }

        notifyExtensionWalletConnected(
          buildExtensionWalletBridgePayload(
            address,
            SOLANA_CHAIN_ID,
            wallet,
            result.data,
            result.dashboard_user ?? dashboardUser,
            'solana'
          )
        );

        const syncResult = await syncWalletAssets(address);
        if (!syncResult.ok) {
          console.warn('[Solana] Asset sync after connect:', syncResult.message);
        }

        notifyWalletsUpdated();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to connect Solana wallet';
        setError(message);
        throw err;
      } finally {
        setIsConnecting(false);
      }
    },
    [dashboardUser?.user_id, evmAddress, setDashboardUser]
  );

  return {
    registerSolanaWallet,
    isConnecting,
    error,
    clearError: () => setError(null),
  };
}
