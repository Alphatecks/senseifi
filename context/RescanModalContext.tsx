"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useWallet } from "@/hooks/useWallet";
import { runFullScan, refreshWalletHealth } from "@/services/dashboardService";
import type { RunFullScanData } from "@/services/dashboardService";

type RescanModalContextValue = {
  openRescanModal: () => void;
  scanCompleteTimestamp: number;
};

const RescanModalContext = createContext<RescanModalContextValue | null>(null);

export function RescanModalProvider({ children }: { children: React.ReactNode }) {
  const { address } = useWallet();
  const [rescanModalOpen, setRescanModalOpen] = useState(false);
  const [rescanProgress, setRescanProgress] = useState(0);
  const [scanTriggered, setScanTriggered] = useState(false);
  const [scanInProgress, setScanInProgress] = useState(false);
  const [scanResult, setScanResult] = useState<RunFullScanData | null>(null);
  const [scanCompleteTimestamp, setScanCompleteTimestamp] = useState(0);

  const openRescanModal = useCallback(() => {
    setScanTriggered(false);
    setScanResult(null);
    setRescanModalOpen(true);
  }, []);

  const closeRescanModal = useCallback(() => {
    setScanTriggered(false);
    setScanResult(null);
    setRescanModalOpen(false);
  }, []);

  useEffect(() => {
    if (!rescanModalOpen) return;
    setRescanProgress(0);
    const interval = setInterval(() => {
      setRescanProgress((p) => (p >= 100 ? 100 : p + 2));
    }, 120);
    return () => clearInterval(interval);
  }, [rescanModalOpen]);

  useEffect(() => {
    if (!rescanModalOpen || !address || scanTriggered) return;
    setScanTriggered(true);
    setScanInProgress(true);
    runFullScan(address)
      .then(async (data) => {
        if (data) {
          setScanResult(data);
          await refreshWalletHealth(address);
          setScanCompleteTimestamp(Date.now());
        }
      })
      .finally(() => setScanInProgress(false));
  }, [rescanModalOpen, address, scanTriggered]);

  const value: RescanModalContextValue = {
    openRescanModal,
    scanCompleteTimestamp,
  };

  const modal =
    rescanModalOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }}
        onClick={closeRescanModal}
      >
        <div
          className="w-full max-w-md rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden bg-[#1a1d24]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Rescan</h2>
              <button
                type="button"
                onClick={closeRescanModal}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 transition"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {address ? (
              <>
                <div className="h-2 rounded-full bg-slate-600/60 overflow-hidden mb-6">
                  <div
                    className="h-full rounded-full bg-[#0026FF] transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(100, rescanProgress)}%` }}
                  />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">
                  {scanInProgress ? "Scanning Your Wallet" : "Scan complete"}
                </h3>
                {scanInProgress ? (
                  <p className="text-sm text-slate-400 text-center mb-8">
                    Analyzing permissions, activity, and hidden risks in real time.
                  </p>
                ) : scanResult ? (
                  <div className="mb-6 max-h-[50vh] overflow-y-auto hide-scrollbar space-y-4">
                    <div className="rounded-lg bg-slate-800/60 border border-slate-600/50 p-3 text-sm">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-300">
                        <span>
                          Score: <strong className="text-white">{scanResult.score}%</strong>
                        </span>
                        <span>
                          Status: <strong className="text-white capitalize">{scanResult.status}</strong>
                        </span>
                        <span className="text-slate-400">Scanned: {new Date(scanResult.scanned_at).toLocaleString()}</span>
                      </div>
                      {scanResult.scan_id && <p className="text-xs text-slate-500 mt-1">Scan ID: {scanResult.scan_id}</p>}
                    </div>
                    {scanResult.observations?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Observations</p>
                        {scanResult.observations.map((obs, i) => (
                          <div key={i} className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-3 text-sm">
                            <p className="font-medium text-white">{obs.title}</p>
                            <p className="text-slate-400 text-xs mt-1">{obs.description}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-slate-600/60 text-slate-200 capitalize">
                              {obs.severity}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center mb-8">Your security score and status have been updated.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400 text-center mb-8">Connect your wallet to run a full scan.</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeRescanModal}
                className="flex-1 rounded-xl font-bold text-white py-3 px-4 transition border border-[#222222] shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] hover:opacity-90"
                style={{ background: "linear-gradient(to bottom, #4a4a4a 0%, #414141 50%, #383838 100%)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={closeRescanModal}
                className="flex-1 rounded-xl font-medium text-white py-3 px-4 transition border border-[#001a99] shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] hover:opacity-95"
                style={{ background: "linear-gradient(to bottom, #3366ff 0%, #0026FF 50%, #001fcc 100%)" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <RescanModalContext.Provider value={value}>
      {children}
      {modal}
    </RescanModalContext.Provider>
  );
}

export function useRescanModal() {
  const ctx = useContext(RescanModalContext);
  return (
    ctx ?? {
      openRescanModal: () => {},
      scanCompleteTimestamp: 0,
    }
  );
}
