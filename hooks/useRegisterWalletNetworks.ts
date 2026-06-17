'use client';

import { useCallback, useState } from 'react';
import { useDashboardUser } from '@/context/DashboardUserContext';
import {
  registerWalletOnAllNetworks,
  type RegisterWalletNetworksResult,
  type WalletNetworkRegistrationProgress,
} from '@/utils/registerWalletNetworks';
import type { WalletProviderType } from '@/services/walletService';

export type { RegisterWalletNetworksResult, WalletNetworkRegistrationProgress };

export function useRegisterWalletNetworks() {
  const { setDashboardUser } = useDashboardUser();
  const [isRegisteringNetworks, setIsRegisteringNetworks] = useState(false);
  const [registrationProgress, setRegistrationProgress] =
    useState<WalletNetworkRegistrationProgress | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [lastRegistrationSummary, setLastRegistrationSummary] = useState<{
    registered: number;
    skipped: number;
  } | null>(null);

  const registerWalletOnAllNetworksHook = useCallback(
    async (
      address: string,
      walletType: WalletProviderType,
      preferredChainId?: number
    ): Promise<RegisterWalletNetworksResult> => {
      setIsRegisteringNetworks(true);
      setRegistrationError(null);
      setLastRegistrationSummary(null);

      try {
        const result = await registerWalletOnAllNetworks(address, walletType, {
          preferredChainId,
          onProgress: setRegistrationProgress,
        });

        if (result.dashboard_user?.user_id) {
          setDashboardUser(result.dashboard_user);
        }

        setLastRegistrationSummary({
          registered: result.registeredChainIds.length,
          skipped: result.skippedChainIds.length,
        });

        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to register wallet networks';
        setRegistrationError(message);
        throw error;
      } finally {
        setRegistrationProgress(null);
        setIsRegisteringNetworks(false);
      }
    },
    [setDashboardUser]
  );

  return {
    registerWalletOnAllNetworks: registerWalletOnAllNetworksHook,
    isRegisteringNetworks,
    registrationProgress,
    registrationError,
    lastRegistrationSummary,
  };
}
