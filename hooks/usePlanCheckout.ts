'use client';

import { useCallback, useState } from 'react';
import { useDashboardUser } from '@/context/DashboardUserContext';
import { useWallet } from '@/hooks/useWallet';
import {
  openSubscriptionPortal,
  startSubscriptionCheckout,
  toBillingPlanKey,
  type SubscriptionPlanKey,
} from '@/services/subscriptionService';

function getBillingRedirectUrls(): { success_url?: string; cancel_url?: string } {
  if (typeof window === 'undefined') return {};
  const origin = window.location.origin.replace(/\/$/, '');
  return {
    success_url: `${origin}/billing/success`,
    cancel_url: `${origin}/billing/cancel`,
  };
}

function readErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  if (typeof error === 'string' && error.trim()) return error.trim();
  return 'Something went wrong. Please try again.';
}

export function usePlanCheckout() {
  const { registerWalletWithBackend } = useWallet();
  const { dashboardUser } = useDashboardUser();
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] = useState<SubscriptionPlanKey | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingSuccess, setBillingSuccess] = useState<string | null>(null);

  const resolveBillingUserId = useCallback(async (): Promise<string | null> => {
    let billingUserId = dashboardUser?.user_id?.trim() ?? '';
    if (billingUserId) return billingUserId;

    const registered = await registerWalletWithBackend();
    billingUserId = registered.dashboard_user?.user_id?.trim() ?? '';
    return billingUserId || null;
  }, [dashboardUser?.user_id, registerWalletWithBackend]);

  const handleCheckout = useCallback(
    async (plan: SubscriptionPlanKey, isAnnual: boolean) => {
      setBillingError(null);
      setBillingSuccess(null);
      setCheckoutLoadingPlan(plan);

      try {
        const billingUserId = await resolveBillingUserId();
        if (!billingUserId) {
          setBillingError('Connect your wallet to continue with billing.');
          return;
        }

        const result = await startSubscriptionCheckout({
          user_id: billingUserId,
          plan: toBillingPlanKey(plan),
          billing_cycle: isAnnual ? 'annual' : 'monthly',
          ...getBillingRedirectUrls(),
        });

        if (!result.success) {
          setBillingError(result.error);
          return;
        }

        window.location.assign(result.checkoutUrl);
      } catch (error) {
        console.error('[Billing] checkout failed', error);
        setBillingError(readErrorMessage(error));
      } finally {
        setCheckoutLoadingPlan(null);
      }
    },
    [resolveBillingUserId],
  );

  const openBillingPortal = useCallback(async () => {
    setBillingError(null);
    setBillingSuccess(null);
    setPortalLoading(true);

    try {
      const billingUserId = await resolveBillingUserId();
      if (!billingUserId) {
        setBillingError('Connect your wallet to manage billing.');
        return;
      }

      const result = await openSubscriptionPortal(billingUserId);
      if (!result.success) {
        setBillingError(result.error);
        return;
      }

      window.location.assign(result.portalUrl);
    } catch (error) {
      console.error('[Billing] portal failed', error);
      setBillingError(readErrorMessage(error));
    } finally {
      setPortalLoading(false);
    }
  }, [resolveBillingUserId]);

  return {
    handleCheckout,
    openBillingPortal,
    checkoutLoadingPlan,
    portalLoading,
    billingError,
    billingSuccess,
    setBillingError,
    setBillingSuccess,
  };
}
