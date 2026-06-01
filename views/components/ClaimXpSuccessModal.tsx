"use client";

import React, { useEffect, useState } from "react";

export type ClaimXpSuccessData = {
  xp: number;
  email: string;
  successfulReferrals: number;
  walletAddress?: string;
  justClaimed?: boolean;
};

type ClaimXpSuccessModalProps = {
  open: boolean;
  onClose: () => void;
  data: ClaimXpSuccessData | null;
  onBuyXp?: () => void;
};

function applyXpProgress(xp: number) {
  const xpFullBar = 100 * 20;
  return Math.min(100, Math.max(0, (xp / xpFullBar) * 100));
}

function NitroIcon({ className }: { className?: string }) {
  const gradientId = React.useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`nitro-success-${gradientId}`} x1="5" y1="3" x2="19" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5865F2" />
          <stop stopColor="#9B59FF" />
          <stop stopColor="#FF6AD5" />
        </linearGradient>
      </defs>
      <path d="M12 2.5 4.5 7v10L12 21.5 19.5 17V7L12 2.5Z" fill={`url(#nitro-success-${gradientId})`} />
      <path d="M12 2.5v19M4.5 7l7.5 4.25L19.5 7M4.5 17l7.5-4.25L19.5 17" stroke="white" strokeOpacity="0.28" strokeWidth="0.75" />
    </svg>
  );
}

function truncateAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ClaimXpSuccessModal({
  open,
  onClose,
  data,
  onBuyXp,
}: ClaimXpSuccessModalProps) {
  const [xpProgressAnimated, setXpProgressAnimated] = useState(0);

  const xpProgressPercent = data ? applyXpProgress(data.xp) : 0;
  const justClaimed = data?.justClaimed ?? false;

  useEffect(() => {
    if (!open || !data) {
      setXpProgressAnimated(0);
      return;
    }
    const t = window.setTimeout(() => setXpProgressAnimated(xpProgressPercent), 80);
    return () => window.clearTimeout(t);
  }, [open, data, xpProgressPercent]);

  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="claim-xp-success-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[#32BB1D]/40 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#32BB1D]/20" style={{ backgroundColor: "#1B1B1B" }}>
          <div className="flex items-center gap-3 pr-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#32BB1D]/20 border border-[#32BB1D]/50 shrink-0">
              <svg className="w-5 h-5 text-[#32BB1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 id="claim-xp-success-title" className="text-lg font-semibold text-white">
                {justClaimed ? "Claim successful!" : "XP claimed"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {justClaimed ? "Your waitlist XP has been added to your wallet" : "This wallet already redeemed waitlist XP"}
              </p>
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
          <div className="rounded-lg border border-[#4066FF]/30 bg-[#4066FF]/10 p-4 text-center">
            <p className="text-sm text-slate-300 mb-1">XP claimed for</p>
            <p className="text-white font-medium truncate">{data.email}</p>
            {data.walletAddress ? (
              <p className="text-xs text-slate-400 font-mono mt-1">{truncateAddress(data.walletAddress)}</p>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-700/60 bg-[#25283D] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400">Your XP balance</p>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-[#4066FF]">
                <NitroIcon className="w-4 h-4" />
                {data.xp} XP
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
            <span className="text-sm font-medium text-white">{data.successfulReferrals}</span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                if (onBuyXp) onBuyXp();
              }}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition"
              style={{
                background: "linear-gradient(to bottom, #5B7CFF 0%, #4066FF 50%, #0026FF 100%)",
                boxShadow: "0 4px 15px rgba(0,38,255,0.6)",
              }}
            >
              Buy XPs
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-slate-200 transition border border-slate-700/70 bg-[#1a1d24] hover:bg-[#202437]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
