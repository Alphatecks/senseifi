"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { useWallet } from "@/hooks/useWallet";

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

function truncateAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ClaimXpModal({ open, onClose }: ClaimXpModalProps) {
  const router = useRouter();
  const { address, isConnected, chainId } = useWallet();
  const walletReady = Boolean(isConnected && address?.trim() && chainId);

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
                Buy XPs
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Top up XP to unlock guarded features</p>
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
          <p className="text-sm text-slate-300 leading-relaxed">
            Buy additional XP credits to continue using Wallet Security, Threat Intelligence, Contract Scanner, and Activity Monitor without limits.
          </p>

          <div
            className={`rounded-lg border px-4 py-3 ${
              walletReady
                ? "border-[#32BB1D]/40 bg-[#32BB1D]/10"
                : "border-amber-500/40 bg-amber-500/10"
            }`}
          >
            <p className="text-xs text-slate-400 mb-1">Connected wallet</p>
            {walletReady && address ? (
              <p className="text-sm font-mono text-white">{truncateAddress(address)}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-amber-200">No wallet connected</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/connect-wallet");
                  }}
                  className="inline-flex text-sm font-medium text-[#4066FF] hover:underline"
                >
                  Connect wallet →
                </button>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-700/60 bg-[#25283D] p-4">
            <p className="text-xs text-slate-400 mb-2">Buy XP to unlock</p>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-[#4066FF] shrink-0">•</span>
                <span>Wallet Security analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4066FF] shrink-0">•</span>
                <span>Threat Intelligence access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4066FF] shrink-0">•</span>
                <span>Contract Scanner and Activity Monitor</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={!walletReady}
            onClick={() => {
              onClose();
              router.push("/guard/settings?section=subscription");
            }}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(to bottom, #5B7CFF 0%, #4066FF 50%, #0026FF 100%)",
              boxShadow: "0 4px 15px rgba(0,38,255,0.6)",
            }}
          >
            Buy XPs
          </button>
        </div>
      </div>
    </div>
  );
}
