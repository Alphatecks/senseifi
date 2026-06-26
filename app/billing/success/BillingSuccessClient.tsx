"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDashboardUser } from "@/context/DashboardUserContext";
import { getSubscriptionStatus } from "@/services/subscriptionService";

const NEXT_STEPS = [
  {
    title: "Plan activation",
    description: "Your subscription is being confirmed. This usually takes under a minute.",
  },
  {
    title: "Dashboard access",
    description: "Premium features unlock automatically once billing is active.",
  },
  {
    title: "Manage anytime",
    description: "Update payment methods or change plans from Subscription & Billing settings.",
  },
] as const;

function formatPlanLabel(plan: string): string {
  const normalized = plan.trim().toLowerCase();
  if (normalized === "basic") return "Basic Plan";
  if (normalized === "pro") return "Pro Plan";
  if (normalized === "premium") return "Premium Plan";
  return plan.trim();
}

function SuccessIcon() {
  return (
    <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
      <span
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(66,102,255,0.45),transparent_70%)] blur-md"
        aria-hidden
      />
      <span
        className="absolute inset-0 rounded-full border border-[#4066FF]/40 bg-[#0026FF]/10"
        aria-hidden
      />
      <span
        className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#425EFF] via-[#7F5FFF] to-[#01C8FF] opacity-30 blur-sm"
        aria-hidden
      />
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#425EFF] to-[#7F5FFF] shadow-[0_12px_40px_rgba(66,94,255,0.45)]">
        <svg
          className="h-8 w-8 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    </div>
  );
}

export default function BillingSuccessClient() {
  const { dashboardUser } = useDashboardUser();
  const [hasMounted, setHasMounted] = useState(false);
  const [planLabel, setPlanLabel] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const userId = dashboardUser?.user_id?.trim();
    if (!userId) return;

    let ignore = false;
    getSubscriptionStatus(userId).then((result) => {
      if (ignore || !result.success) return;
      const plan =
        typeof result.data.plan === "string" && result.data.plan.trim()
          ? formatPlanLabel(result.data.plan)
          : null;
      const status =
        typeof result.data.status === "string" && result.data.status.trim()
          ? result.data.status.trim()
          : null;
      if (plan) setPlanLabel(plan);
      if (status) setStatusLabel(status);
    });

    return () => {
      ignore = true;
    };
  }, [dashboardUser?.user_id]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a1a] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 starfield opacity-50" />
        <div className="absolute -left-24 -top-16 h-[28rem] w-[28rem] bg-[radial-gradient(circle_at_center,rgba(0,38,255,0.55),rgba(0,38,255,0)_70%)] blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-[26rem] w-[26rem] bg-[radial-gradient(circle_at_center,rgba(127,95,255,0.4),rgba(127,95,255,0)_72%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a1a] to-transparent" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-10 md:px-6 md:py-16">
        <div
          className={`mb-10 flex items-center justify-center ${
            hasMounted ? "animate-fade-slide-up" : "opacity-0"
          }`}
        >
          <Link href="/" className="inline-flex items-center gap-2 transition hover:opacity-90">
            <Image
              src="/images/scaled_logo.png"
              alt="SenseiFi"
              width={130}
              height={34}
              className="h-8 w-auto"
            />
            <span className="text-lg font-medium">SenseiFi</span>
          </Link>
        </div>

        <div
          className={`rounded-3xl border border-white/10 bg-[#12162a]/90 p-7 shadow-[0_10px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10 ${
            hasMounted ? "animate-fade-slide-up delay-200" : "opacity-0"
          }`}
        >
          <SuccessIcon />

          <p className="mb-3 text-center text-sm font-medium uppercase tracking-[0.2em] text-[#4066FF]">
            Payment confirmed
          </p>
          <h1 className="mb-4 text-center text-3xl font-normal leading-tight md:text-4xl">
            Subscription Successful
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-center text-base text-white/75 md:text-lg">
            Thank you for subscribing. Your SenseiFi plan is being activated and will appear in your
            dashboard shortly.
          </p>

          {(planLabel || statusLabel) && (
            <div className="mx-auto mb-8 flex max-w-md flex-wrap items-center justify-center gap-2">
              {planLabel ? (
                <span className="rounded-full border border-[#4066FF]/40 bg-[#0026FF]/15 px-4 py-1.5 text-sm text-white">
                  {planLabel}
                </span>
              ) : null}
              {statusLabel ? (
                <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm capitalize text-white/80">
                  {statusLabel}
                </span>
              ) : null}
            </div>
          )}

          <div className="mb-8 rounded-2xl border border-white/10 bg-[#0c1129]/80 p-5 md:p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">
              What happens next
            </h2>
            <ul className="space-y-4">
              {NEXT_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#425EFF] to-[#7F5FFF] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(66,94,255,0.35)]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-white">{step.title}</p>
                    <p className="mt-0.5 text-sm text-white/65">{step.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/guard"
              className="inline-flex items-center justify-center rounded-xl bg-[#0026FF] px-6 py-3.5 text-center text-sm font-medium text-white shadow-[0_12px_40px_rgba(0,38,255,0.35)] transition hover:brightness-110 md:text-base"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/guard/settings?section=subscription"
              className="inline-flex items-center justify-center rounded-xl border-2 border-transparent px-6 py-3.5 text-center text-sm font-medium text-white transition hover:brightness-110 md:text-base"
              style={{
                background:
                  "linear-gradient(#12162a, #12162a) padding-box, linear-gradient(90deg, #7F5FFF, #01C8FF, #FFB86C) border-box",
              }}
            >
              Manage Billing
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-white/50">
            Need help?{" "}
            <Link href="/contact" className="text-[#4066FF] transition hover:text-[#7F5FFF]">
              Contact support
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
