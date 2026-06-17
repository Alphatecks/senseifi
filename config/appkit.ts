import { isTestnetOnchainBilling } from '@/config/onchainBilling';

export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? '';

export function isWalletConnectConfigured(): boolean {
  return Boolean(WALLETCONNECT_PROJECT_ID);
}

export const APP_KIT_METADATA = {
  name: 'SenseiFi',
  description: 'Wallet security and threat intelligence',
  url: 'https://senseifi.io',
  icons: ['https://senseifi.io/images/scaled_logo.png'],
};

/** Chain IDs passed to AppKit on the client (order = default network preference). */
export function getAppKitChainIds(): number[] {
  if (isTestnetOnchainBilling()) {
    return [84532, 8453, 1, 56, 137];
  }
  return [8453, 84532, 1, 56, 137];
}
