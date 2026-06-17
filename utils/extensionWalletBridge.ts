import type { ConnectWalletType, DashboardUser, WalletResponse } from '@/services/walletService';

export const EXTENSION_WALLET_BRIDGE_SOURCE = 'senseifi-connect-wallet';
export const EXTENSION_WALLET_BRIDGE_TYPE = 'SENSEIGUARD_EXTENSION_WALLET_CONNECTED';
export const EXTENSION_WALLET_BRIDGE_DISCONNECTED = 'SENSEIGUARD_EXTENSION_WALLET_DISCONNECTED';
export const EXTENSION_REQUEST_SOURCE = 'senseiguard-extension';
export const EXTENSION_REQUEST_WALLET_SESSION = 'SENSEIGUARD_REQUEST_WALLET_SESSION';

export function isExtensionWalletBridge(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('extension') === '1';
}

export function isSenseifiAppHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === 'senseifi.io' ||
    host === 'www.senseifi.io' ||
    host.endsWith('.senseifi.io')
  );
}

export function isSenseifiAppPage(): boolean {
  if (typeof window === 'undefined') return false;
  return isSenseifiAppHost(window.location.hostname);
}

export type ExtensionWalletBridgePayload = {
  address: string;
  chainId: number;
  walletType: string;
  chainFamily?: 'evm' | 'solana';
  wallet: {
    address: string;
    chain_id: number;
    wallet_type: string;
    chain_family?: string;
    connected_at: string;
    is_active: boolean;
  };
  dashboard_user: unknown;
};

export function buildExtensionWalletBridgePayload(
  address: string,
  chainId: number,
  walletType: ConnectWalletType,
  wallet: WalletResponse,
  dashboardUser: DashboardUser | null,
  chainFamily: 'evm' | 'solana' = 'evm'
): ExtensionWalletBridgePayload {
  return {
    address,
    chainId,
    walletType,
    chainFamily,
    wallet: {
      address: wallet.address,
      chain_id: wallet.chain_id,
      wallet_type: wallet.wallet_type,
      chain_family: wallet.chain_family ?? chainFamily,
      connected_at: wallet.connected_at,
      is_active: wallet.is_active,
    },
    dashboard_user: dashboardUser,
  };
}

export function notifyExtensionWalletConnected(payload: ExtensionWalletBridgePayload): void {
  if (!isSenseifiAppPage()) return;
  window.postMessage(
    {
      source: EXTENSION_WALLET_BRIDGE_SOURCE,
      type: EXTENSION_WALLET_BRIDGE_TYPE,
      payload,
    },
    window.location.origin
  );
}

export function notifyExtensionWalletDisconnected(): void {
  if (!isSenseifiAppPage()) return;
  window.postMessage(
    {
      source: EXTENSION_WALLET_BRIDGE_SOURCE,
      type: EXTENSION_WALLET_BRIDGE_DISCONNECTED,
      payload: {},
    },
    window.location.origin
  );
}
