import { createConfig, createStorage, http, type Config } from 'wagmi';
import { coinbaseWallet, injected } from '@wagmi/connectors';
import { getWalletChains, WALLET_SAFE_RPC_URLS } from '@/config/walletChains';

let clientConfig: Config | undefined;

export function getWagmiConfig() {
  if (typeof window === 'undefined') return undefined;
  if (!clientConfig) {
    clientConfig = createWagmiConfig();
  }
  return clientConfig;
}

export function createWagmiConfig() {
  const chains = getWalletChains();

  return createConfig({
    chains,
    ssr: true,
    storage: createStorage({
      storage: window.localStorage,
    }),
    connectors: [
      injected({ target: 'metaMask' }),
      coinbaseWallet({
        appName: 'SenseiFi',
      }),
    ],
    transports: {
      1: http(WALLET_SAFE_RPC_URLS[1]),
      56: http(WALLET_SAFE_RPC_URLS[56]),
      137: http(WALLET_SAFE_RPC_URLS[137]),
      8453: http(WALLET_SAFE_RPC_URLS[8453]),
      84532: http(WALLET_SAFE_RPC_URLS[84532]),
    },
  });
}
