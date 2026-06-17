import {
  getWalletChainIds,
  getWalletChainLabel,
} from '@/config/walletChains';
import {
  walletService,
  type ConnectWalletResult,
  type WalletProviderType,
} from '@/services/walletService';

export type WalletNetworkRegistrationProgress = {
  current: number;
  total: number;
  chainId: number;
  chainName: string;
};

export type RegisterWalletNetworksResult = ConnectWalletResult & {
  registeredChainIds: number[];
  skippedChainIds: number[];
};

function isAlreadyConnectedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /already connected|already registered|duplicate/i.test(message);
}

function orderChainIds(chainIds: number[], preferredChainId?: number): number[] {
  const unique = Array.from(new Set(chainIds));
  if (!preferredChainId) return unique;
  return [
    ...unique.filter((id) => id === preferredChainId),
    ...unique.filter((id) => id !== preferredChainId),
  ];
}

export function notifyWalletsUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('senseifi:wallets-updated'));
}

/**
 * @deprecated The live API stores one wallet row per EVM address and updates `chain_id`
 * on each connect — looping chains overwrites the active network. Use a single
 * `walletService.connectWallet` call for the wallet's current chain instead.
 */
export async function registerWalletOnAllNetworks(
  address: string,
  walletType: WalletProviderType,
  options?: {
    preferredChainId?: number;
    onProgress?: (progress: WalletNetworkRegistrationProgress) => void;
  }
): Promise<RegisterWalletNetworksResult> {
  const trimmedAddress = address.trim();
  if (!trimmedAddress) {
    throw new Error('Wallet not connected');
  }

  const chainIds = orderChainIds(getWalletChainIds(), options?.preferredChainId);
  const registeredChainIds: number[] = [];
  const skippedChainIds: number[] = [];
  let primaryResult: ConnectWalletResult | null = null;

  for (let index = 0; index < chainIds.length; index += 1) {
    const chainId = chainIds[index];
    const chainName = getWalletChainLabel(chainId);
    options?.onProgress?.({
      current: index + 1,
      total: chainIds.length,
      chainId,
      chainName,
    });

    try {
      const result = await walletService.connectWallet(trimmedAddress, chainId, walletType);
      registeredChainIds.push(chainId);
      if (!primaryResult) {
        primaryResult = result;
      } else if (
        primaryResult &&
        !primaryResult.dashboard_user?.user_id &&
        result.dashboard_user?.user_id
      ) {
        primaryResult = {
          data: primaryResult.data,
          dashboard_user: result.dashboard_user,
          alreadyConnected: primaryResult.alreadyConnected,
        };
      }
    } catch (error) {
      if (isAlreadyConnectedError(error)) {
        registeredChainIds.push(chainId);
        continue;
      }

      if (index === 0) {
        throw error;
      }

      console.warn(`[wallet] Skipped network registration for ${chainName}:`, error);
      skippedChainIds.push(chainId);
    }
  }

  if (!primaryResult || registeredChainIds.length === 0) {
    throw new Error('Could not register your wallet on any supported network.');
  }

  notifyWalletsUpdated();

  return {
    ...primaryResult,
    registeredChainIds,
    skippedChainIds,
  };
}
