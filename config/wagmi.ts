import { createConfig, http } from 'wagmi';
import { mainnet, bsc, polygon } from 'wagmi/chains';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, bsc, polygon],
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
  },
});
