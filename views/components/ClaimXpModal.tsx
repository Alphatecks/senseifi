"use client";

import React, { useEffect, useState } from "react";

type ClaimXpModalProps = {
  open: boolean;
  onClose: () => void;
};

function NitroIcon({ className }: { className?: string }) {
  const gradientId = React.useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`nitro-${gradientId}`} x1="5" y1="3" x2="19" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5865F2" />
          <stop stopColor="#9B59FF" />
          <stop stopColor="#FF6AD5" />
        </linearGradient>
      </defs>
      <path d="M12 2.5 4.5 7v10L12 21.5 19.5 17V7L12 2.5Z" fill={`url(#nitro-${gradientId})`} />
      <path d="M12 2.5v19M4.5 7l7.5 4.25L19.5 7M4.5 17l7.5-4.25L19.5 17" stroke="white" strokeOpacity="0.28" strokeWidth="0.75" />
    </svg>
  );
}

function getWaitlistBaseUrl() {
  return process.env.NEXT_PUBLIC_WAITLIST_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://waitlist-82co.onrender.com";
}

export default function ClaimXpModal({ open, onClose }: ClaimXpModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [xpValue, setXpValue] = useState<number | null>(null);
  const [successfulReferrals, setSuccessfulReferrals] = useState(0);
  const [xpProgressPercent, setXpProgressPercent] = useState(0);
  const [xpProgressAnimated, setXpProgressAnimated] = useState(0);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (open) return;
    setEmail("");
    setLoading(false);
    setError("");
    setXpValue(null);
    setSuccessfulReferrals(0);
    setXpProgressPercent(0);
    setXpProgressAnimated(0);
    setClaimed(false);
  }, [open]);

  useEffect(() => {
    if (!open || !claimed) return;
    const t = window.setTimeout(() => setXpProgressAnimated(xpProgressPercent), 80);
    return () => window.clearTimeout(t);
  }, [open, claimed, xpProgressPercent]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter the email you used to join the waitlist.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${getWaitlistBaseUrl()}/referrals/by-email?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data) {
        setError(data?.message || "We couldn't find XP for that email. Use the same email you joined the waitlist with.");
        return;
      }

      setSuccessfulReferrals(typeof data.successfulCount === "number" ? data.successfulCount : 0);
      if (typeof data.xp === "number") {
        setXpValue(data.xp);
        const xpFullBar = 100 * 20;
        setXpProgressPercent(Math.min(100, Math.max(0, (data.xp / xpFullBar) * 100)));
        setXpProgressAnimated(0);
      } else {
        setXpValue(0);
        setXpProgressPercent(0);
      }
      setClaimed(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="claim-xp-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5" style={{ backgroundColor: "#1B1B1B" }}>
          <div className="flex items-center gap-2.5 pr-4">
            <div className="emboss-raised flex items-center justify-center w-9 h-9 rounded-lg bg-[#1a1d24] shrink-0">
              <NitroIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 id="claim-xp-title" className="text-lg font-normal text-white">
                Claim your XP
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Link your waitlist email to unlock rewards</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 transition shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4" style={{ backgroundColor: "#191b28" }}>
          {!claimed ? (
            <>
              <p className="text-sm text-slate-300 leading-relaxed">
                Enter the email address you used when joining the SenseiFi waitlist. We&apos;ll match it to your account and surface any XP you&apos;ve earned from referrals and activity.
              </p>

              <form onSubmit={handleClaim} className="space-y-4">
                <div>
                  <label htmlFor="claim-xp-email" className="block text-xs text-slate-400 mb-1.5">
                    Email address
                  </label>
                  <div className="emboss-inset-3d-input rounded-lg bg-[#1a1d24] border border-slate-800/50 overflow-hidden">
                    <input
                      id="claim-xp-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none border-none"
                    />
                  </div>
                </div>

                {error ? (
                  <p className="text-sm text-red-300 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5">{error}</p>
                ) : null}

                <div className="rounded-lg border border-slate-700/60 bg-[#25283D] p-4">
                  <p className="text-xs text-slate-400 mb-2">How XP works</p>
                  <ul className="text-sm text-slate-300 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-[#4066FF] shrink-0">•</span>
                      <span>Earn 100 XP for every successful referral</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#4066FF] shrink-0">•</span>
                      <span>Use the same email you signed up with on the waitlist</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(to bottom, #5B7CFF 0%, #4066FF 50%, #0026FF 100%)",
                    boxShadow: "0 4px 15px rgba(0,38,255,0.6)",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" aria-hidden />
                      Claiming…
                    </>
                  ) : (
                    "Claim XP"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-[#4066FF]/30 bg-[#4066FF]/10 p-4 text-center">
                <p className="text-sm text-slate-300 mb-1">XP linked to</p>
                <p className="text-white font-medium truncate">{email.trim()}</p>
              </div>

              <div className="rounded-lg border border-slate-700/60 bg-[#25283D] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-400">Your XP balance</p>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[#4066FF]">
                    <NitroIcon className="w-4 h-4" />
                    {xpValue != null ? `${xpValue} XP` : "— XP"}
                  </span>
                </div>
                <div className="relative h-2.5 rounded-full bg-white/10 overflow-visible xp-bar-track">
                  <div
                    className="xp-bar-fill absolute inset-y-0 left-0 rounded-full bg-[#0026FF]"
                    style={{ width: `${Math.min(100, Math.max(0, xpProgressAnimated))}%` }}
                  />
                  <div
                    className="xp-bar-spark absolute top-1/2 w-3 h-3 -translate-y-1/2 rounded-full bg-white border border-white/80 -translate-x-1/2"
                    style={{ left: `${Math.min(100, Math.max(0, xpProgressAnimated))}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-[#25283D] px-4 py-3">
                <span className="text-xs text-slate-400">Successful referrals</span>
                <span className="text-sm font-medium text-white">{successfulReferrals}</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition"
                style={{
                  background: "linear-gradient(to bottom, #5B7CFF 0%, #4066FF 50%, #0026FF 100%)",
                  boxShadow: "0 4px 15px rgba(0,38,255,0.6)",
                }}
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
