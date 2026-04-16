import React from "react";
import { useInView } from "../utils/useInView";
import Image from "next/image";
import { useDashboardUser } from "@/context/DashboardUserContext";
import {
  getSubscriptionPlans,
  type SubscriptionPlanKey,
} from "@/services/subscriptionService";
import { useWallet } from "@/hooks/useWallet";
import {
  onchainSubscribe,
} from "@/services/onchainPaymentService";
import { usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { isHex, keccak256, stringToHex } from "viem";

type PlanPricing = Record<SubscriptionPlanKey, { monthly: number; annual: number }>;
type UnknownRecord = Record<string, unknown>;
type Hex32 = `0x${string}`;

const DEFAULT_PLAN_PRICING: PlanPricing = {
  pro: { monthly: 30, annual: 300 },
  pro_plus: { monthly: 50, annual: 500 },
  premium: { monthly: 200, annual: 2000 },
};

const ENV_ONCHAIN_USDC_CONTRACT = process.env.NEXT_PUBLIC_ONCHAIN_USDC_CONTRACT ?? "";
const ENV_ONCHAIN_PAYMENT_CONTRACT = process.env.NEXT_PUBLIC_ONCHAIN_PAYMENT_CONTRACT ?? "";
const ENV_ONCHAIN_CHAIN_ID = process.env.NEXT_PUBLIC_ONCHAIN_CHAIN_ID
  ? Number(process.env.NEXT_PUBLIC_ONCHAIN_CHAIN_ID)
  : null;

const ERC20_APPROVE_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const PAYMENT_UPSERT_BILLING_ABI = [
  {
    type: "function",
    name: "upsertBilling",
    stateMutability: "nonpayable",
    inputs: [
      { name: "subscriptionId", type: "bytes32" },
      { name: "maxChargeUsdcRaw", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function toAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return null;
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readNumberish(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function readBaseUnits(value: unknown): bigint | null {
  if (typeof value === "bigint") return value >= 0n ? value : null;
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) return null;
    return BigInt(value);
  }
  if (typeof value === "string") {
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
    throw new Error("Invalid subscribe response payload.");
  }

  const responseSubscriptionId = readString(root.subscription_id_bytes32) ?? readString(root.subscriptionIdBytes32);
  const subscriptionSourceId =
    readString(root.subscription_id) ??
    readString(root.subscriptionId) ??
    readString(root.id);
  const subscriptionIdBytes32 = responseSubscriptionId && isHex32(responseSubscriptionId)
    ? responseSubscriptionId
    : subscriptionSourceId
      ? keccak256(stringToHex(subscriptionSourceId))
      : null;
  if (!subscriptionIdBytes32 || !isHex32(subscriptionIdBytes32)) {
    throw new Error("Subscribe response is missing a valid subscription id.");
  }

  const amountUsdcPerPeriodBaseUnits =
    readBaseUnits(root.amount_usdc_per_period_base_units) ??
    readBaseUnits(root.amountUsdcPerPeriodBaseUnits);
  if (!amountUsdcPerPeriodBaseUnits || amountUsdcPerPeriodBaseUnits <= 0n) {
    throw new Error("Subscribe response is missing amount_usdc_per_period_base_units.");
  }

  const maxChargeUsdcBaseUnits =
    readBaseUnits(root.max_charge_usdc_base_units) ??
    readBaseUnits(root.maxChargeUsdcBaseUnits) ??
    amountUsdcPerPeriodBaseUnits;
  if (!maxChargeUsdcBaseUnits || maxChargeUsdcBaseUnits < amountUsdcPerPeriodBaseUnits) {
    throw new Error("Subscribe response has invalid max_charge_usdc_base_units.");
  }

  const tokenContract =
    readString(root.token_contract) ??
    readString(root.tokenContract) ??
    readString(root.usdc_contract) ??
    readString(root.usdcContract) ??
    readString(ENV_ONCHAIN_USDC_CONTRACT) ??
    "";
  const paymentContract =
    readString(root.payment_contract) ??
    readString(root.paymentContract) ??
    readString(ENV_ONCHAIN_PAYMENT_CONTRACT) ??
    "";
  if (!isAddress(tokenContract) || !isAddress(paymentContract)) {
    throw new Error("Missing token/payment contract addresses for onchain approval.");
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

function readCycleAmount(value: unknown): number | null {
  if (typeof value === "number" || typeof value === "string") return toAmount(value);
  if (!isRecord(value)) return null;
  return (
    toAmount(value.amount) ??
    toAmount(value.price) ??
    toAmount(value.unit_amount) ??
    toAmount(value.value)
  );
}

function parsePlanPricingPayload(payload: unknown): PlanPricing | null {
  if (!isRecord(payload)) return null;
  const source = (isRecord(payload.data) ? payload.data : payload.plans) as unknown;
  const plans = isRecord(source) ? source : payload;

  const nextPricing: PlanPricing = { ...DEFAULT_PLAN_PRICING };
  const planKeys: SubscriptionPlanKey[] = ["pro", "pro_plus", "premium"];
  let foundAtLeastOne = false;

  planKeys.forEach((planKey) => {
    const rawPlan = plans[planKey];
    if (!isRecord(rawPlan)) return;

    const monthly = readCycleAmount(rawPlan.monthly);
    const annual = readCycleAmount(rawPlan.annual);
    if (monthly && annual) {
      nextPricing[planKey] = { monthly, annual };
      foundAtLeastOne = true;
    }
  });

  return foundAtLeastOne ? nextPricing : null;
}

function isAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

export default function WhyTrustSection() {
  const {
    activeAddress,
    connectedAddress,
    isConnected,
    isConnectedOrRemembered,
    disconnectWallet,
    isDisconnecting,
    chainId,
  } = useWallet();
  const { dashboardUser } = useDashboardUser();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const [hasMounted, setHasMounted] = React.useState(false);
  const [mobileRef, mobileInView] = useInView<HTMLDivElement>({ threshold: 0.05 });
  const [desktopRef, desktopInView] = useInView<HTMLDivElement>({ threshold: 0.05 });
  const [proRef, proInView] = useInView<HTMLDivElement>({ threshold: 0 });
  const [proPlusRef, proPlusInView] = useInView<HTMLDivElement>({ threshold: 0 });
  const [premiumRef, premiumInView] = useInView<HTMLDivElement>({ threshold: 0 });
  const [isProAnnual, setIsProAnnual] = React.useState(false);
  const [isProPlusAnnual, setIsProPlusAnnual] = React.useState(false);
  const [isPremiumAnnual, setIsPremiumAnnual] = React.useState(false);
  const [planPricing, setPlanPricing] = React.useState<PlanPricing>(DEFAULT_PLAN_PRICING);
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] = React.useState<SubscriptionPlanKey | null>(null);
  const [billingError, setBillingError] = React.useState<string | null>(null);
  const [billingSuccess, setBillingSuccess] = React.useState<string | null>(null);
  const [paymentMethodPending, setPaymentMethodPending] = React.useState(false);

  const getAnnualBeforeDiscount = (monthly: number) => monthly * 12;
  const getAnnualSavings = (monthly: number, annual: number) =>
    getAnnualBeforeDiscount(monthly) - annual;
  const displayAddress = connectedAddress
    ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
    : "";
  const showConnectedWalletCta = hasMounted && isConnectedOrRemembered && Boolean(connectedAddress);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleCheckout = async (plan: SubscriptionPlanKey, isAnnual: boolean) => {
    if (!dashboardUser?.user_id) {
      setBillingSuccess(null);
      setBillingError("Connect a wallet first to start onchain billing.");
      return;
    }

    const payerAddress = activeAddress?.trim() ?? "";
    if (!isAddress(payerAddress)) {
      setBillingSuccess(null);
      setBillingError("Connect a valid wallet address before continuing.");
      return;
    }
    if (!isConnected || !walletClient || !publicClient) {
      setBillingSuccess(null);
      setBillingError(
        "Wallet session is not active. Reconnect your wallet to approve and activate billing."
      );
      return;
    }

    setBillingError(null);
    setBillingSuccess(null);
    setPaymentMethodPending(false);
    setCheckoutLoadingPlan(plan);
    try {
      const billingCycle = isAnnual ? "annual" : "monthly";
      const subscribeResult = await onchainSubscribe({
        user_id: dashboardUser.user_id,
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
        if (!switchChainAsync) {
          setBillingError(`Switch wallet network to chain ${executionData.chainId} and try again.`);
          return;
        }
        await switchChainAsync({ chainId: executionData.chainId });
      }

      setPaymentMethodPending(true);

      const approveHash = await walletClient.writeContract({
        address: executionData.tokenContract as `0x${string}`,
        abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [executionData.paymentContract as `0x${string}`, amountPerPeriodRaw],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      const upsertHash = await walletClient.writeContract({
        address: executionData.paymentContract as `0x${string}`,
        abi: PAYMENT_UPSERT_BILLING_ABI,
        functionName: "upsertBilling",
        args: [executionData.subscriptionIdBytes32, maxChargeRaw],
      });
      await publicClient.waitForTransactionReceipt({ hash: upsertHash });

      setPaymentMethodPending(false);
      setBillingSuccess(
        `Payment method pending confirmation completed for ${plan.replace("_", " ").toUpperCase()} (${billingCycle}). Charges occur only after onchain billing + backend processing.`
      );
    } catch {
      setPaymentMethodPending(false);
      setBillingError("Unable to complete billing setup. Reconnect wallet and try again.");
    } finally {
      setCheckoutLoadingPlan(null);
    }
  };

  React.useEffect(() => {
    let active = true;
    const loadPlans = async () => {
      try {
        const plansResponse = await getSubscriptionPlans();
        if (!active || !plansResponse) return;
        const parsed = parsePlanPricingPayload(plansResponse);
        if (parsed) setPlanPricing(parsed);
      } catch {
        // Keep fallback pricing when plan fetch fails.
      }
    };

    void loadPlans();
    return () => {
      active = false;
    };
  }, []);

  const renderBillingToggle = (isAnnual: boolean, onToggle: () => void, id: string) => (
    <button
      type="button"
      role="switch"
      aria-checked={isAnnual}
      aria-label={`Toggle ${id} billing cycle`}
      onClick={onToggle}
      className="mt-5 relative inline-flex h-10 w-[190px] items-center rounded-full border border-white/20 bg-[#0D1019] p-1 text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#425EFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11131A]"
    >
      <span
        className={`absolute top-1 h-8 w-[92px] rounded-full bg-gradient-to-r from-[#425EFF] to-[#7F5FFF] shadow-[0_4px_14px_rgba(66,94,255,0.35)] transition-transform duration-300 ${
          isAnnual ? "translate-x-[92px]" : "translate-x-0"
        }`}
      />
      <span className={`relative z-10 w-[92px] text-center ${!isAnnual ? "text-white" : "text-white/70"}`}>Monthly</span>
      <span className={`relative z-10 w-[92px] text-center ${isAnnual ? "text-white" : "text-white/70"}`}>Annual</span>
    </button>
  );

  return (
    <section className="w-full py-24 bg-black text-white flex flex-col items-center">
      {/* Mobile Why Section Header - matches screenshot, does NOT affect desktop */}
      <div ref={mobileRef} className="block md:hidden w-full flex flex-col items-center justify-center mb-8 mt-2">
        <span className="px-4 py-1 rounded-full border border-blue-400 text-blue-300 text-sm font-medium bg-transparent mb-4 text-center">Why</span>
        <h2 className={`text-2xl font-normal text-center mb-3 leading-snug ${mobileInView ? "animate-slide-in-left" : "opacity-0"}`}>Why Traders Trust<br/>SenseiFi</h2>
        <p className={`text-xs text-white/70 text-center max-w-xs mb-4 ${mobileInView ? "animate-slide-in-left delay-200" : "opacity-0"}`}>A complete DeFi platform designed to keep your assets secure, your trades smart, and your spending seamless.</p>
        <Image src="/images/frame1.png" alt="Frame 1" width={320} height={160} className={`mx-auto mb-4 w-full max-w-xs ${mobileInView ? "animate-zoom-in-out" : "opacity-0"}`} />
        <Image src="/images/frame2.png" alt="Frame 2" width={320} height={160} className={`mx-auto mb-4 w-full max-w-xs ${mobileInView ? "animate-zoom-in-out delay-200" : "opacity-0"}`} />
        <Image src="/images/frame3.png" alt="Frame 3" width={320} height={160} className={`mx-auto mb-4 w-full max-w-xs ${mobileInView ? "animate-zoom-in-out delay-[400ms]" : "opacity-0"}`} />
        <Image src="/images/frame4.png" alt="Frame 4" width={320} height={160} className={`mx-auto mb-4 w-full max-w-xs ${mobileInView ? "animate-zoom-in-out delay-[600ms]" : "opacity-0"}`} />
      </div>
      {/* Desktop Why Section Header - untouched */}
      <div ref={desktopRef} className="hidden md:block w-full">
        <div className="flex justify-center w-full">
          <span className="px-6 py-2 rounded-full border border-blue-400 text-blue-300 text-lg font-medium bg-transparent mt-4 mb-2 text-center">Why</span>
        </div>
        <h2 className={`text-3xl md:text-5xl font-normal mb-6 text-center ${desktopInView ? "animate-slide-in-left" : "opacity-0"}`}>Why Traders Trust SenseiFi</h2>
        <p className={`text-base md:text-lg text-white/70 mb-16 text-center max-w-3xl mx-auto ${desktopInView ? "animate-slide-in-left delay-200" : "opacity-0"}`}>
          A complete DeFi platform designed to keep your assets secure, your trades smart, and your spending seamless.
        </p>
      </div>
      <div className="relative flex flex-col items-center w-full">
        <div className="hidden md:block relative w-full max-w-[1200px]">
          <Image src="/images/cross.svg" alt="Cross" width={1200} height={1200} className="w-full h-auto" />
          <div className="absolute left-1/2 top-[18%] -translate-x-1/2 flex w-[210px] lg:w-[250px] flex-col items-center text-center">
            <div className="flex items-center justify-center text-white font-normal text-lg lg:text-2xl mb-2 gap-2">
              <Image src="/images/icons/flash.png" alt="Flash" width={24} height={24} />
              <span>Unmatched Speed</span>
            </div>
            <div className="text-white/70 text-sm lg:text-base animate-zoom-in-out">Quick transactions, instant insights, and rapid access to your assets.</div>
          </div>
          {/* Bottom card inside cross */}
          <div className="absolute left-1/2 bottom-[3%] -translate-x-1/2 flex w-[210px] lg:w-[250px] flex-col items-center text-center">
            <div className="flex items-center justify-center text-white font-normal text-lg lg:text-xl mb-2 gap-2">
              <Image src="/images/icons/flash.png" alt="Flash" width={24} height={24} />
              <span>Smart Automation</span>
            </div>
            <div className="text-white/70 text-sm lg:text-base animate-zoom-in-out">Automated trading tools and portfolio management for smarter decisions.</div>
          </div>
          {/* Left side card inside cross */}
          <div className="absolute top-[58%] left-[5%] -translate-y-1/2 flex w-[190px] lg:w-[230px] flex-col items-center text-center">
            <div className="flex items-center justify-center text-white font-normal text-lg lg:text-xl mb-2 gap-2">
              <Image src="/images/icons/flash.png" alt="Flash" width={24} height={24} />
              <span>Seamless Spending</span>
            </div>
            <div className="text-white/70 text-sm lg:text-base animate-zoom-in-out">Instant crypto payments and subscription management.</div>
          </div>
          {/* Right side card inside cross */}
          <div className="absolute top-[58%] right-[4%] -translate-y-1/2 flex w-[190px] lg:w-[230px] flex-col items-center text-center">
            <div className="flex items-center justify-center text-white font-normal text-lg lg:text-xl mb-2 gap-2">
              <Image src="/images/icons/flash.png" alt="Flash" width={24} height={24} />
              <span>Advanced Security</span>
            </div>
            <div className="text-white/70 text-sm lg:text-base animate-zoom-in-out">Multi-layered wallet protection and real-time threat alerts.</div>
          </div>
        </div>
      </div>
      {/* Wallet status action beneath the cross */}
      <div className="flex justify-center mt-16">
        {showConnectedWalletCta ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              title={connectedAddress ?? undefined}
              className="px-5 py-3 bg-[#0026FF] text-white text-base md:text-lg rounded-md shadow-lg"
            >
              {displayAddress}
            </button>
            <button
              type="button"
              onClick={disconnectWallet}
              disabled={isDisconnecting}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-base md:text-lg rounded-md shadow-lg border border-white/20 transition-colors duration-200 disabled:opacity-60"
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect Wallet"}
            </button>
          </div>
        ) : (
          <>
            <button className="hidden md:inline-block px-8 py-3 bg-[#0026FF] hover:bg-blue-700 text-white text-lg rounded-md shadow-lg transition-colors duration-200">
              <span className="font-normal">Get Started</span>
            </button>
            <button className="inline-block md:hidden px-8 py-3 bg-[#0026FF] hover:bg-blue-700 text-white text-lg rounded-md shadow-lg transition-colors duration-200">
              <span className="font-normal">Get Started</span>
            </button>
          </>
        )}
      </div>
      {/* Pricing Section */}
      <div className="w-full py-24 bg-black text-white flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-normal mb-16 text-center">Pick your perfect plan</h2>
        {billingError && (
          <p className="w-full max-w-6xl px-4 mb-6 text-sm text-red-300">{billingError}</p>
        )}
        {billingSuccess && (
          <p className="w-full max-w-6xl px-4 mb-6 text-sm text-green-300">{billingSuccess}</p>
        )}
        <div className="flex flex-row gap-6 w-full max-w-6xl overflow-x-auto hide-scrollbar px-4 xl:px-0 xl:overflow-visible xl:justify-center">
          {/* PRO PLAN */}
          <div ref={proRef} className={`bg-[#181C23] rounded-xl flex flex-col flex-shrink-0 w-[85vw] max-w-sm md:w-[380px] md:max-w-[400px] min-h-[600px] shadow-lg ${proInView ? "animate-zoom-in-out" : "opacity-0"}`}>
                  <div className="flex items-center justify-between mb-0 p-8 pb-0">
                <span className="text-lg font-semibold">PRO PLAN</span>
                <img src="/images/icons/pro.png" alt="Pro" className="w-16 h-16" />
              </div>
                  <hr className="border-t border-white/10 w-full mb-0 mt-4" />
              <ul className="mb-8 space-y-4 text-white/80 text-base px-8 mt-8">
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Full wallet security scan</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Real-time threat & scam alerts</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />AI trading signals (standard)</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Portfolio health score</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Basic spending analytics</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Access to SenseiCard (limited transactions)</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Full Chrome Extension features</li>
              </ul>
              <div className="mt-auto">
                    <div className="bg-[#11131A] rounded-t-xl w-full flex flex-col items-start pl-8">
                      {renderBillingToggle(isProAnnual, () => setIsProAnnual((prev) => !prev), "pro plan")}
                      <span className="text-3xl font-normal text-white mt-4 flex items-center gap-2">
                        <Image src="/images/icons/usdc.svg" alt="USDC" width={26} height={26} />
                        ${isProAnnual ? planPricing.pro.annual : planPricing.pro.monthly} USDC
                        <span className="text-base font-normal text-white/70">{isProAnnual ? "/year" : "/month"}</span>
                      </span>
                      {isProAnnual && (
                        <span className="text-xs text-white/60 mt-1">
                          <span className="line-through">${getAnnualBeforeDiscount(planPricing.pro.monthly).toLocaleString()} USDC</span>
                          {" "}{"->"}{" "}saves ${getAnnualSavings(planPricing.pro.monthly, planPricing.pro.annual).toLocaleString()} USDC
                        </span>
                      )}
                     <button
                      type="button"
                      onClick={() => handleCheckout("pro", isProAnnual)}
                      disabled={checkoutLoadingPlan !== null}
                      className="w-11/12 py-3 mt-6 mb-6 text-white text-base font-normal rounded-full transition-colors duration-200 border-2 border-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-origin-border hover:from-blue-500 hover:to-indigo-600 disabled:opacity-60"
                      style={{background: 'linear-gradient(#181C23, #181C23) padding-box, linear-gradient(90deg, #7F5FFF, #01C8FF, #FFB86C) border-box', border: '2px solid transparent'}}
                    >
                      {checkoutLoadingPlan === "pro" ? "Creating subscription..." : "Go Pro"}
                    </button>
                </div>
              </div>
            </div>
            {/* PRO+ PLAN */}
          {/* PRO+ PLAN */}
          <div ref={proPlusRef} className={`bg-[#181C23] rounded-xl flex flex-col flex-shrink-0 w-[85vw] max-w-sm md:w-[380px] md:max-w-[400px] min-h-[600px] shadow-lg border-2 border-blue-600 ${proPlusInView ? "animate-zoom-in-out delay-200" : "opacity-0"}`}>
                  <div className="flex items-center justify-between mb-0 p-8 pb-0">
                <span className="text-lg font-semibold">PRO+ PLAN <span className="text-xs text-blue-400 ml-2">(Recommended)</span></span>
                <img src="/images/icons/proplus.png" alt="Pro+" className="w-16 h-16" />
              </div>
                  <hr className="border-t border-white/10 w-full mb-0 mt-4" />
              <ul className="mb-8 space-y-4 text-white/80 text-base px-8 mt-8">
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Everything in Pro</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Advanced AI trading predictions</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Trend, momentum & sentiment analysis</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Portfolio optimization engine</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Priority conversion rates on SenseiCard</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Subscription management tools</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Multi-chain asset monitoring</li>
              </ul>
              <div className="mt-auto">
                    <div
                      className="rounded-t-xl w-full flex flex-col items-start pl-8 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #11131A 60%, #425EFF 100%)',
                      }}
                    >
                      {renderBillingToggle(isProPlusAnnual, () => setIsProPlusAnnual((prev) => !prev), "pro plus plan")}
                      <span className="text-3xl font-normal text-white mt-4 flex items-center gap-2">
                        <Image src="/images/icons/usdc.svg" alt="USDC" width={26} height={26} />
                        ${isProPlusAnnual ? planPricing.pro_plus.annual : planPricing.pro_plus.monthly} USDC
                        <span className="text-base font-normal text-white/70">{isProPlusAnnual ? "/year" : "/month"}</span>
                      </span>
                      {isProPlusAnnual && (
                        <span className="text-xs text-white/70 mt-1">
                          <span className="line-through">${getAnnualBeforeDiscount(planPricing.pro_plus.monthly).toLocaleString()} USDC</span>
                          {" "}{"->"}{" "}saves ${getAnnualSavings(planPricing.pro_plus.monthly, planPricing.pro_plus.annual).toLocaleString()} USDC
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCheckout("pro_plus", isProPlusAnnual)}
                        disabled={checkoutLoadingPlan !== null}
                        className="w-11/12 py-3 mt-6 mb-6 text-white text-base font-normal rounded-full shadow-lg transition-colors duration-200 border-none disabled:opacity-60"
                        style={{
                          background: 'linear-gradient(135deg, #425EFF 40%, #7F5FFF 100%)',
                        }}
                      >
                        {checkoutLoadingPlan === "pro_plus" ? "Creating subscription..." : "Go Pro+"}
                      </button>
                    </div>
              </div>
            </div>
            {/* PREMIUM PLAN */}
          {/* PREMIUM PLAN */}
          <div ref={premiumRef} className={`bg-[#181C23] rounded-xl flex flex-col flex-shrink-0 w-[85vw] max-w-sm md:w-[380px] md:max-w-[400px] min-h-[600px] shadow-lg ${premiumInView ? "animate-zoom-in-out delay-[400ms]" : "opacity-0"}`}>
                  <div className="flex items-center justify-between mb-0 p-8 pb-0">
                <span className="text-lg font-semibold">PREMIUM PLAN</span>
                <img src="/images/icons/premium.png" alt="Premium" className="w-16 h-16" />
              </div>
                  <hr className="border-t border-white/10 w-full mb-0 mt-4" />
              <ul className="mb-8 space-y-4 text-white/80 text-base px-8 mt-8">
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Everything in Pro+</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Unlimited spending with SenseiCard</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Smart budgeting & auto-analytics</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />High-frequency AI alerts</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Wallet risk logs + breach history</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Instant multi-chain insights</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Priority customer support</li>
              </ul>
              <div className="mt-auto">
                    <div className="bg-[#11131A] rounded-t-xl w-full flex flex-col items-start pl-8">
                      {renderBillingToggle(isPremiumAnnual, () => setIsPremiumAnnual((prev) => !prev), "premium plan")}
                      <span className="text-3xl font-normal text-white mt-4 flex items-center gap-2">
                        <Image src="/images/icons/usdc.svg" alt="USDC" width={26} height={26} />
                        ${isPremiumAnnual ? planPricing.premium.annual : planPricing.premium.monthly} USDC
                        <span className="text-base font-normal text-white/70">{isPremiumAnnual ? "/year" : "/month"}</span>
                      </span>
                      {isPremiumAnnual && (
                        <span className="text-xs text-white/60 mt-1">
                          <span className="line-through">${getAnnualBeforeDiscount(planPricing.premium.monthly).toLocaleString()} USDC</span>
                          {" "}{"->"}{" "}saves ${getAnnualSavings(planPricing.premium.monthly, planPricing.premium.annual).toLocaleString()} USDC
                        </span>
                      )}
                     <button
                      type="button"
                      onClick={() => handleCheckout("premium", isPremiumAnnual)}
                      disabled={checkoutLoadingPlan !== null}
                      className="w-11/12 py-3 mt-6 mb-6 text-white text-base font-normal rounded-full transition-colors duration-200 border-2 border-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-origin-border hover:from-blue-500 hover:to-indigo-600 disabled:opacity-60"
                      style={{background: 'linear-gradient(#181C23, #181C23) padding-box, linear-gradient(90deg, #7F5FFF, #01C8FF, #FFB86C) border-box', border: '2px solid transparent'}}
                    >
                      {checkoutLoadingPlan === "premium" ? "Creating subscription..." : "Get Premium"}
                    </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
