'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { useDashboardUser } from '@/context/DashboardUserContext';
import { walletService } from '@/services/walletService';
import { SOLANA_CONNECT_NETWORK } from '@/config/solana';
import {
  buildExtensionWalletBridgePayload,
  EXTENSION_REQUEST_SOURCE,
  EXTENSION_REQUEST_WALLET_SESSION,
  notifyExtensionWalletConnected,
  notifyExtensionWalletDisconnected,
} from '@/utils/extensionWalletBridge';

function sessionFingerprint(address: string, chainId: number, userId?: string): string {
  const normalized = address.startsWith('0x') ? address.toLowerCase() : address;
  return `${normalized}:${chainId}:${userId ?? ''}`;
}

export default function ExtensionWalletSync() {
  const pathname = usePathname();
  const {
    address: evmAddress,
    connectedAddress,
    chainId,
    isConnected,
    isConnectedOrRemembered,
    walletType,
    activeWalletType,
    isSolanaSession,
    activeChainFamily,
    hasHydratedWallet,
    isWalletSessionPending,
  } = useWallet();
  const { dashboardUser, setDashboardUser } = useDashboardUser();
  const lastSyncedRef = useRef('');
  const syncInFlightRef = useRef(false);

  const syncToExtension = useCallback(async () => {
    if (syncInFlightRef.current) return;
    if (!hasHydratedWallet || isWalletSessionPending) return;

    const syncAddress = (isConnected && evmAddress?.trim()) || connectedAddress?.trim();
    if (!syncAddress || !chainId) {
      if (lastSyncedRef.current) {
        lastSyncedRef.current = '';
        notifyExtensionWalletDisconnected();
      }
      return;
    }

    if (pathname === '/connect-wallet' && !isSolanaSession) {
      return;
    }

    syncInFlightRef.current = true;
    try {
      let walletData;
      let dashboardUserPayload = dashboardUser;
      const syncWalletType = isSolanaSession ? activeWalletType : walletType;

      try {
        walletData = await walletService.getWallet(syncAddress);
      } catch {
        const registered = await walletService.connectWallet(syncAddress, chainId, syncWalletType, {
          chainFamily: activeChainFamily,
          network: activeChainFamily === 'solana' ? SOLANA_CONNECT_NETWORK : undefined,
          userId: dashboardUser?.user_id,
        });
        walletData = registered.data;
        dashboardUserPayload = registered.dashboard_user ?? dashboardUser;
        if (registered.dashboard_user?.user_id) {
          setDashboardUser(registered.dashboard_user);
        }
      }

      const fingerprint = sessionFingerprint(
        syncAddress,
        chainId,
        dashboardUserPayload?.user_id
      );
      if (fingerprint === lastSyncedRef.current) return;

      notifyExtensionWalletConnected(
        buildExtensionWalletBridgePayload(
          syncAddress,
          chainId,
          syncWalletType,
          walletData,
          dashboardUserPayload,
          activeChainFamily
        )
      );
      lastSyncedRef.current = fingerprint;
    } catch (error) {
      console.warn('[ExtensionWalletSync] Failed to sync wallet session:', error);
    } finally {
      syncInFlightRef.current = false;
    }
  }, [
    activeChainFamily,
    activeWalletType,
    chainId,
    connectedAddress,
    dashboardUser,
    evmAddress,
    hasHydratedWallet,
    isConnected,
    isSolanaSession,
    isWalletSessionPending,
    pathname,
    setDashboardUser,
    walletType,
  ]);

  useEffect(() => {
    if (!hasHydratedWallet) return;
    if (!isConnectedOrRemembered && lastSyncedRef.current) {
      lastSyncedRef.current = '';
      notifyExtensionWalletDisconnected();
    }
  }, [hasHydratedWallet, isConnectedOrRemembered]);

  useEffect(() => {
    void syncToExtension();
  }, [syncToExtension]);

  useEffect(() => {
    function onExtensionRequest(event: MessageEvent) {
      if (event.source !== window) return;
      const data = event.data;
      if (!data || data.source !== EXTENSION_REQUEST_SOURCE) return;
      if (data.type !== EXTENSION_REQUEST_WALLET_SESSION) return;
      void syncToExtension();
    }

    window.addEventListener('message', onExtensionRequest);
    return () => window.removeEventListener('message', onExtensionRequest);
  }, [syncToExtension]);

  return null;
}
