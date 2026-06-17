'use client';

import { useAccount, useDisconnect, useChainId } from 'wagmi';
import {
  walletService,
  type DashboardUser,
  type WalletProviderType,
  type ConnectWalletType,
} from '../services/walletService';
import { useEffect, useMemo, useState } from 'react';
import { useDashboardUser } from '@/context/DashboardUserContext';
import { notifyExtensionWalletDisconnected } from '@/utils/extensionWalletBridge';
import { isWalletConnectConfigured } from '@/config/appkit';
import { SOLANA_CHAIN_ID } from '@/config/solana';
import type { SolanaBrowserWallet } from '@/utils/solanaWallet';
import { disconnectSolanaBrowserWallet } from '@/utils/solanaWallet';
import type { Connector } from 'wagmi';
import {
  LAST_CONNECTED_WALLET_KEY,
  activateWalletSessionStorage,
  isWalletSessionRevoked,
  readStoredWalletAddresses,
  revokeWalletSessionStorage,
} from '@/utils/walletSession';

function resolveWalletType(connector?: Connector): WalletProviderType {
  const id = connector?.id ?? '';
  const name = (connector?.name ?? '').toLowerCase();
  if (id.includes('coinbase') || name.includes('coinbase')) return 'coinbase';
  if (id === 'walletConnect' || id.includes('walletconnect') || name.includes('walletconnect')) {
    return 'walletconnect';
  }
  if (id.includes('metamask') || name.includes('metamask')) return 'metamask';
  return 'walletconnect';
}

export function useWallet() {
  const { dashboardUser, setDashboardUser } = useDashboardUser();
  const { address, isConnected, connector, status } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [sessionRevoked, setSessionRevoked] = useState(false);
  const [persistedAddress, setPersistedAddress] = useState<string | null>(null);
  const [persistedSolanaAddress, setPersistedSolanaAddress] = useState<string | null>(null);
  const [persistedSolanaProvider, setPersistedSolanaProvider] = useState<SolanaBrowserWallet | null>(null);

  const walletType = resolveWalletType(connector);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [hasHydratedWallet, setHasHydratedWallet] = useState(false);

  useEffect(() => {
    const revoked = isWalletSessionRevoked();
    setSessionRevoked(revoked);

    if (revoked) {
      setHasHydratedWallet(true);
      return;
    }

    const stored = readStoredWalletAddresses();
    if (stored.evm) setPersistedAddress(stored.evm);
    if (stored.solana) setPersistedSolanaAddress(stored.solana);
    if (stored.solanaProvider) setPersistedSolanaProvider(stored.solanaProvider);
    setHasHydratedWallet(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || sessionRevoked) return;
    if (isConnected && address?.trim()) {
      activateWalletSessionStorage();
      window.localStorage.setItem(LAST_CONNECTED_WALLET_KEY, address.trim());
      setPersistedAddress(address.trim());
    }
  }, [isConnected, address, sessionRevoked]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyActivatedSession = () => {
      setSessionRevoked(false);
      const stored = readStoredWalletAddresses();
      if (stored.evm) setPersistedAddress(stored.evm);
      if (stored.solana) setPersistedSolanaAddress(stored.solana);
      setPersistedSolanaProvider(stored.solanaProvider);
    };

    const refreshSolanaSession = () => {
      if (sessionRevoked) return;
      const stored = readStoredWalletAddresses();
      setPersistedSolanaAddress(stored.solana);
      setPersistedSolanaProvider(stored.solanaProvider);
    };

    refreshSolanaSession();
    window.addEventListener('senseifi:wallets-updated', refreshSolanaSession);
    window.addEventListener('senseifi:wallet-session-activated', applyActivatedSession);
    return () => {
      window.removeEventListener('senseifi:wallets-updated', refreshSolanaSession);
      window.removeEventListener('senseifi:wallet-session-activated', applyActivatedSession);
    };
  }, [sessionRevoked]);

  const isWalletRestoring = status === 'connecting' || status === 'reconnecting';
  const isWalletSessionPending = isWalletRestoring;

  const connectedAddress = useMemo(() => {
    if (sessionRevoked) return null;
    if (address?.trim()) return address.trim();
    if (persistedAddress?.trim()) return persistedAddress.trim();
    if (persistedSolanaAddress?.trim()) return persistedSolanaAddress.trim();
    return null;
  }, [sessionRevoked, address, persistedAddress, persistedSolanaAddress]);

  const isSolanaSession = useMemo(() => {
    if (sessionRevoked) return false;
    if (address?.trim() || persistedAddress?.trim()) return false;
    return Boolean(persistedSolanaAddress?.trim());
  }, [sessionRevoked, address, persistedAddress, persistedSolanaAddress]);

  const activeWalletType: ConnectWalletType = useMemo(() => {
    if (isSolanaSession) return persistedSolanaProvider ?? 'phantom';
    return walletType;
  }, [isSolanaSession, persistedSolanaProvider, walletType]);

  const activeChainFamily = isSolanaSession ? ('solana' as const) : ('evm' as const);

  const activeChainId = useMemo(() => {
    if (sessionRevoked) return undefined;
    if (address?.trim()) return chainId;
    if (isSolanaSession) return SOLANA_CHAIN_ID;
    return chainId;
  }, [sessionRevoked, address, chainId, isSolanaSession]);

  const disconnectWallet = async () => {
    setIsDisconnecting(true);
    try {
      const stored = readStoredWalletAddresses();
      const addressesToDisconnect = new Set<string>();
      if (connectedAddress) addressesToDisconnect.add(connectedAddress);
      if (stored.evm) addressesToDisconnect.add(stored.evm);
      if (stored.solana) addressesToDisconnect.add(stored.solana);

      for (const walletAddress of addressesToDisconnect) {
        try {
          await walletService.disconnectWallet(walletAddress);
        } catch (error) {
          console.error('Failed to disconnect wallet from backend:', error);
        }
      }

      if (stored.solanaProvider) {
        try {
          await disconnectSolanaBrowserWallet(stored.solanaProvider);
        } catch {
          // Ignore extension wallet disconnect errors.
        }
      }

      revokeWalletSessionStorage();
      setSessionRevoked(true);
      setPersistedAddress(null);
      setPersistedSolanaAddress(null);
      setPersistedSolanaProvider(null);
      setDashboardUser(null);
      notifyExtensionWalletDisconnected();
      disconnect();
    } finally {
      setIsDisconnecting(false);
    }
  };

  const registerWalletWithBackend = async (
    walletTypeOverride?: WalletProviderType
  ): Promise<{ data: import('../services/walletService').WalletResponse; dashboard_user: DashboardUser | null }> => {
    if (!address || !chainId) {
      throw new Error('Wallet not connected');
    }

    setIsRegistering(true);
    setRegistrationError(null);

    try {
      activateWalletSessionStorage();
      setSessionRevoked(false);
      window.dispatchEvent(new CustomEvent('senseifi:wallet-session-activated'));

      const resolvedWalletType = walletTypeOverride ?? walletType;
      const { data, dashboard_user } = await walletService.connectWallet(
        address,
        chainId,
        resolvedWalletType,
        {
          chainFamily: 'evm',
          userId: dashboardUser?.user_id,
        }
      );
      if (dashboard_user) setDashboardUser(dashboard_user);
      return { data, dashboard_user: dashboard_user ?? null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register wallet';
      setRegistrationError(errorMessage);
      throw error;
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    address: sessionRevoked ? undefined : address,
    activeAddress: connectedAddress,
    connectedAddress,
    isConnected: sessionRevoked ? false : isConnected,
    isConnectedOrRemembered: Boolean(connectedAddress),
    chainId: activeChainId,
    walletType,
    activeWalletType,
    isSolanaSession,
    activeChainFamily,
    sessionRevoked,
    disconnectWallet,
    registerWalletWithBackend,
    isRegistering,
    isDisconnecting,
    registrationError,
    isWalletRestoring,
    isWalletSessionPending,
    hasHydratedWallet,
    walletStatus: status,
    isWalletConnectReady: isWalletConnectConfigured(),
  };
}
