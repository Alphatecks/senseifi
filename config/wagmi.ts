import { createConfig, createStorage, http, type Config } from 'wagmi';
import { mainnet, bsc, polygon, base } from 'wagmi/chains';
import { coinbaseWallet, injected } from '@wagmi/connectors';

let clientConfig: Config | undefined;

export function getWagmiConfig() {
  if (typeof window === 'undefined') return undefined;
  if (!clientConfig) {
    clientConfig = createWagmiConfig();
  }
  return clientConfig;
}

export function createWagmiConfig() {
  return createConfig({
    chains: [mainnet, bsc, polygon, base],
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
      [mainnet.id]: http(),
      [bsc.id]: http(),
      [polygon.id]: http(),
      [base.id]: http(),
    },
  });
}
