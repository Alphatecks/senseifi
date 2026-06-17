/** Local or stable URLs for wallet provider icons (avoid dead CDNs like phantom.imgix.net). */
export const WALLET_PROVIDER_LOGOS: Readonly<Record<string, string>> = {
  metamask: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  'meta mask': 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  coinbase:
    'https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Product_Wallet.svg',
  'coinbase wallet':
    'https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Product_Wallet.svg',
  walletconnect:
    'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg',
  'wallet connect':
    'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg',
  rabby: 'https://rabby.io/assets/images/logo-128.png',
  phantom: '/images/icons/phantom.svg',
  solflare: 'https://solflare.com/favicon.ico',
  backpack: 'https://backpack.app/favicon.ico',
  trust: 'https://trustwallet.com/assets/images/media/assets/TWT.png',
  'trust wallet': 'https://trustwallet.com/assets/images/media/assets/TWT.png',
};

export const WALLET_ICON_FALLBACK = '/images/icons/wallet-header.png';

export function getWalletProviderLogoUrl(provider?: string | null): string {
  const key = (provider ?? '').toLowerCase().trim();
  return WALLET_PROVIDER_LOGOS[key] ?? WALLET_ICON_FALLBACK;
}
