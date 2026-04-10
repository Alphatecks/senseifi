"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

import { useWallet } from "@/hooks/useWallet";
import {
  scanContract,
  getScanContractDetails,
  getRiskProfile,
  getContractScamPattern,
  getContractActivity,
  getContractLiquidity,
  getContractCommunitySignals,
} from "@/services/dashboardService";
import type {
  ScanContractResult,
  ScanContractDetailResponse,
  RiskProfileCachedContract,
  ContractScamPatternData,
  ContractActivityData,
  ContractLiquidityData,
  ContractCommunitySignalsData,
} from "@/services/dashboardService";

import trendUpIcon from "@/assets/icons/trend-up.png";

const CARD_STYLE = "rounded-2xl border p-5 flex flex-col shadow-sm";
const CARD_BG = { backgroundColor: "#191D35", borderColor: "#191D35" };
const INNER_BG = { backgroundColor: "#25283D", borderColor: "#25283D" };

const ENVELOPE_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  </span>
);

const DIAMOND_BULLET = (
  <span className="shrink-0 mt-1.5 flex items-center justify-center" aria-hidden>
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M4 0 L8 4 L4 8 L0 4 Z" fill="#4066FF" />
    </svg>
  </span>
);

const CHAIN_ID_TO_NETWORK: Record<number, string> = {
  1: "Ethereum Mainnet",
  137: "Polygon",
  56: "BNB Smart Chain",
  42161: "Arbitrum One",
  10: "Optimism",
  43114: "Avalanche",
};

function shortAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatScanDate(iso: string): string {
  try {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function trustScoreToLabel(score: number): string {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function trustScoreColor(score: number): string {
  if (score >= 70) return "#32BB1D";
  if (score >= 40) return "#eab308";
  return "#F00500";
}

const SCAN_HISTORY_PAGE_SIZE = 5;

export default function ContractScannerPage() {
  const { activeAddress: address } = useWallet();
  const [contractLink, setContractLink] = useState("");
  const [chainIdInput, setChainIdInput] = useState("");
  const [lastScanChainId, setLastScanChainId] = useState<number>(1);
  const [scanLoading, setScanLoading] = useState(false);
  const [currentScan, setCurrentScan] = useState<ScanContractResult | null>(null);
  const [scanDetails, setScanDetails] = useState<ScanContractDetailResponse | null>(null);
  const [riskProfile, setRiskProfile] = useState<RiskProfileCachedContract[] | null>(null);
  const [riskProfileLoading, setRiskProfileLoading] = useState(false);
  const [scanHistoryPage, setScanHistoryPage] = useState(1);
  const [scamPattern, setScamPattern] = useState<ContractScamPatternData | null>(null);
  const [activity, setActivity] = useState<ContractActivityData | null>(null);
  const [liquidity, setLiquidity] = useState<ContractLiquidityData | null>(null);
  const [communitySignals, setCommunitySignals] = useState<ContractCommunitySignalsData | null>(null);

  const selectedContractAddress = currentScan?.contract_address ?? null;

  useEffect(() => {
    if (!address?.trim()) {
      setRiskProfile(null);
      setScanHistoryPage(1);
      return;
    }
    setRiskProfileLoading(true);
    setScanHistoryPage(1);
    getRiskProfile(address)
      .then((data) => setRiskProfile(data?.cached_contract_risks ?? null))
      .finally(() => setRiskProfileLoading(false));
  }, [address]);

  const fetchContractDetails = useCallback((scanId: string, contractAddress: string) => {
    getScanContractDetails(scanId).then(setScanDetails);
    getContractScamPattern(contractAddress).then(setScamPattern);
    getContractActivity(contractAddress).then(setActivity);
    getContractLiquidity(contractAddress).then(setLiquidity);
    getContractCommunitySignals(contractAddress).then(setCommunitySignals);
  }, []);

  const chainIdParsed = chainIdInput.trim() === "" ? null : parseInt(chainIdInput.trim(), 10);
  const chainIdValid = chainIdParsed != null && !Number.isNaN(chainIdParsed) && chainIdParsed > 0;
  const scanDisabled = scanLoading || !contractLink.trim() || !chainIdValid;

  const handleScan = () => {
    const addr = contractLink.trim();
    const cid = chainIdValid ? chainIdParsed! : 1;
    if (!addr || !cid) return;
    setScanLoading(true);
    setLastScanChainId(cid);
    setCurrentScan(null);
    setScanDetails(null);
    setScamPattern(null);
    setActivity(null);
    setLiquidity(null);
    setCommunitySignals(null);
    scanContract(addr, address ?? undefined, cid)
      .then((result) => {
        setCurrentScan(result ?? null);
        if (result?.scan_id && result?.contract_address) {
          fetchContractDetails(result.scan_id, result.contract_address);
        }
      })
      .finally(() => setScanLoading(false));
  };

  const handleSelectHistoryItem = (item: RiskProfileCachedContract) => {
    setContractLink(item.contract_address);
    setCurrentScan(null);
    setScanDetails(null);
    setScamPattern(null);
    setActivity(null);
    setLiquidity(null);
    setCommunitySignals(null);
  };

  const details = scanDetails?.details ?? currentScan?.details;
  const summaryText = details?.ai_summary ?? currentScan?.ai_summary ?? "";
  const trustScore = scanDetails?.trust_score ?? currentScan?.trust_score ?? 0;
  const riskBreakdown = details?.risk_breakdown;
  const ownerPrivileges = details?.owner_privileges;
  const privilegedFunctionsList: string[] = [];
  if (ownerPrivileges) {
    if (ownerPrivileges.pause) privilegedFunctionsList.push("Pause Trading");
    if (ownerPrivileges.mint) privilegedFunctionsList.push("Mint tokens");
    if (ownerPrivileges.withdraw_liquidity) privilegedFunctionsList.push("Withdraw liquidity");
    if (ownerPrivileges.upgradeable) privilegedFunctionsList.push("Upgrade contract");
    if (ownerPrivileges.blacklist) privilegedFunctionsList.push("Blacklist addresses");
  }
  const keyRiskFlagsList: string[] = [];
  if (ownerPrivileges?.pause) keyRiskFlagsList.push("Owner can pause all token transfers");
  if (currentScan && currentScan.critical_risk_flags > 0) keyRiskFlagsList.push("Critical risk flags detected");
  if (ownerPrivileges && !keyRiskFlagsList.length) keyRiskFlagsList.push("Ownership has not been renounced");
  const positiveSignalsList: string[] = [];
  if (details?.reputation?.verified_source) positiveSignalsList.push("Source code verified on Etherscan");
  if (details?.reputation && !details.reputation.reported_scam) positiveSignalsList.push("No critical vulnerabilities in last audit");
  const riskDistributionList = riskBreakdown
    ? [
        { label: "Simulation", value: riskBreakdown.simulation ?? 0 },
        { label: "Owner", value: riskBreakdown.owner_privileges ?? 0 },
        { label: "Reputation", value: riskBreakdown.reputation ?? 0 },
        { label: "Contract age", value: riskBreakdown.contract_age ?? 0 },
      ].filter((r) => r.value > 0)
    : [];
  const maxRiskVal = Math.max(10, ...riskDistributionList.map((r) => r.value));
  const chainIdForDisplay = currentScan ? lastScanChainId : (chainIdValid ? chainIdParsed! : 1);
  const networkName = CHAIN_ID_TO_NETWORK[chainIdForDisplay] ?? (chainIdForDisplay ? `Chain ${chainIdForDisplay}` : "—");

  return (
    <div className="rounded-2xl bg-blue-950/25 border border-blue-900/40 p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Contract Scanner card */}
          <div className={`${CARD_STYLE} min-h-[200px]`} style={CARD_BG}>
            <div className="flex items-center gap-2 mb-4">
              {ENVELOPE_ICON}
              <h2 className="text-lg font-medium text-white">Contract Scanner</h2>
            </div>
            <div className="mb-3">
              <label className="block text-sm text-slate-400 mb-2">Smart Contract Address</label>
              <div className="rounded-lg border focus-within:ring-1 focus-within:ring-slate-500 emboss-inset-3d-input" style={{ borderColor: "#25283D", backgroundColor: "#25283D" }}>
                <input
                  type="text"
                  placeholder="Enter contract address (0x…)"
                  value={contractLink}
                  onChange={(e) => setContractLink(e.target.value)}
                  className="w-full rounded-lg bg-transparent text-white text-sm pl-3 py-3 focus:outline-none placeholder:text-slate-500 border-0"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Chain ID</label>
              <div className="rounded-lg border focus-within:ring-1 focus-within:ring-slate-500 emboss-inset-3d-input" style={{ borderColor: "#25283D", backgroundColor: "#25283D" }}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 1 (Ethereum)"
                  value={chainIdInput}
                  onChange={(e) => setChainIdInput(e.target.value)}
                  className="w-full rounded-lg bg-transparent text-white text-sm pl-3 py-3 focus:outline-none placeholder:text-slate-500 border-0"
                />
              </div>
              <button
                type="button"
                onClick={handleScan}
                disabled={scanDisabled}
                className="mt-3 w-full rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] disabled:opacity-60 text-white text-sm font-medium py-3 transition"
              >
                {scanLoading ? "Scanning…" : "Scan"}
              </button>
            </div>
            {currentScan && (
              <div className="rounded-lg border p-5 space-y-0 text-sm min-h-[200px]" style={{ ...INNER_BG, backgroundColor: "#0d1029" }}>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Network:</span><span className="text-right">{networkName}</span></p>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Contract Name:</span><span className="text-right font-mono">{shortAddress(currentScan.contract_address)}</span></p>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Contract Type:</span><span className="text-right">{currentScan.token_controlled || "—"}</span></p>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Detected Standard:</span><span className="text-right">{currentScan.token_controlled || "—"}</span></p>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Scanned:</span><span className="text-right">{formatScanDate(currentScan.scanned_at)}</span></p>
              </div>
            )}
          </div>

          {/* Scan History card */}
          <div className={`${CARD_STYLE}`} style={CARD_BG}>
            <div className="flex items-center gap-2 mb-4">
              {ENVELOPE_ICON}
              <h2 className="text-lg font-medium text-white">Scan History</h2>
            </div>
            <ul className="space-y-3">
              {!address ? (
                <li className="rounded-lg border p-3 text-sm text-slate-500" style={INNER_BG}>Connect wallet for scan history</li>
              ) : riskProfileLoading ? (
                <li className="rounded-lg border p-3 text-sm text-slate-500" style={INNER_BG}>Loading…</li>
              ) : !riskProfile?.length ? (
                <li className="rounded-lg border p-3 text-sm text-slate-500" style={INNER_BG}>No scan history yet</li>
              ) : (
                riskProfile
                  .slice((scanHistoryPage - 1) * SCAN_HISTORY_PAGE_SIZE, scanHistoryPage * SCAN_HISTORY_PAGE_SIZE)
                  .map((item, i) => (
                    <li
                      key={`${item.contract_address}-${item.scanned_at}-${i}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectHistoryItem(item)}
                      onKeyDown={(e) => e.key === "Enter" && handleSelectHistoryItem(item)}
                      className="rounded-lg border p-3 text-sm cursor-pointer hover:bg-slate-700/30 transition"
                      style={INNER_BG}
                    >
                      <p className="text-white font-medium font-mono">{shortAddress(item.contract_address)}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{networkName}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{formatScanDate(item.scanned_at)} · Trust {item.trust_score}</p>
                    </li>
                  ))
              )}
            </ul>
            {riskProfile && riskProfile.length > SCAN_HISTORY_PAGE_SIZE && (() => {
              const scanHistoryTotalPages = Math.ceil(riskProfile.length / SCAN_HISTORY_PAGE_SIZE);
              return (
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-700/50">
                  <button type="button" onClick={() => setScanHistoryPage((p) => Math.max(1, p - 1))} disabled={scanHistoryPage <= 1} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white bg-[#25283D] border border-slate-600/50 hover:border-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    ← Prev
                  </button>
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {scanHistoryTotalPages <= 7
                      ? Array.from({ length: scanHistoryTotalPages }, (_, i) => i + 1).map((n) => (
                          <button key={n} type="button" onClick={() => setScanHistoryPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${scanHistoryPage === n ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}>{n}</button>
                        ))
                      : (
                          <>
                            <button type="button" onClick={() => setScanHistoryPage(1)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${scanHistoryPage === 1 ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}>1</button>
                            {scanHistoryPage > 3 && <span className="px-1 text-slate-500">…</span>}
                            {Array.from({ length: scanHistoryTotalPages }, (_, i) => i + 1)
                              .filter((n) => n > 1 && n < scanHistoryTotalPages && Math.abs(n - scanHistoryPage) <= 2)
                              .map((n) => (
                                <button key={n} type="button" onClick={() => setScanHistoryPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${scanHistoryPage === n ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}>{n}</button>
                              ))}
                            {scanHistoryPage < scanHistoryTotalPages - 2 && <span className="px-1 text-slate-500">…</span>}
                            {scanHistoryTotalPages > 1 && (
                              <button type="button" onClick={() => setScanHistoryPage(scanHistoryTotalPages)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${scanHistoryPage === scanHistoryTotalPages ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}>{scanHistoryTotalPages}</button>
                            )}
                          </>
                        )}
                  </div>
                  <button type="button" onClick={() => setScanHistoryPage((p) => Math.min(scanHistoryTotalPages, p + 1))} disabled={scanHistoryPage >= scanHistoryTotalPages} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white bg-[#25283D] border border-slate-600/50 hover:border-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Next →
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right column - single box housing all sections */}
        <div className={`${CARD_STYLE} flex flex-col gap-6`} style={CARD_BG}>
          {/* SenseiGuard Insight - two columns */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              {ENVELOPE_ICON}
              <h2 className="text-lg font-medium text-white">SenseiGuard Insight</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Left: Smart Contract Details - title inside box, normal weight */}
              <div className="flex flex-col">
                <div className="rounded-lg border px-4 py-3 h-full divide-y divide-[#444554]" style={INNER_BG}>
                  <p className="text-base font-medium text-white pb-3 mb-0">Smart Contract Details</p>
                  {[
                    { label: "Contract Name", value: selectedContractAddress ? shortAddress(selectedContractAddress) : "—", mono: true },
                    { label: "Address", value: selectedContractAddress ?? "—", mono: true },
                    { label: "Network", value: networkName, mono: false },
                    { label: "Standard", value: (currentScan?.token_controlled || scanDetails?.token_controlled) ?? "—", mono: false },
                    { label: "Deployed", value: "—", mono: false },
                    { label: "Verified", value: details?.reputation?.verified_source ? "Yes" : "No", mono: false },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <span className="text-slate-400 text-sm shrink-0">{row.label}</span>
                      <span className={`text-slate-200 text-sm text-right break-all ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Right: Permission & Control Analysis - title inside box, same height as left via stretch */}
              <div className="flex flex-col">
                <div className="rounded-lg border px-4 py-5 h-full flex flex-col" style={INNER_BG}>
                  <p className="text-base font-medium text-white pb-5 mb-0">Permission & Control Analysis</p>
                  <div className="rounded-lg px-4 py-3 mb-5" style={{ backgroundColor: "#0d1029" }}>
                    <p className="text-slate-300 font-medium text-sm mb-0">Detected Privileged Functions</p>
                  </div>
                  <ul className="space-y-5 mb-6">
                    {(privilegedFunctionsList.length ? privilegedFunctionsList : ["—"]).map((fn, i) => (
                      <li key={i} className="text-sm text-white flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full border-4 border-[#4066FF] bg-transparent shrink-0" aria-hidden />
                        {fn}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-lg px-4 py-3 mt-auto" style={{ backgroundColor: "#303242" }}>
                    <p className="text-sm text-white mb-0">
                      <span className="text-slate-300">Risk Level: </span>
                      <span className="font-medium" style={{ color: trustScoreColor(trustScore) }}>{details?.rug_pull_probability ?? trustScoreToLabel(trustScore)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Point */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {ENVELOPE_ICON}
              <h2 className="text-lg font-medium text-white">Trust Point</h2>
            </div>
            <div className="rounded-lg border p-5 min-h-[220px]" style={INNER_BG}>
              <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-48 h-48 shrink-0 rounded-full" style={{ background: "radial-gradient(ellipse 75% 75% at 50% 50%, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)" }}>
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="contractTrustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4066FF" />
                      <stop offset="100%" stopColor="#0026FF" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="none"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    fill="none"
                    stroke="url(#contractTrustGrad)"
                    strokeWidth="3.5"
                    strokeDasharray={`${trustScore}, 100`}
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-medium leading-tight">{trustScore}<span className="text-xl font-normal text-slate-400">/100</span></span>
                  <span className="text-sm font-medium flex items-center gap-1 mt-0.5" style={{ color: trustScoreColor(trustScore) }}>
                    <Image src={trendUpIcon} alt="" className="w-6 h-6" width={24} height={24} />
                    {trustScoreToLabel(trustScore)}
                  </span>
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-400 font-normal">Trust Score</span>
                    <span className="emboss-inset-3d-input rounded-md px-3 py-1.5 bg-white/10 border border-white/10">
                      <span className="text-lg font-bold text-white">{trustScore}</span>
                      <span className="text-base font-normal text-slate-400">/100</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-400 font-normal">Confidence Level</span>
                    <span className="emboss-inset-3d-input rounded-lg px-3 py-1.5 bg-white/10 border border-white/10 text-base font-semibold" style={{ color: trustScoreColor(trustScore) }}>
                      {trustScoreToLabel(trustScore)}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border p-4 flex flex-col gap-2" style={{ backgroundColor: "rgba(13, 16, 41, 0.6)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <p className="text-base font-semibold text-white">Summary</p>
                  <p className="text-base text-slate-400 font-normal leading-relaxed">
                    {summaryText || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Key Signals: Risk Flags, Positive, Community - emboss cards, diamond bullets, dividers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="emboss-inset-3d-input rounded-lg border p-5 min-h-[220px]" style={{ backgroundColor: "#0d1029", borderColor: "#0d1029" }}>
              <div className="flex flex-col gap-3 mb-5">
                {ENVELOPE_ICON}
                <h3 className="text-base font-bold text-white">Key Risk Flags</h3>
              </div>
              <ul className="divide-y divide-[#444554] text-sm text-slate-300">
                {(keyRiskFlagsList.length ? keyRiskFlagsList : ["—"]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 py-3 first:pt-0 last:pb-0">
                    {DIAMOND_BULLET}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="emboss-inset-3d-input rounded-lg border p-5 min-h-[220px]" style={{ backgroundColor: "#0d1029", borderColor: "#0d1029" }}>
              <div className="flex flex-col gap-3 mb-5">
                {ENVELOPE_ICON}
                <h3 className="text-base font-bold text-white">Positive Signals</h3>
              </div>
              <ul className="divide-y divide-[#444554] text-sm text-slate-300">
                {(positiveSignalsList.length ? positiveSignalsList : ["—"]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 py-3 first:pt-0 last:pb-0">
                    {DIAMOND_BULLET}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="emboss-inset-3d-input rounded-lg border p-5 min-h-[220px]" style={{ backgroundColor: "#0d1029", borderColor: "#0d1029" }}>
              <div className="flex flex-col gap-3 mb-5">
                {ENVELOPE_ICON}
                <h3 className="text-base font-bold text-white">Community Signals</h3>
              </div>
              <ul className="divide-y divide-[#444554] text-sm text-slate-300">
                {(communitySignals
                  ? [
                      `${communitySignals.report_count} community reports submitted`,
                      `${communitySignals.confirmed_exploits} confirmed exploits`,
                      `${communitySignals.users_flagged_count} users flagged`,
                    ]
                  : ["—"]
                ).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 py-3 first:pt-0 last:pb-0">
                    {DIAMOND_BULLET}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Visual Risk Distribution - vertical bar chart in dark card */}
          <div className="pt-4">
            <div className="rounded-lg border p-5" style={{ backgroundColor: "#252736", borderColor: "#252736" }}>
              <div className="flex items-center justify-between gap-3 mb-5">
                <h2 className="text-lg font-medium text-white">Visual Risk Distribution</h2>
                <div className="relative flex items-center">
                  <select className="emboss-inset-3d-input rounded-lg border text-white text-sm font-medium pl-3 pr-8 py-2.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-500 min-w-[8rem] bg-slate-700/80 border-slate-600/60">
                    <option>This month</option>
                  </select>
                  <svg className="absolute right-2.5 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col justify-between text-white text-xs font-medium shrink-0 py-0.5" style={{ height: "280px" }}>
                  {[10, 8, 6, 4, 2, 0].map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
                <div className="flex-1 relative" style={{ height: "280px" }}>
                  <div className="absolute left-0 right-0 border-t border-dashed border-slate-500/50 pointer-events-none" style={{ top: "30%" }} aria-hidden />
                  <div className="flex items-end justify-between gap-6 h-full">
                    {(riskDistributionList.length ? riskDistributionList : [{ label: "—", value: 0 }]).map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 min-w-[5rem] w-24 shrink-0 h-full">
                        <div className="w-12 flex-1 flex flex-col justify-end items-center min-h-0">
                          {item.value > 0 && (
                            <span className="rounded px-2 py-0.5 text-xs font-medium text-white mb-1 shrink-0" style={{ backgroundColor: "#0026FF" }}>
                              {item.value}/{maxRiskVal}
                            </span>
                          )}
                          <div
                            className="w-full rounded-t-lg shrink-0"
                            style={{ height: maxRiskVal ? `${(item.value / maxRiskVal) * 100}%` : "0%", minHeight: item.value ? "8px" : "0", backgroundColor: "#0026FF" }}
                          />
                        </div>
                        <span className="text-xs text-white text-center w-full pt-1 break-words leading-tight" style={{ wordBreak: "break-word" }}>{item.label}:</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scam Pattern Intelligence, Activity, Liquidity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="emboss-inset-3d-input rounded-lg border p-5 min-h-[220px] flex flex-col" style={{ backgroundColor: "#0d1029", borderColor: "#0d1029" }}>
              <h3 className="text-base font-bold text-white mb-4">Scam Pattern Intelligence</h3>
              <ul className="divide-y divide-[#444554] text-sm text-slate-300 flex-1">
                {(scamPattern
                  ? [
                      { label: "Honeypot:", value: scamPattern.honeypot ? "Yes" : "No" },
                      { label: "Approval Drain:", value: scamPattern.approval_drain ? "Yes" : "No" },
                      { label: "Delayed Rug:", value: scamPattern.delayed_rug ? "Yes" : "No" },
                      { label: "Fee Escalation:", value: scamPattern.fee_escalation ? "Yes" : "No" },
                    ]
                  : [{ label: "—", value: "—" }]
                ).map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <span className="flex items-start gap-2 min-w-0">
                      {DIAMOND_BULLET}
                      <span>{item.label}</span>
                    </span>
                    <span className="text-white font-medium shrink-0">{item.value}</span>
                  </li>
                ))}
              </ul>
              <div className="emboss-inset-3d-input rounded-lg border mt-4 px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "rgba(0,0,0,0.2)", borderColor: "#444554" }}>
                <span className="text-sm text-white">Similarity Score:</span>
                <span className="text-sm font-medium text-white">{scamPattern != null ? `${scamPattern.similarity_score_percent}%` : "—"}</span>
              </div>
            </div>
            <div className="emboss-inset-3d-input rounded-lg border p-5 min-h-[220px]" style={{ backgroundColor: "#0d1029", borderColor: "#0d1029" }}>
              <h3 className="text-base font-bold text-white mb-4">Activity</h3>
              <ul className="divide-y divide-[#444554] text-sm text-slate-300">
                {(activity
                  ? [
                      { label: "Avg Tx / Day", value: activity.avg_tx_per_day != null ? String(activity.avg_tx_per_day) : "—" },
                      { label: "Largest Tx", value: activity.largest_tx_usd != null ? `$${activity.largest_tx_usd.toLocaleString()}` : "—" },
                      { label: "Abnormal Activity", value: activity.abnormal_activity ? "Yes" : "No" },
                    ]
                  : [{ label: "—", value: "—" }]
                ).map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <span className="flex items-start gap-2 min-w-0">
                      {DIAMOND_BULLET}
                      <span>{item.label}</span>
                    </span>
                    <span className="text-white font-medium shrink-0">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="emboss-inset-3d-input rounded-lg border p-5 min-h-[220px]" style={{ backgroundColor: "#0d1029", borderColor: "#0d1029" }}>
              <h3 className="text-base font-bold text-white mb-4">Liquidity</h3>
              <ul className="divide-y divide-[#444554] text-sm text-slate-300">
                {(liquidity
                  ? [
                      { label: "Initial LP", value: liquidity.initial_lp_usd != null ? `$${liquidity.initial_lp_usd.toLocaleString()}` : "—" },
                      { label: "Current LP", value: liquidity.current_lp_usd != null ? `$${liquidity.current_lp_usd.toLocaleString()}` : "—" },
                      { label: "Sudden Pulls", value: liquidity.sudden_pulls != null ? String(liquidity.sudden_pulls) : "—" },
                    ]
                  : [{ label: "—", value: "—" }]
                ).map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <span className="flex items-start gap-2 min-w-0">
                      {DIAMOND_BULLET}
                      <span>{item.label}</span>
                    </span>
                    <span className="text-white font-medium shrink-0">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Final Verdict & Recommendation */}
          <div className="mt-4 rounded-lg border p-6" style={{ backgroundColor: "#0d1029", borderColor: "#444554" }}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-white shrink-0">Final Verdict</span>
                <div className="h-4 w-px shrink-0 bg-[#444554]" aria-hidden />
                <span className="text-sm text-slate-400">Risk Level:</span>
                <span className="text-sm font-semibold" style={{ color: trustScoreColor(trustScore) }}>{details?.rug_pull_probability ?? trustScoreToLabel(trustScore)}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-base font-bold shrink-0" style={{ color: "#0026ff" }}>Recommendation</span>
                <div className="h-4 w-px shrink-0 self-center bg-[#444554]" aria-hidden />
                <p className="text-sm text-slate-400 leading-relaxed">
                  {summaryText || "Enable alerts and avoid large approvals until ownership risk reduces"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(180deg, #2563EB 0%, #0026FF 100%)" }}
              >
                Monitor Owner Wallet
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white border transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#1E2238", borderColor: "#444554" }}
              >
                Compare smart Contract
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
