"use client";

import React from "react";

type RemoveWalletConfirmationModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isRemoving?: boolean;
};

export default function RemoveWalletConfirmationModal({
  open,
  onClose,
  onConfirm,
  isRemoving = false,
}: RemoveWalletConfirmationModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-wallet-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-600/50 shadow-2xl overflow-hidden"
        style={{ backgroundColor: "#191D35" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <h3 className="text-base font-normal text-white">Confirmation</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isRemoving}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-[#2a2d3a] hover:bg-[#343848] border border-slate-600/40 transition shrink-0 disabled:opacity-50"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-6 text-center space-y-4">
          <h4 id="remove-wallet-title" className="text-xl font-semibold text-white leading-snug">
            Remove Wallet Confirmation
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            Are you sure you want to remove this wallet? This action cannot be undone and you may lose access to associated data and transactions.
          </p>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRemoving}
            className="w-full rounded-xl py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90"
          >
            {isRemoving ? "Removing…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
