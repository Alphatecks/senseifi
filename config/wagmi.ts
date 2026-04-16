import { createConfig, createStorage, http } from 'wagmi';
import { mainnet, bsc, polygon, base } from 'wagmi/chains';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, bsc, polygon, base],
  ssr: true,
  storage: createStorage({
    storage:
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage
        : undefined,
  }),
  connectors: [
    metaMask(),
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
