import { SOLANA_WALLET_INSTALL_URLS } from '@/config/solana';

export type SolanaBrowserWallet = 'phantom' | 'solflare' | 'backpack';

export type SolanaWalletOption = {
  id: SolanaBrowserWallet;
  name: string;
  logo: string;
  installUrl: string;
};

type SolanaPublicKey = { toString(): string };

export type SolanaInjectedProvider = {
  publicKey: SolanaPublicKey | null;
  isConnected?: boolean;
  connect(): Promise<{ publicKey: SolanaPublicKey }>;
  disconnect(): Promise<void>;
};

declare global {
  interface Window {
    phantom?: { solana?: SolanaInjectedProvider & { isPhantom?: boolean } };
    solflare?: SolanaInjectedProvider & { isSolflare?: boolean };
    backpack?: SolanaInjectedProvider & { isBackpack?: boolean };
  }
}

const SOLANA_WALLET_OPTIONS: SolanaWalletOption[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    logo: '/images/icons/phantom.svg',
    installUrl: SOLANA_WALLET_INSTALL_URLS.phantom,
  },
  {
    id: 'solflare',
    name: 'Solflare',
    logo: 'https://solflare.com/favicon.ico',
    installUrl: SOLANA_WALLET_INSTALL_URLS.solflare,
  },
  {
    id: 'backpack',
    name: 'Backpack',
    logo: 'https://backpack.app/favicon.ico',
    installUrl: SOLANA_WALLET_INSTALL_URLS.backpack,
  },
];

export function getSolanaWalletOptions(): SolanaWalletOption[] {
  return SOLANA_WALLET_OPTIONS;
}

function getProvider(wallet: SolanaBrowserWallet): SolanaInjectedProvider | null {
  if (typeof window === 'undefined') return null;
  if (wallet === 'phantom') return window.phantom?.solana ?? null;
  if (wallet === 'solflare') return window.solflare ?? null;
  return window.backpack ?? null;
}

export function isSolanaWalletInstalled(wallet: SolanaBrowserWallet): boolean {
  return Boolean(getProvider(wallet));
}

export async function connectSolanaBrowserWallet(
  wallet: SolanaBrowserWallet
): Promise<{ address: string; walletName: string }> {
  const provider = getProvider(wallet);
  const option = SOLANA_WALLET_OPTIONS.find((w) => w.id === wallet);
  if (!provider) {
    throw new Error(
      `${option?.name ?? wallet} is not installed. Install the browser extension and refresh.`
    );
  }

  const response = await provider.connect();
  const address = response.publicKey?.toString()?.trim();
  if (!address) {
    throw new Error('Wallet did not return a Solana address.');
  }

  return { address, walletName: option?.name ?? wallet };
}

export async function disconnectSolanaBrowserWallet(wallet: SolanaBrowserWallet): Promise<void> {
  const provider = getProvider(wallet);
  if (!provider?.isConnected) return;
  try {
    await provider.disconnect();
  } catch {
    // Ignore disconnect errors from extension wallets.
  }
}
