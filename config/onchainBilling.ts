export type OnchainBillingEnvironment = 'test' | 'testnet' | 'production' | 'mainnet';

const RAW_BILLING_ENV = (process.env.NEXT_PUBLIC_ONCHAIN_BILLING_ENV ?? 'test').toLowerCase();

/** Circle USDC on Base / Base Sepolia (same canonical address). */
export const BASE_USDC_CONTRACT = '0x036CbD53842c686983057b837BBaF642ea437901';

export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

export function getOnchainBillingEnvironment(): OnchainBillingEnvironment {
  if (RAW_BILLING_ENV === 'test' || RAW_BILLING_ENV === 'testnet') return 'test';
  return 'production';
}

export function isTestnetOnchainBilling(): boolean {
  return getOnchainBillingEnvironment() === 'test';
}

export function getOnchainBillingChainId(): number {
  const fromEnv = process.env.NEXT_PUBLIC_ONCHAIN_CHAIN_ID
    ? Number(process.env.NEXT_PUBLIC_ONCHAIN_CHAIN_ID)
    : null;

  if (fromEnv && Number.isFinite(fromEnv) && fromEnv > 0) {
    return Math.trunc(fromEnv);
  }

  return isTestnetOnchainBilling() ? BASE_SEPOLIA_CHAIN_ID : BASE_MAINNET_CHAIN_ID;
}

export function getOnchainUsdcContract(): string {
  return (process.env.NEXT_PUBLIC_ONCHAIN_USDC_CONTRACT ?? BASE_USDC_CONTRACT).trim();
}

export function getOnchainPaymentContract(): string {
  return (process.env.NEXT_PUBLIC_ONCHAIN_PAYMENT_CONTRACT ?? '').trim();
}

export function getOnchainBillingNetworkLabel(): string {
  return isTestnetOnchainBilling() ? 'Base Sepolia (testnet)' : 'Base';
}
