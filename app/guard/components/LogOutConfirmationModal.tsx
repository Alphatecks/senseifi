"use client";

import React from "react";
import Image from "next/image";
import deleteIcon from "@/assets/icons/delete-02.png";

type LogOutConfirmationModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
};

export default function LogOutConfirmationModal({
  open,
  onClose,
  onConfirm,
  isLoggingOut = false,
}: LogOutConfirmationModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
        style={{ backgroundColor: "#12141c" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h3 className="text-base font-medium text-white">Log Out</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-600/40 bg-[#2a2d3a] text-white transition hover:bg-[#343848] disabled:opacity-50"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-6 pt-4 text-center">
          <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.15)" }}
            />
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "#ef4444" }}
            >
              <Image src={deleteIcon} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
            </div>
          </div>

          <h4 id="logout-modal-title" className="text-xl font-semibold leading-snug text-white">
            Are You sure you want to log out?
          </h4>
          <p className="mx-auto mt-3 max-w-sm text-sm italic leading-relaxed text-slate-400">
            We would keep your wallet safe while you are gone
          </p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoggingOut}
              className="w-full rounded-xl py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90"
            >
              {isLoggingOut ? "Logging out…" : "Log Out"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoggingOut}
              className="w-full rounded-xl py-3.5 text-sm font-medium text-white transition hover:bg-[#343848] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: "#2a2d3a" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
