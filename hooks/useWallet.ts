'use client';

import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { walletService } from '../services/walletService';
import { useState } from 'react';
import { useDashboardUser } from '@/context/DashboardUserContext';

export function useWallet() {
  const { setDashboardUser } = useDashboardUser();
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const walletType: 'metamask' | 'coinbase' = (() => {
    const id = connector?.id ?? '';
    const name = (connector?.name ?? '').toLowerCase();
    if (id === 'coinbaseWalletSDK' || id === 'coinbaseWallet' || name.includes('coinbase')) return 'coinbase';
    return 'metamask';
  })();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const connectMetaMask = async () => {
    // Try multiple possible MetaMask connector IDs
    const metaMaskConnector = connectors.find((c) => 
      c.id === 'metaMask' || 
      c.id === 'io.metamask' ||
      c.name?.toLowerCase().includes('metamask')
    );
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    } else {
      console.error('MetaMask connector not found. Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));
    }
  };

  const connectCoinbase = async () => {
    // Try multiple possible Coinbase connector IDs
    const coinbaseConnector = connectors.find((c) => 
      c.id === 'coinbaseWalletSDK' || 
      c.id === 'coinbaseWallet' ||
      c.name?.toLowerCase().includes('coinbase')
    );
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector });
    } else {
      console.error('Coinbase Wallet connector not found. Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));
    }
  };

  const disconnectWallet = async () => {
    setIsDisconnecting(true);
    try {
      if (address) {
        try {
          await walletService.disconnectWallet(address);
        } catch (error) {
          console.error('Failed to disconnect wallet from backend:', error);
        }
      }
      setDashboardUser(null);
      disconnect();
    } finally {
      setIsDisconnecting(false);
    }
  };

  const registerWalletWithBackend = async (walletType: 'metamask' | 'coinbase') => {
    if (!address || !chainId) {
      throw new Error('Wallet not connected');
    }

    setIsRegistering(true);
    setRegistrationError(null);

    try {
      const { dashboard_user } = await walletService.connectWallet(address, chainId, walletType);
      if (dashboard_user) setDashboardUser(dashboard_user);
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
    isConnected,
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
  };
}
