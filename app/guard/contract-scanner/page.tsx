"use client";

import React, { useState } from "react";
import Image from "next/image";

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

const SCAN_HISTORY = [
  { name: "ZenYield Protocol", network: "Ethereum Mainnet", scanDate: "June 4, 2025", tokenType: "DeFi Yield Token" },
  { name: "GreenFinance DAO", network: "Binance Smart Chain", scanDate: "August 12, 2024", tokenType: "Sustainable Investment Token" },
  { name: "Artistry NFT", network: "Polygon Network", scanDate: "September 15, 2025", tokenType: "Creative Asset Token" },
  { name: "HealthChain Network", network: "Solana", scanDate: "June 4, 2025", tokenType: "Healthcare Data Token" },
  { name: "EduToken Initiative", network: "Cardano", scanDate: "August 12, 2024", tokenType: "Education Funding Token" },
  { name: "TravelCoin Ecosystem", network: "Avalanche", scanDate: "September 15, 2025", tokenType: "Travel Reward Token" },
  { name: "FoodChain Alliance", network: "Tezos", scanDate: "June 4, 2025", tokenType: "Agricultural Sustainability Token" },
];

const PRIVILEGED_FUNCTIONS = ["Pause Trading", "Set Transfer Fee", "Exclude from fee", "Withdraw stuck ETH"];

const KEY_RISK_FLAGS = [
  "Owner can pause all token transfers",
  "Transaction fees can be modified at any time",
  "Ownership has not been renounced",
];

const POSITIVE_SIGNALS = [
  "Source code verified on Etherscan",
  "Liquidity has remained stable since deployment",
  "No critical vulnerabilities in last audit",
];

const COMMUNITY_SIGNALS = [
  "6 community reports submitted",
  "0 confirmed exploits",
  "3 users flagged high fee risk",
];

const RISK_DISTRIBUTION = [
  { label: "Ownership Risk", value: 5 },
  { label: "Approval Risk", value: 4 },
  { label: "Liquidity Safety", value: 9 },
  { label: "Code Transparency", value: 7 },
  { label: "Community Trust", value: 6 },
];

export default function ContractScannerPage() {
  const [contractLink, setContractLink] = useState("");
  const [showDetails, setShowDetails] = useState(true); // default visible for UI match

  const handleScan = () => {
    setShowDetails(true);
  };

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
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Smart Contract Link</label>
              <div className="relative flex items-stretch rounded-lg border focus-within:ring-1 focus-within:ring-slate-500 emboss-inset-3d-input" style={{ borderColor: "#25283D", backgroundColor: "#25283D" }}>
                <input
                  type="text"
                  placeholder="Enter Smart Contract Link"
                  value={contractLink}
                  onChange={(e) => setContractLink(e.target.value)}
                  className="flex-1 min-w-0 rounded-l-lg bg-transparent text-white text-sm pl-3 py-3 focus:outline-none placeholder:text-slate-500 border-0"
                />
                <button
                  type="button"
                  onClick={handleScan}
                  className="rounded-r-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium px-5 py-3 transition shrink-0 border-0"
                >
                  Scan
                </button>
              </div>
            </div>
            {showDetails && (
              <div className="rounded-lg border p-5 space-y-0 text-sm min-h-[200px]" style={{ ...INNER_BG, backgroundColor: "#0d1029" }}>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Network:</span><span className="text-right">Ethereum Mainnet</span></p>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Contract Name:</span><span className="text-right">ZenYield Protocol</span></p>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Contract Type:</span><span className="text-right">DeFi Yield Token</span></p>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Detected Standard:</span><span className="text-right">ERC-20 (Custom)</span></p>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Deployment Date:</span><span className="text-right">June 4, 2025</span></p>
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
              {SCAN_HISTORY.map((item, i) => (
                <li
                  key={i}
                  className="rounded-lg border p-3 text-sm cursor-pointer hover:bg-slate-700/30 transition"
                  style={INNER_BG}
                >
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{item.network}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{item.scanDate} · {item.tokenType}</p>
                </li>
              ))}
            </ul>
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
                    { label: "Contract Name", value: "ZenYield Protocol" },
                    { label: "Address", value: "0x4F9a...cC21", mono: true },
                    { label: "Network", value: "Ethereum Mainnet" },
                    { label: "Standard", value: "ERC-20 (Custom)" },
                    { label: "Deployed", value: "June 4, 2025" },
                    { label: "Verified", value: "Yes" },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <span className="text-slate-400 text-sm shrink-0">{row.label}</span>
                      <span className={`text-slate-200 text-sm text-right ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
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
                    {PRIVILEGED_FUNCTIONS.map((fn, i) => (
                      <li key={i} className="text-sm text-white flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full border-4 border-[#4066FF] bg-transparent shrink-0" aria-hidden />
                        {fn}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-lg px-4 py-3 mt-auto" style={{ backgroundColor: "#303242" }}>
                    <p className="text-sm text-white mb-0">
                      <span className="text-slate-300">Risk Level: </span>
                      <span className="font-medium">Medium</span>
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
                    strokeDasharray="72, 100"
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-medium leading-tight">72<span className="text-xl font-normal text-slate-400">/100</span></span>
                  <span className="text-sm font-medium flex items-center gap-1 mt-0.5" style={{ color: "#32BB1D" }}>
                    <Image src={trendUpIcon} alt="" className="w-6 h-6" width={24} height={24} />
                    High
                  </span>
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                {/* Top row: Trust Score left, Confidence Level far right */}
                <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-400 font-normal">Trust Score</span>
                    <span className="emboss-inset-3d-input rounded-md px-3 py-1.5 bg-white/10 border border-white/10">
                      <span className="text-lg font-bold text-white">70</span>
                      <span className="text-base font-normal text-slate-400">/100</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-400 font-normal">Confidence Level</span>
                    <span className="emboss-inset-3d-input rounded-lg px-3 py-1.5 bg-white/10 border border-white/10 text-base font-semibold" style={{ color: "#32BB1D" }}>
                      High
                    </span>
                  </div>
                </div>
                {/* Summary section in its own box */}
                <div className="rounded-lg border p-4 flex flex-col gap-2" style={{ backgroundColor: "rgba(13, 16, 41, 0.6)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <p className="text-base font-semibold text-white">Summary</p>
                  <p className="text-base text-slate-400 font-normal leading-relaxed">
                    This contract shows normal DeFi behavior but contains owner-controlled permissions that may impact users if misused.
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
                {KEY_RISK_FLAGS.map((item, i) => (
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
                {POSITIVE_SIGNALS.map((item, i) => (
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
                {COMMUNITY_SIGNALS.map((item, i) => (
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
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between text-white text-xs font-medium shrink-0 py-0.5" style={{ height: "280px" }}>
                  {[10, 8, 6, 4, 2, 0].map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
                {/* Chart area with bars */}
                <div className="flex-1 relative" style={{ height: "280px" }}>
                  {/* Dotted horizontal guide at y=7 */}
                  <div className="absolute left-0 right-0 border-t border-dashed border-slate-500/50 pointer-events-none" style={{ top: "30%" }} aria-hidden />
                  <div className="flex items-end justify-between gap-6 h-full">
                    {RISK_DISTRIBUTION.map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 min-w-[5rem] w-24 shrink-0 h-full">
                        <div className="w-12 flex-1 flex flex-col justify-end items-center min-h-0">
                          {item.value === 9 && (
                            <span className="rounded px-2 py-0.5 text-xs font-medium text-white mb-1 shrink-0" style={{ backgroundColor: "#0026FF" }}>
                              9/10
                            </span>
                          )}
                          <div
                            className="w-full rounded-t-lg shrink-0"
                            style={{ height: `${(item.value / 10) * 100}%`, minHeight: "8px", backgroundColor: "#0026FF" }}
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
                {[
                  { label: "Honeypot:", value: "No" },
                  { label: "Approval Drain:", value: "No" },
                  { label: "Delayed Rug", value: "No" },
                  { label: "Fee Escalation:", value: "No" },
                ].map((item, i) => (
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
                <span className="text-sm font-medium text-white">28%</span>
              </div>
            </div>
            <div className="emboss-inset-3d-input rounded-lg border p-5 min-h-[220px]" style={{ backgroundColor: "#0d1029", borderColor: "#0d1029" }}>
              <h3 className="text-base font-bold text-white mb-4">Activity</h3>
              <ul className="divide-y divide-[#444554] text-sm text-slate-300">
                {[
                  { label: "Avg Tx / Day", value: "1,284" },
                  { label: "Largest Tx", value: "$18,400" },
                  { label: "Abnormal Activity", value: "No" },
                ].map((item, i) => (
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
                {[
                  { label: "Initial LP", value: "$120k" },
                  { label: "Current LP", value: "$147.5k" },
                  { label: "Sudden Pulls", value: "None" },
                ].map((item, i) => (
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
                <span className="text-sm font-semibold" style={{ color: "#22c55e" }}>High</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-base font-bold shrink-0" style={{ color: "#0026ff" }}>Recommendation</span>
                <div className="h-4 w-px shrink-0 self-center bg-[#444554]" aria-hidden />
                <p className="text-sm text-slate-400 leading-relaxed">
                  Enable alerts and avoid large approvals until ownership risk reduces
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
