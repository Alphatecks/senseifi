'use client';

import { useCallback, useState } from 'react';
import { usePublicClient, useSwitchChain, useWalletClient } from 'wagmi';
import { isHex, keccak256, stringToHex } from 'viem';
import { useDashboardUser } from '@/context/DashboardUserContext';
import { useWallet } from '@/hooks/useWallet';
import { onchainSubscribe } from '@/services/onchainPaymentService';
import type { SubscriptionPlanKey } from '@/services/subscriptionService';

type UnknownRecord = Record<string, unknown>;
type Hex32 = `0x${string}`;

const ENV_ONCHAIN_USDC_CONTRACT = process.env.NEXT_PUBLIC_ONCHAIN_USDC_CONTRACT ?? '';
const ENV_ONCHAIN_PAYMENT_CONTRACT = process.env.NEXT_PUBLIC_ONCHAIN_PAYMENT_CONTRACT ?? '';
const ENV_ONCHAIN_CHAIN_ID = process.env.NEXT_PUBLIC_ONCHAIN_CHAIN_ID
  ? Number(process.env.NEXT_PUBLIC_ONCHAIN_CHAIN_ID)
  : null;

const ERC20_APPROVE_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

const PAYMENT_UPSERT_BILLING_ABI = [
  {
    type: 'function',
    name: 'upsertBilling',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'subscriptionId', type: 'bytes32' },
      { name: 'maxChargeUsdcRaw', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readNumberish(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function readBaseUnits(value: unknown): bigint | null {
  if (typeof value === 'bigint') return value >= 0n ? value : null;
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 0) return null;
    return BigInt(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) return null;
    try {
      return BigInt(trimmed);
    } catch {
      return null;
    }
  }
  return null;
}

function isHex32(value: string): value is Hex32 {
  return isHex(value) && /^0x[a-fA-F0-9]{64}$/.test(value);
}

function isAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

function readSubscribeExecutionData(payload: unknown): {
  subscriptionIdBytes32: Hex32;
  amountUsdcPerPeriodBaseUnits: bigint;
  maxChargeUsdcBaseUnits: bigint;
  tokenContract: string;
  paymentContract: string;
  chainId: number | null;
} {
  const root = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;
  if (!isRecord(root)) {
    throw new Error('Invalid subscribe response payload.');
  }

  const responseSubscriptionId =
    readString(root.subscription_id_bytes32) ?? readString(root.subscriptionIdBytes32);
  const subscriptionSourceId =
    readString(root.subscription_id) ??
    readString(root.subscriptionId) ??
    readString(root.id);
  const subscriptionIdBytes32 =
    responseSubscriptionId && isHex32(responseSubscriptionId)
      ? responseSubscriptionId
      : subscriptionSourceId
        ? keccak256(stringToHex(subscriptionSourceId))
        : null;
  if (!subscriptionIdBytes32 || !isHex32(subscriptionIdBytes32)) {
    throw new Error('Subscribe response is missing a valid subscription id.');
  }

  const amountUsdcPerPeriodBaseUnits =
    readBaseUnits(root.amount_usdc_per_period_base_units) ??
    readBaseUnits(root.amountUsdcPerPeriodBaseUnits);
  if (!amountUsdcPerPeriodBaseUnits || amountUsdcPerPeriodBaseUnits <= 0n) {
    throw new Error('Subscribe response is missing amount_usdc_per_period_base_units.');
  }

  const maxChargeUsdcBaseUnits =
    readBaseUnits(root.max_charge_usdc_base_units) ??
    readBaseUnits(root.maxChargeUsdcBaseUnits) ??
    amountUsdcPerPeriodBaseUnits;
  if (!maxChargeUsdcBaseUnits || maxChargeUsdcBaseUnits < amountUsdcPerPeriodBaseUnits) {
    throw new Error('Subscribe response has invalid max_charge_usdc_base_units.');
  }

  const tokenContract =
    readString(root.token_contract) ??
    readString(root.tokenContract) ??
    readString(root.usdc_contract) ??
    readString(root.usdcContract) ??
    readString(ENV_ONCHAIN_USDC_CONTRACT) ??
    '';
  const paymentContract =
    readString(root.payment_contract) ??
    readString(root.paymentContract) ??
    readString(ENV_ONCHAIN_PAYMENT_CONTRACT) ??
    '';
  if (!isAddress(tokenContract) || !isAddress(paymentContract)) {
    throw new Error('Missing token/payment contract addresses for onchain approval.');
  }

  const chainId =
    readNumberish(root.chain_id) ??
    readNumberish(root.chainId) ??
    (Number.isFinite(ENV_ONCHAIN_CHAIN_ID) ? ENV_ONCHAIN_CHAIN_ID : null);

  return {
    subscriptionIdBytes32,
    amountUsdcPerPeriodBaseUnits,
    maxChargeUsdcBaseUnits,
    tokenContract,
    paymentContract,
    chainId: chainId && chainId > 0 ? Math.trunc(chainId) : null,
  };
}

function readErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  if (typeof error === 'object') {
    const maybeMessage = (error as { shortMessage?: unknown }).shortMessage;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage.trim();
  }
  return null;
}

function buildBillingError(step: string, error: unknown): string {
  const rawMessage = readErrorMessage(error) ?? 'Unknown wallet/provider error.';
  const normalized = rawMessage.toLowerCase();
  if (normalized.includes('user rejected') || normalized.includes('rejected the request')) {
    return 'Transaction request was rejected in your wallet. Confirm the prompts to continue billing setup.';
  }
  if (normalized.includes('insufficient funds')) {
    return 'Insufficient funds for gas or token approval. Fund the wallet and try again.';
  }
  if (normalized.includes('chain') && normalized.includes('mismatch')) {
    return 'Wrong network selected in wallet. Switch to the required network and retry.';
  }
  return `Billing setup failed during ${step}: ${rawMessage}`;
}

export function usePlanCheckout() {
  const { activeAddress, isConnected, chainId, registerWalletWithBackend } = useWallet();
  const { dashboardUser } = useDashboardUser();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] = useState<SubscriptionPlanKey | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingSuccess, setBillingSuccess] = useState<string | null>(null);

  const handleCheckout = useCallback(
    async (plan: SubscriptionPlanKey, isAnnual: boolean) => {
      const payerAddress = activeAddress?.trim() ?? '';
      if (!isAddress(payerAddress)) {
        setBillingSuccess(null);
        setBillingError('Connect a valid wallet address before continuing.');
        return;
      }
      if (!isConnected || !walletClient || !publicClient) {
        setBillingSuccess(null);
        setBillingError(
          'Wallet session is not active. Reconnect your wallet to approve and activate billing.',
        );
        return;
      }

      setBillingError(null);
      setBillingSuccess(null);
      setCheckoutLoadingPlan(plan);
      let billingStep = 'initialization';
      try {
        let billingUserId = dashboardUser?.user_id?.trim() ?? '';
        if (!billingUserId) {
          billingStep = 'wallet registration';
          const registeredUser = await registerWalletWithBackend();
          billingUserId = registeredUser?.user_id?.trim() ?? '';
        }
        if (!billingUserId) {
          setBillingError(
            'Wallet is connected but billing identity could not be prepared. Reconnect and try again.',
          );
          return;
        }

        const billingCycle = isAnnual ? 'annual' : 'monthly';
        billingStep = 'subscription creation';
        const subscribeResult = await onchainSubscribe({
          user_id: billingUserId,
          plan,
          billing_cycle: billingCycle,
          payer_address: payerAddress,
        });

        if (!subscribeResult.success) {
          setBillingError(subscribeResult.error);
          return;
        }

        const executionData = readSubscribeExecutionData(subscribeResult.data);
        const amountPerPeriodRaw = executionData.amountUsdcPerPeriodBaseUnits;
        const maxChargeRaw = executionData.maxChargeUsdcBaseUnits;

        if (executionData.chainId && chainId !== executionData.chainId) {
          billingStep = 'network switch';
          if (!switchChainAsync) {
            setBillingError(`Switch wallet network to chain ${executionData.chainId} and try again.`);
            return;
          }
          await switchChainAsync({ chainId: executionData.chainId });
        }

        billingStep = 'token approval';
        const approveHash = await walletClient.writeContract({
          address: executionData.tokenContract as `0x${string}`,
          abi: ERC20_APPROVE_ABI,
          functionName: 'approve',
          args: [executionData.paymentContract as `0x${string}`, amountPerPeriodRaw],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        billingStep = 'billing activation';
        const upsertHash = await walletClient.writeContract({
          address: executionData.paymentContract as `0x${string}`,
          abi: PAYMENT_UPSERT_BILLING_ABI,
          functionName: 'upsertBilling',
          args: [executionData.subscriptionIdBytes32, maxChargeRaw],
        });
        await publicClient.waitForTransactionReceipt({ hash: upsertHash });

        setBillingSuccess(
          `Payment method pending confirmation completed for ${plan.replace('_', ' ').toUpperCase()} (${billingCycle}). Charges occur only after onchain billing + backend processing.`,
        );
      } catch (error) {
        console.error('[Billing] checkout failed', { billingStep, error });
        setBillingError(buildBillingError(billingStep, error));
      } finally {
        setCheckoutLoadingPlan(null);
      }
    },
    [
      activeAddress,
      chainId,
      dashboardUser?.user_id,
      isConnected,
      publicClient,
      registerWalletWithBackend,
      switchChainAsync,
      walletClient,
    ],
  );

  return {
    handleCheckout,
    checkoutLoadingPlan,
    billingError,
    billingSuccess,
  };
}
