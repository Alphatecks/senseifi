"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  getScanContractDetails,
  runFullScan,
  scanContract,
} from "@/services/dashboardService";
import type { RunFullScanData, ScanContractDetailResponse, ScanContractResult } from "@/services/dashboardService";
import { isContractAddressOnChain, truncateEvmAddress } from "@/utils/evmAddress";
import { parseContractScanInput } from "@/utils/contractScan";

type HomeAddressScanModalProps = {
  open: boolean;
  address: string | null;
  onClose: () => void;
};

type ScanKind = "wallet" | "contract";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function HomeAddressScanModal({ open, address, onClose }: HomeAddressScanModalProps) {
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanKind, setScanKind] = useState<ScanKind | null>(null);
  const [error, setError] = useState("");
  const [walletResult, setWalletResult] = useState<RunFullScanData | null>(null);
  const [contractResult, setContractResult] = useState<ScanContractResult | null>(null);
  const [contractDetails, setContractDetails] = useState<ScanContractDetailResponse | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (!open || !address?.trim()) return;

    let cancelled = false;
    setScanning(true);
    setError("");
    setScanKind(null);
    setWalletResult(null);
    setContractResult(null);
    setContractDetails(null);
    setDetailsOpen(false);
    setProgress(0);

    const progressTimer = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 2));
    }, 120);

    void (async () => {
      try {
        const trimmed = address.trim();
        const parsedTarget = parseContractScanInput(trimmed);

        if (parsedTarget?.chainFamily === "solana") {
          setScanKind("contract");
          const result = await scanContract(trimmed, undefined, {
            chainFamily: "solana",
            network: parsedTarget.network ?? "mainnet-beta",
          });
          if (cancelled) return;
          if (!result) {
            setError("Program scan failed. Try again or verify the address.");
            return;
          }
          setContractResult(result);
          return;
        }

        const isEthContract = await isContractAddressOnChain(trimmed, 1);
        if (cancelled) return;

        if (isEthContract) {
          setScanKind("contract");
          const result = await scanContract(trimmed, undefined, 1);
          if (cancelled) return;
          if (!result) {
            setError("Contract scan failed. Try again or verify the address.");
            return;
          }
          setContractResult(result);
          return;
        }

        const isBscContract = await isContractAddressOnChain(trimmed, 56);
        if (cancelled) return;

        if (isBscContract) {
          setScanKind("contract");
          const result = await scanContract(trimmed, undefined, 56);
          if (cancelled) return;
          if (!result) {
            setError("Contract scan failed. Try again or verify the address.");
            return;
          }
          setContractResult(result);
          return;
        }

        setScanKind("wallet");
        const result = await runFullScan(trimmed);
        if (cancelled) return;
        if (!result) {
          setError("Wallet scan failed. Check the address and try again.");
          return;
        }
        setWalletResult(result);
      } catch {
        if (!cancelled) setError("Scan failed. Please try again.");
      } finally {
        if (!cancelled) setScanning(false);
      }
    })();

    return () => {
      cancelled = true;
      window.clearInterval(progressTimer);
    };
  }, [open, address]);

  const openContractDetails = () => {
    if (!contractResult?.scan_id) return;
    setDetailsOpen(true);
    setDetailsLoading(true);
    setContractDetails(null);
    void getScanContractDetails(contractResult.scan_id)
      .then((res) => setContractDetails(res ?? null))
      .finally(() => setDetailsLoading(false));
  };

  if (!open || !address?.trim()) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden bg-[#1a1d24]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                {scanKind === "contract" ? "Contract scan" : "Wallet scan"}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{truncateEvmAddress(address.trim())}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 transition"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="h-2 rounded-full bg-slate-600/60 overflow-hidden mb-6">
            <div
              className="h-full rounded-full bg-[#0026FF] transition-all duration-300 ease-out"
              style={{ width: `${scanning ? Math.min(100, progress) : 100}%` }}
            />
          </div>

          <h3 className="text-xl font-bold text-white text-center mb-2">
            {scanning ? (scanKind === "contract" ? "Scanning contract" : "Scanning wallet") : error ? "Scan failed" : "Scan complete"}
          </h3>

          {scanning ? (
            <p className="text-sm text-slate-400 text-center mb-8">
              {scanKind === "contract"
                ? "Analyzing contract permissions, owner controls, and risk signals."
                : "Analyzing permissions, activity, and hidden risks in real time."}
            </p>
          ) : error ? (
            <p className="text-sm text-red-300 text-center mb-8 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5">
              {error}
            </p>
          ) : walletResult ? (
            <div className="mb-6 max-h-[50vh] overflow-y-auto hide-scrollbar space-y-4">
              <div className="rounded-lg bg-slate-800/60 border border-slate-600/50 p-3 text-sm">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-300">
                  <span>
                    Score: <strong className="text-white">{walletResult.score}%</strong>
                  </span>
                  <span>
                    Status: <strong className="text-white capitalize">{walletResult.status}</strong>
                  </span>
                  <span className="text-slate-400">Scanned: {formatDate(walletResult.scanned_at)}</span>
                </div>
              </div>
              {walletResult.observations?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Observations</p>
                  {walletResult.observations.map((obs, i) => (
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
          ) : contractResult ? (
            <div className="mb-6 space-y-4">
              <div className="rounded-lg bg-slate-800/60 border border-slate-600/50 p-3 text-sm space-y-2">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Trust score</span>
                  <span className="text-white font-semibold">{contractResult.trust_score}%</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Critical risk flags</span>
                  <span className="text-white">{contractResult.critical_risk_flags}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Token controlled</span>
                  <span className="text-white">{contractResult.token_controlled || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Owner / admin</span>
                  <span className="text-white">{contractResult.owner_admin_count}</span>
                </div>
              </div>
              {contractResult.ai_summary ? (
                <p className="text-sm text-slate-300 rounded-lg bg-slate-800/40 border border-slate-700/50 p-3">
                  {contractResult.ai_summary}
                </p>
              ) : null}
              <button
                type="button"
                disabled={!contractResult.scan_id}
                onClick={openContractDetails}
                className="w-full rounded-xl border py-3 text-sm font-medium text-white bg-slate-700/80 border-slate-600/60 hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none transition"
              >
                View details
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center mb-8">No scan results returned.</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl font-bold text-white py-3 px-4 transition border border-[#222222] hover:opacity-90"
              style={{ background: "linear-gradient(to bottom, #4a4a4a 0%, #414141 50%, #383838 100%)" }}
            >
              Close
            </button>
            {!scanning && !error && (walletResult || contractResult) ? (
              <LinkToGuard scanKind={scanKind} address={address.trim()} onClose={onClose} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  const detailsModal =
    detailsOpen &&
    createPortal(
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        onClick={() => setDetailsOpen(false)}
      >
        <div
          className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col bg-[#191b28]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 shrink-0" style={{ backgroundColor: "#1B1B1B" }}>
            <h2 className="text-lg font-bold text-white">Contract scan details</h2>
            <button
              type="button"
              onClick={() => setDetailsOpen(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 transition"
              aria-label="Close details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-3 hide-scrollbar text-sm">
            {detailsLoading ? (
              <p className="text-slate-400">Loading details…</p>
            ) : !contractDetails ? (
              <p className="text-slate-400">Could not load scan details.</p>
            ) : (
              <>
                <DetailRow label="Contract" value={contractDetails.contract_address} mono />
                <DetailRow label="Trust score" value={`${contractDetails.trust_score}%`} />
                <DetailRow label="Critical risk flags" value={String(contractDetails.critical_risk_flags)} />
                <DetailRow label="Token controlled" value={contractDetails.token_controlled || "—"} />
                <DetailRow label="Owner / admin" value={String(contractDetails.owner_admin_count)} />
                <DetailRow label="Scanned" value={formatDate(contractDetails.scanned_at)} />
              </>
            )}
          </div>
          <div className="p-5 border-t border-slate-700/60 shrink-0">
            <button
              type="button"
              onClick={() => setDetailsOpen(false)}
              className="w-full rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white text-sm font-medium py-3 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      {typeof document !== "undefined" ? createPortal(modal, document.body) : modal}
      {detailsModal}
    </>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center sm:gap-4">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span className={`text-slate-200 ${mono ? "font-mono break-all text-left sm:text-right" : ""}`}>{value}</span>
    </div>
  );
}

function LinkToGuard({
  scanKind,
  address,
  onClose,
}: {
  scanKind: ScanKind | null;
  address: string;
  onClose: () => void;
}) {
  const href =
    scanKind === "contract"
      ? `/guard/contract-scanner?address=${encodeURIComponent(address)}`
      : `/connect-wallet?redirect=${encodeURIComponent(`/guard/wallet-security?address=${encodeURIComponent(address)}`)}`;

  return (
    <a
      href={href}
      onClick={onClose}
      className="flex-1 rounded-xl font-medium text-white py-3 px-4 text-center transition border border-[#001a99] hover:opacity-95"
      style={{ background: "linear-gradient(to bottom, #3366ff 0%, #0026FF 50%, #001fcc 100%)" }}
    >
      Open in Guard
    </a>
  );
}
