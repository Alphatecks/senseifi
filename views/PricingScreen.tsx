"use client";

import React from "react";
import Image from "next/image";
import {
  getSubscriptionPlans,
  type SubscriptionPlanKey,
} from "@/services/subscriptionService";
import { usePlanCheckout } from "@/hooks/usePlanCheckout";
import {
  getOnchainBillingNetworkLabel,
  isTestnetOnchainBilling,
} from "@/config/onchainBilling";

type PlanPricing = Record<SubscriptionPlanKey, { monthly: number; annual: number }>;
type UnknownRecord = Record<string, unknown>;

const DEFAULT_PLAN_PRICING: PlanPricing = {
  pro: { monthly: 30, annual: 300 },
  pro_plus: { monthly: 50, annual: 500 },
  premium: { monthly: 200, annual: 2000 },
};

const PRICING_PLANS = [
  {
    id: "pro" as const,
    name: "BASIC Plan",
    icon: "/images/icons/pro.png",
    iconAlt: "BASIC Plan",
    cta: "Go Pro",
    recommended: false,
    features: [
      "Full wallet security scan",
      "Real-time threat & scam alerts",
      "AI trading signals (standard)",
      "Portfolio health score",
      "Basic spending analytics",
      "Access to SenseiCard (limited transactions)",
      "Full Chrome Extension features",
    ],
  },
  {
    id: "pro_plus" as const,
    name: "PRO Plan",
    icon: "/images/icons/proplus.png",
    iconAlt: "PRO Plan",
    cta: "Go Pro+",
    recommended: true,
    features: [
      "Everything in BASIC Plan",
      "Advanced AI trading predictions",
      "Trend, momentum & sentiment analysis",
      "Portfolio optimization engine",
      "Priority conversion rates on SenseiCard",
      "Subscription management tools",
      "Multi-chain asset monitoring",
    ],
  },
  {
    id: "premium" as const,
    name: "PREMIUM Plan",
    icon: "/images/icons/premium.png",
    iconAlt: "PREMIUM Plan",
    cta: "Get Premium",
    recommended: false,
    features: [
      "Everything in PRO Plan",
      "Unlimited spending with SenseiCard",
      "Smart budgeting & auto-analytics",
      "High-frequency AI alerts",
      "Wallet risk logs + breach history",
      "Instant multi-chain insights",
      "Priority customer support",
    ],
  },
] as const;

const COMPARISON_PLANS = ["Pro", "Pro +", "Premium Plan"] as const;

const COMPARISON_PLAN_COLUMNS =
  "flex shrink-0 items-center gap-5 sm:gap-7 md:gap-8";

const COMPARISON_PLAN_HEADER_CLASS =
  "whitespace-nowrap text-center text-xs font-medium leading-none sm:text-sm md:text-base";

const COMPARISON_PLAN_CELL_CLASS = "flex justify-center";

const COMPARISON_PRO_WIDTH = "w-8 sm:w-9";
const COMPARISON_PRO_PLUS_WIDTH = "w-9 sm:w-10";
const COMPARISON_PREMIUM_WIDTH = "w-[6.75rem] sm:w-[7.5rem] md:w-[8.25rem]";

type ComparisonRow = {
  label: string;
  isCategory?: boolean;
  pro?: boolean;
  proPlus?: boolean;
  premium?: boolean;
};

const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "Interaction", isCategory: true },
  {
    label: "Full wallet security scan / protection",
    pro: true,
    proPlus: true,
    premium: true,
  },
  {
    label: "Real-time threat & scam alerts",
    pro: true,
    proPlus: true,
    premium: true,
  },
  {
    label: "Standard AI trading signals / insights",
    pro: true,
    proPlus: true,
    premium: true,
  },
  {
    label: "Portfolio health & basic analytics",
    pro: true,
    proPlus: true,
    premium: true,
  },
  {
    label: "Basic spending analytics (SenseiCard)",
    pro: true,
    proPlus: true,
    premium: true,
  },
  {
    label: "Access to browser extension features",
    pro: true,
    proPlus: true,
    premium: true,
  },
  {
    label: "Advanced AI trading predictions & trend analysis",
    proPlus: true,
    premium: true,
  },
  {
    label: "Sentiment & momentum analysis tools",
    proPlus: true,
    premium: true,
  },
  {
    label: "Portfolio optimization engine (auto-analysis)",
    proPlus: true,
    premium: true,
  },
  {
    label: "Priority conversion rates for SenseiCard",
    proPlus: true,
    premium: true,
  },
  {
    label: "Subscription & spending management tools",
    proPlus: true,
    premium: true,
  },
  {
    label: "Multi-chain asset monitoring",
    proPlus: true,
    premium: true,
  },
  {
    label: "Unlimited SenseiCard usage / spending",
    premium: true,
  },
  {
    label: "Smart budgeting & auto-analytics tools",
    premium: true,
  },
  {
    label: "High-frequency/priority AI alerts & signals",
    premium: true,
  },
  {
    label: "Wallet risk logs & breach history",
    premium: true,
  },
  {
    label: "Instant multi-chain insights + advanced analytics",
    premium: true,
  },
  {
    label: "Priority customer support",
    premium: true,
  },
];

function ComparisonCheck({ included }: { included?: boolean }) {
  if (!included) return <span className="inline-block h-5 w-5" aria-hidden="true" />;

  return (
    <span className="inline-flex h-5 w-5 items-center justify-center text-lg leading-none text-white/45" aria-hidden="true">
      ✓
    </span>
  );
}

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

function BillingToggle({
  isAnnual,
  onToggle,
  id,
}: {
  isAnnual: boolean;
  onToggle: () => void;
  id: string;
}) {
  return (
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
      <span className={`relative z-10 w-[92px] text-center ${!isAnnual ? "text-white" : "text-white/70"}`}>
        Monthly
      </span>
      <span className={`relative z-10 w-[92px] text-center ${isAnnual ? "text-white" : "text-white/70"}`}>
        Annual
      </span>
    </button>
  );
}

function IosChevronRight({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlanCarouselIndicators({
  count,
  activeIndex,
  onSelect,
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div
      className="mt-6 flex items-center justify-center gap-2 xl:hidden"
      role="tablist"
      aria-label="Pricing plans"
    >
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Plan ${index + 1} of ${count}`}
            onClick={() => onSelect(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              isActive ? "w-6 bg-white" : "w-2 bg-white/35 hover:bg-white/55"
            }`}
          />
        );
      })}
    </div>
  );
}

export default function PricingScreen() {
  const [isProAnnual, setIsProAnnual] = React.useState(false);
  const [isProPlusAnnual, setIsProPlusAnnual] = React.useState(false);
  const [isPremiumAnnual, setIsPremiumAnnual] = React.useState(false);
  const [planPricing, setPlanPricing] = React.useState<PlanPricing>(DEFAULT_PLAN_PRICING);
  const [activePlanIndex, setActivePlanIndex] = React.useState(0);
  const [showScrollHint, setShowScrollHint] = React.useState(false);
  const plansScrollRef = React.useRef<HTMLDivElement>(null);
  const { handleCheckout, checkoutLoadingPlan, billingError, billingSuccess } = usePlanCheckout();

  const getAnnualBeforeDiscount = (monthly: number) => monthly * 12;
  const getAnnualSavings = (monthly: number, annual: number) =>
    getAnnualBeforeDiscount(monthly) - annual;

  const annualByPlan: Record<(typeof PRICING_PLANS)[number]["id"], boolean> = {
    pro: isProAnnual,
    pro_plus: isProPlusAnnual,
    premium: isPremiumAnnual,
  };

  const toggleByPlan: Record<(typeof PRICING_PLANS)[number]["id"], () => void> = {
    pro: () => setIsProAnnual((prev) => !prev),
    pro_plus: () => setIsProPlusAnnual((prev) => !prev),
    premium: () => setIsPremiumAnnual((prev) => !prev),
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

  React.useEffect(() => {
    const scrollEl = plansScrollRef.current;
    if (!scrollEl) return;

    const updateCarouselState = () => {
      const cards = Array.from(scrollEl.children) as HTMLElement[];
      const canScroll = scrollEl.scrollWidth > scrollEl.clientWidth + 1;

      if (cards.length === 0) {
        setShowScrollHint(false);
        setActivePlanIndex(0);
        return;
      }

      const scrollCenter = scrollEl.scrollLeft + scrollEl.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(scrollCenter - cardCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActivePlanIndex(closestIndex);
      setShowScrollHint(canScroll && closestIndex < cards.length - 1);
    };

    updateCarouselState();
    scrollEl.addEventListener("scroll", updateCarouselState, { passive: true });
    window.addEventListener("resize", updateCarouselState);

    return () => {
      scrollEl.removeEventListener("scroll", updateCarouselState);
      window.removeEventListener("resize", updateCarouselState);
    };
  }, []);

  const scrollToPlan = (index: number) => {
    const scrollEl = plansScrollRef.current;
    if (!scrollEl) return;

    const card = scrollEl.children[index] as HTMLElement | undefined;
    if (!card) return;

    scrollEl.scrollTo({
      left: card.offsetLeft - (scrollEl.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full overflow-hidden bg-black text-white pt-32 md:pt-40 pb-16 md:pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-0 h-[26rem] w-[26rem] md:-right-24 md:h-[34rem] md:w-[34rem] bg-[radial-gradient(circle_at_center,rgba(0,38,255,0.55),rgba(0,38,255,0.08)_45%,transparent_72%)] blur-3xl"
      />

      <section className="relative z-10 flex w-full flex-col items-center px-4 md:px-8 lg:px-12 xl:px-20">
        <h1 className="mb-12 text-center text-3xl font-normal md:mb-16 md:text-5xl lg:text-6xl">
          Pick your Perfect Plan
        </h1>

        {billingError ? (
          <p className="mb-6 w-full max-w-6xl px-4 text-sm text-red-300">{billingError}</p>
        ) : null}
        {billingSuccess ? (
          <p className="mb-6 w-full max-w-6xl px-4 text-sm text-green-300">{billingSuccess}</p>
        ) : null}
        {isTestnetOnchainBilling() ? (
          <p className="mb-6 w-full max-w-6xl px-4 text-sm text-amber-200">
            Test billing mode: checkout uses {getOnchainBillingNetworkLabel()} with test USDC only.
          </p>
        ) : null}

        <div className="relative w-full max-w-6xl">
          <div
            ref={plansScrollRef}
            className="flex w-full snap-x snap-mandatory scroll-smooth flex-row gap-6 overflow-x-auto hide-scrollbar px-4 xl:snap-none xl:justify-center xl:overflow-visible xl:px-0"
          >
          {PRICING_PLANS.map((plan) => {
            const isAnnual = annualByPlan[plan.id];
            const pricing = planPricing[plan.id];
            const displayedPrice = isAnnual ? pricing.annual : pricing.monthly;

            return (
              <div
                key={plan.id}
                className={`flex min-h-[600px] w-[85vw] max-w-sm flex-shrink-0 snap-center flex-col rounded-xl bg-[#181C23] shadow-lg md:w-[380px] md:max-w-[400px] ${
                  plan.recommended ? "border-2 border-blue-600" : ""
                }`}
              >
                <div className="mb-0 flex items-center justify-between p-8 pb-0">
                  <span className="text-lg font-semibold">
                    {plan.name}
                    {plan.recommended ? (
                      <span className="ml-2 text-xs text-blue-400">(Recommended)</span>
                    ) : null}
                  </span>
                  <img src={plan.icon} alt={plan.iconAlt} className="h-16 w-16" />
                </div>

                <hr className="mb-0 mt-4 w-full border-t border-white/10" />

                <ul className="mb-8 mt-8 space-y-4 px-8 text-base text-white/80">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <img src="/images/icons/check-circle.png" alt="check" className="h-5 w-5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <div
                    className={`flex w-full flex-col items-start rounded-t-xl pl-8 ${
                      plan.recommended ? "relative overflow-hidden" : "bg-[#11131A]"
                    }`}
                    style={
                      plan.recommended
                        ? { background: "linear-gradient(135deg, #11131A 60%, #425EFF 100%)" }
                        : undefined
                    }
                  >
                    <BillingToggle
                      isAnnual={isAnnual}
                      onToggle={toggleByPlan[plan.id]}
                      id={plan.name}
                    />

                    <span className="mt-4 flex items-center gap-2 text-3xl font-normal text-white">
                      <Image src="/images/icons/usdc.svg" alt="USDC" width={26} height={26} />
                      ${displayedPrice} USDC
                      <span className="text-base font-normal text-white/70">
                        {isAnnual ? "/year" : "/month"}
                      </span>
                    </span>

                    {isAnnual ? (
                      <span
                        className={`mt-1 text-xs ${plan.recommended ? "text-white/70" : "text-white/60"}`}
                      >
                        <span className="line-through">
                          ${getAnnualBeforeDiscount(pricing.monthly).toLocaleString()} USDC
                        </span>
                        {" "}
                        {"->"} saves $
                        {getAnnualSavings(pricing.monthly, pricing.annual).toLocaleString()} USDC
                      </span>
                    ) : null}

                    {plan.recommended ? (
                      <button
                        type="button"
                        onClick={() => handleCheckout(plan.id, isAnnual)}
                        disabled={checkoutLoadingPlan !== null}
                        className="mb-6 mt-6 w-11/12 rounded-full py-3 text-center text-base font-normal text-white shadow-lg transition-colors duration-200 disabled:opacity-60"
                        style={{
                          background: "linear-gradient(135deg, #425EFF 40%, #7F5FFF 100%)",
                        }}
                      >
                        {checkoutLoadingPlan === plan.id ? "Creating subscription..." : plan.cta}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCheckout(plan.id, isAnnual)}
                        disabled={checkoutLoadingPlan !== null}
                        className="mb-6 mt-6 w-11/12 rounded-full border-2 border-transparent py-3 text-center text-base font-normal text-white transition-colors duration-200 disabled:opacity-60"
                        style={{
                          background:
                            "linear-gradient(#181C23, #181C23) padding-box, linear-gradient(90deg, #7F5FFF, #01C8FF, #FFB86C) border-box",
                          border: "2px solid transparent",
                        }}
                      >
                        {checkoutLoadingPlan === plan.id ? "Creating subscription..." : plan.cta}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {showScrollHint ? (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-16 items-center justify-end xl:hidden"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gradient-to-l from-black via-black/70 to-transparent" />
              <span className="relative mr-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/90 backdrop-blur-sm animate-[scroll-hint-nudge_1.4s_ease-in-out_infinite]">
                <IosChevronRight />
              </span>
            </div>
          ) : null}

          <PlanCarouselIndicators
            count={PRICING_PLANS.length}
            activeIndex={activePlanIndex}
            onSelect={scrollToPlan}
          />
        </div>
      </section>

      <section className="relative z-10 w-full px-4 pb-16 pt-24 md:px-8 md:pb-24 md:pt-32 lg:px-12 xl:px-20 lg:pt-40">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-center text-3xl font-normal md:text-5xl">Pricing Comparison</h2>

          <div className="mt-10 space-y-3 md:mt-12">
            <div className="flex items-center rounded-xl bg-[#0026FF] px-4 py-4 sm:px-6 sm:py-5">
              <span className="sr-only">Features</span>
              <div className="min-w-0 flex-1" />
              <div className={COMPARISON_PLAN_COLUMNS}>
                <span className={`${COMPARISON_PRO_WIDTH} ${COMPARISON_PLAN_HEADER_CLASS}`}>
                  {COMPARISON_PLANS[0]}
                </span>
                <span className={`${COMPARISON_PRO_PLUS_WIDTH} ${COMPARISON_PLAN_HEADER_CLASS}`}>
                  {COMPARISON_PLANS[1]}
                </span>
                <span className={`${COMPARISON_PREMIUM_WIDTH} ${COMPARISON_PLAN_HEADER_CLASS}`}>
                  {COMPARISON_PLANS[2]}
                </span>
              </div>
            </div>

            {COMPARISON_ROWS.map((row) =>
              row.isCategory ? (
                <div
                  key={row.label}
                  className="rounded-xl bg-[#0f0f1a] px-4 py-4 text-sm text-white sm:px-6 sm:py-5 sm:text-base"
                >
                  {row.label}
                </div>
              ) : (
                <div
                  key={row.label}
                  className="flex items-center rounded-xl bg-[#0f0f1a] px-4 py-4 text-sm text-white/85 sm:px-6 sm:py-5 sm:text-base"
                >
                  <span className="min-w-0 flex-1 pr-2 leading-snug">{row.label}</span>
                  <div className={COMPARISON_PLAN_COLUMNS}>
                    <span className={`${COMPARISON_PRO_WIDTH} ${COMPARISON_PLAN_CELL_CLASS}`}>
                      <ComparisonCheck included={row.pro} />
                    </span>
                    <span className={`${COMPARISON_PRO_PLUS_WIDTH} ${COMPARISON_PLAN_CELL_CLASS}`}>
                      <ComparisonCheck included={row.proPlus} />
                    </span>
                    <span className={`${COMPARISON_PREMIUM_WIDTH} ${COMPARISON_PLAN_CELL_CLASS}`}>
                      <ComparisonCheck included={row.premium} />
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
