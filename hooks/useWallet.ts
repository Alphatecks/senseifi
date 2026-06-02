'use client';

import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { walletService, type DashboardUser } from '../services/walletService';
import { useEffect, useMemo, useState } from 'react';
import { useDashboardUser } from '@/context/DashboardUserContext';

const LAST_CONNECTED_WALLET_KEY = 'senseifi:last-connected-wallet';

export function useWallet() {
  const { setDashboardUser } = useDashboardUser();
  const { address, isConnected, connector, status } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [persistedAddress, setPersistedAddress] = useState<string | null>(null);

  const walletType: 'metamask' | 'coinbase' = (() => {
    const id = connector?.id ?? '';
    const name = (connector?.name ?? '').toLowerCase();
    if (id === 'coinbaseWalletSDK' || id === 'coinbaseWallet' || name.includes('coinbase')) return 'coinbase';
    return 'metamask';
  })();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [hasHydratedWallet, setHasHydratedWallet] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(LAST_CONNECTED_WALLET_KEY);
    if (stored?.trim()) setPersistedAddress(stored.trim());
    setHasHydratedWallet(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isConnected && address?.trim()) {
      window.localStorage.setItem(LAST_CONNECTED_WALLET_KEY, address.trim());
      setPersistedAddress(address.trim());
    }
  }, [isConnected, address]);

  const isWalletRestoring = status === 'connecting' || status === 'reconnecting';
  const isWalletSessionPending = isWalletRestoring || isPending;

  const connectedAddress = useMemo(() => {
    if (address?.trim()) return address.trim();
    return persistedAddress;
  }, [address, persistedAddress]);

  const connectMetaMask = async () => {
    // Try multiple possible MetaMask connector IDs
    const metaMaskConnector = connectors.find((c) => 
      c.id === 'metaMask' || 
      c.id === 'metaMaskSDK' ||
      c.id === 'io.metamask' ||
      c.name?.toLowerCase().includes('metamask')
    );
    if (!metaMaskConnector) {
      const available = connectors.map((c) => ({ id: c.id, name: c.name }));
      console.error('MetaMask connector not found. Available connectors:', available);
      throw new Error('MetaMask connector not found');
    }
    await connectAsync({ connector: metaMaskConnector });
  };

  const connectCoinbase = async () => {
    // Try multiple possible Coinbase connector IDs
    const coinbaseConnector = connectors.find((c) => 
      c.id === 'coinbaseWalletSDK' || 
      c.id === 'coinbaseWallet' ||
      c.name?.toLowerCase().includes('coinbase')
    );
    if (!coinbaseConnector) {
      const available = connectors.map((c) => ({ id: c.id, name: c.name }));
      console.error('Coinbase Wallet connector not found. Available connectors:', available);
      throw new Error('Coinbase Wallet connector not found');
    }
    await connectAsync({ connector: coinbaseConnector });
  };

  const disconnectWallet = async () => {
    setIsDisconnecting(true);
    try {
      if (connectedAddress) {
        try {
          await walletService.disconnectWallet(connectedAddress);
        } catch (error) {
          console.error('Failed to disconnect wallet from backend:', error);
        }
      }
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(LAST_CONNECTED_WALLET_KEY);
      }
      setPersistedAddress(null);
      setDashboardUser(null);
      disconnect();
    } finally {
      setIsDisconnecting(false);
    }
  };

  const registerWalletWithBackend = async (
    walletTypeOverride?: 'metamask' | 'coinbase'
  ): Promise<DashboardUser | null> => {
    if (!address || !chainId) {
      throw new Error('Wallet not connected');
    }

    setIsRegistering(true);
    setRegistrationError(null);

    try {
      const resolvedWalletType = walletTypeOverride ?? walletType;
      const { dashboard_user } = await walletService.connectWallet(address, chainId, resolvedWalletType);
      if (dashboard_user) setDashboardUser(dashboard_user);
      return dashboard_user ?? null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register wallet';
      setRegistrationError(errorMessage);
      throw error;
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    address,
    activeAddress: connectedAddress,
    connectedAddress,
    isConnected,
    isConnectedOrRemembered: Boolean(connectedAddress),
    chainId,
    walletType,
    connectMetaMask,
    connectCoinbase,
    disconnectWallet,
    registerWalletWithBackend,
    isRegistering,
    isDisconnecting,
    registrationError,
    isPending,
    isWalletRestoring,
    isWalletSessionPending,
    hasHydratedWallet,
    walletStatus: status,
  };
}
