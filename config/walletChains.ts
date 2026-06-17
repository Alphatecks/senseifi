import {
  mainnet,
  bsc,
  polygon,
  base,
  baseSepolia,
  type Chain,
} from 'wagmi/chains';
import { isTestnetOnchainBilling } from '@/config/onchainBilling';

/** Plain RPC URLs wallets accept for wallet_addEthereumChain (not WalletConnect proxy URLs). */
export const WALLET_SAFE_RPC_URLS: Readonly<Record<number, string>> = {
  1: 'https://eth.llamarpc.com',
  56: 'https://bsc-dataseed.binance.org',
  137: 'https://polygon-rpc.com',
  8453: 'https://mainnet.base.org',
  84532: 'https://sepolia.base.org',
};

export function withWalletSafeRpc(chain: Chain): Chain {
  const rpcUrl = WALLET_SAFE_RPC_URLS[chain.id];
  if (!rpcUrl) return chain;

  return {
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      default: { http: [rpcUrl] },
    },
  };
}

const walletChainById = {
  1: withWalletSafeRpc(mainnet),
  56: withWalletSafeRpc(bsc),
  137: withWalletSafeRpc(polygon),
  8453: withWalletSafeRpc(base),
  84532: withWalletSafeRpc(baseSepolia),
} as const satisfies Record<number, Chain>;

export const WALLET_CHAIN_LABELS: Readonly<Record<number, string>> = {
  1: 'Ethereum',
  56: 'BNB Smart Chain',
  137: 'Polygon',
  8453: 'Base',
  84532: 'Base Sepolia',
};

export function getWalletChainLabel(chainId: number): string {
  return WALLET_CHAIN_LABELS[chainId] ?? `Chain ${chainId}`;
}

/** EVM chain IDs registered together after wallet connect (same address, per-network backend rows). */
export function getWalletChainIds(): number[] {
  return getWalletChains().map((chain) => chain.id);
}

/** Chain order matches AppKit default network preference. */
export function getWalletChains(): readonly [Chain, ...Chain[]] {
  const ids = isTestnetOnchainBilling()
    ? ([84532, 8453, 1, 56, 137] as const)
    : ([8453, 84532, 1, 56, 137] as const);

  const chains = ids.map((id) => walletChainById[id]);

  if (chains.length === 0) {
    throw new Error('No wallet chains configured.');
  }

  return chains as unknown as readonly [Chain, ...Chain[]];
}
