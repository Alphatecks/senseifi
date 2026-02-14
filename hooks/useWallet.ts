'use client';

import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { walletService } from '../services/walletService';
import { useState, useEffect } from 'react';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [isRegistering, setIsRegistering] = useState(false);
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
    if (address) {
      try {
        // Disconnect from backend first
        await walletService.disconnectWallet(address);
      } catch (error) {
        console.error('Failed to disconnect wallet from backend:', error);
        // Continue with local disconnect even if backend call fails
      }
    }
    // Disconnect from wagmi
    disconnect();
  };

  const registerWalletWithBackend = async (walletType: 'metamask' | 'coinbase') => {
    if (!address || !chainId) {
      throw new Error('Wallet not connected');
    }

    setIsRegistering(true);
    setRegistrationError(null);

    try {
      await walletService.connectWallet(address, chainId, walletType);
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
    connectMetaMask,
    connectCoinbase,
    disconnectWallet,
    registerWalletWithBackend,
    isRegistering,
    registrationError,
    isPending,
  };
}
