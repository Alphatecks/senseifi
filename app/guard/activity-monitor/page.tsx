"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const CARD_STYLE = "rounded-2xl border p-5 flex flex-col shadow-sm";
const CARD_BG = { backgroundColor: "#191D35", borderColor: "#191D35" };

const CHART_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  </span>
);

const WALLET_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-500/60 bg-transparent shrink-0">
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  </span>
);

const WALLET_STATUS_CHART = (
  <svg className="w-full h-12" viewBox="0 0 120 32" preserveAspectRatio="none">
    {/* Subtle vertical dividers at ~1/3 and ~2/3 */}
    <line x1="40" y1="0" x2="40" y2="32" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />
    <line x1="80" y1="0" x2="80" y2="32" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />
    {/* Faint blue fill below curve */}
    <path
      fill="rgba(64,102,255,0.2)"
      d="M 0,18 C 12,8 20,24 30,14 C 40,4 50,22 60,12 C 70,2 78,20 90,10 C 100,22 108,6 120,16 L 120,32 L 0,32 Z"
    />
    {/* Smooth undulating blue line */}
    <path
      fill="none"
      stroke="#4066FF"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 0,18 C 12,8 20,24 30,14 C 40,4 50,22 60,12 C 70,2 78,20 90,10 C 100,22 108,6 120,16"
    />
  </svg>
);

const ALERT_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  </span>
);

const CLOCK_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </span>
);

const TIMELINE_EVENTS = [
  { time: "23:27", title: "Wallet Connected", desc: "A new wallet has been successfully linked to your account." },
  { time: "23:28", title: "Transaction Completed", desc: "Your transaction has been processed successfully." },
  { time: "23:29", title: "New Message Received", desc: "You have a new message from your contact." },
  { time: "23:30", title: "Profile Update Successful", desc: "Your profile information has been updated successfully." },
];

const CONNECTED_WALLETS = [
  { name: "MetaMask", address: "0xA182...C3D4", network: "Ethereum", security: "Safe", securityColor: "text-[#32BB1D]", status: "Active", statusColor: "text-[#32BB1D]", lastActivity: "2 minutes ago", icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" },
  { name: "Trust Wallet", address: "0xB3c4...D5E6", network: "Binance Smart Chain", security: "Moderate", securityColor: "text-amber-500", status: "Active", statusColor: "text-[#32BB1D]", lastActivity: "5 minutes ago", icon: "https://cdn.pixabay.com/photo/2021/04/30/16/47/bnb-6219388_1280.png" },
  { name: "Coinbase Wallet", address: "0xC4d5...E6F7", network: "Ethereum", security: "High", securityColor: "text-[#F00500]", status: "Inactive", statusColor: "text-slate-400", lastActivity: "1 hour ago", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMTEqHVL3ayDk8d7A3ocOPuegNGWkJOrQV9BZtntRm-IO2sAlpROwbuC7k9MkvOFjkUN96oTydqRJocPFhThiE&s&ec=121528429" },
];

const CONNECTED_DAPPS = [
  { name: "Uniswap", subtitle: "Token Swaps & Liquidity", assets: "ETH, USDC", status: "Active", statusColor: "text-[#32BB1D]", connectedWallet: "Main Wallet", lastActivity: "2 minutes ago", icon: "https://cryptologos.cc/logos/uniswap-uni-logo.png" },
  { name: "Uniswap", subtitle: "Token Swaps & Liquidity", assets: "ETH, USDC", status: "Active", statusColor: "text-[#32BB1D]", connectedWallet: "Main Wallet", lastActivity: "2 minutes ago", icon: "https://cryptologos.cc/logos/uniswap-uni-logo.png" },
  { name: "Uniswap", subtitle: "Token Swaps & Liquidity", assets: "ETH, USDC", status: "Active", statusColor: "text-[#32BB1D]", connectedWallet: "Main Wallet", lastActivity: "2 minutes ago", icon: "https://cryptologos.cc/logos/uniswap-uni-logo.png" },
];

type RiskLevel = "Low" | "Medium" | "High";
type StatusType = "Completed" | "Pending" | "Failed";

const ACTIVITY_ROWS: Array<{
  time: string;
  wallet: string;
  type: string;
  assetAmount: string;
  counterparty: string;
  risk: RiskLevel;
  status: StatusType;
}> = [
  { time: "23:27", wallet: "MetaMask", type: "Incoming", assetAmount: "0.42 ETH", counterparty: "0x9f3...a21", risk: "Low", status: "Completed" },
  { time: "23:26", wallet: "Coinbase", type: "Outgoing", assetAmount: "1.20 ETH", counterparty: "0x7B2...c4D", risk: "Medium", status: "Completed" },
  { time: "23:24", wallet: "Binance", type: "Incoming", assetAmount: "2.50 ETH", counterparty: "0xA91...e8F", risk: "Low", status: "Pending" },
  { time: "23:22", wallet: "WalletConnect", type: "Contract", assetAmount: "0.00 ETH", counterparty: "Uniswap V3", risk: "Low", status: "Completed" },
  { time: "23:20", wallet: "Kraken", type: "Outgoing", assetAmount: "0.15 ETH", counterparty: "0x3d4...b2C", risk: "High", status: "Completed" },
  { time: "23:18", wallet: "Trust Wallet", type: "Incoming", assetAmount: "5.00 ETH", counterparty: "0x1E5...9A7", risk: "Low", status: "Failed" },
  { time: "23:15", wallet: "Gemini", type: "Outgoing", assetAmount: "0.88 ETH", counterparty: "0xC2a...1D3", risk: "Medium", status: "Completed" },
  { time: "23:12", wallet: "MetaMask", type: "Approval", assetAmount: "USDC", counterparty: "0x4F8...1B2C", risk: "Low", status: "Completed" },
  { time: "23:10", wallet: "Coinbase", type: "Incoming", assetAmount: "1.00 ETH", counterparty: "0x8E2...f6A", risk: "Low", status: "Pending" },
  { time: "23:08", wallet: "Binance", type: "Outgoing", assetAmount: "0.25 ETH", counterparty: "0x2B7...c9E", risk: "Medium", status: "Completed" },
];

const RISK_CLASS: Record<RiskLevel, string> = {
  Low: "text-[#32BB1D]",
  Medium: "text-amber-500",
  High: "text-[#F00500]",
};

const STATUS_CLASS: Record<StatusType, string> = {
  Completed: "text-[#32BB1D]",
  Pending: "text-amber-500",
  Failed: "text-[#F00500]",
};

export default function ActivityMonitorPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [page, setPage] = useState(12);
  const [connectedTab, setConnectedTab] = useState<"wallet" | "dapps">("wallet");
  const totalPages = 78;

  return (
    <div className="rounded-2xl bg-blue-950/25 border border-blue-900/40 p-6 space-y-6">
      {/* Top + middle grid: Wallet Status, Active Alerts, Activity Timeline | Recent Activity, Connected W&dApps */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Col 1 */}
        <div className="space-y-4">
          {/* Wallet Status - redesigned to match reference */}
          <div className={`${CARD_STYLE} min-h-[200px] flex flex-col`} style={CARD_BG}>
            <div className="flex items-center gap-2 mb-3">
              {WALLET_ICON}
              <h2 className="text-lg font-medium text-slate-200">Wallet Status</h2>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-4xl font-normal text-slate-200">6</span>
                <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700/70 border border-slate-600/50">
                  Active Wallets
                </span>
              </div>
              <div className="w-[28%] min-w-[70px] h-11 shrink-0 self-center">
                {WALLET_STATUS_CHART}
              </div>
            </div>
            <p className="text-base text-slate-300 mt-2">Status: <span className="font-medium" style={{ color: "#32BB1D" }}>Safe</span></p>
            <div className="mt-auto pt-4 flex justify-between items-center gap-4">
              <p className="text-sm text-slate-500">Last Scan: 2 hrs ago</p>
              <Link
                href="/guard"
                className="rounded-lg font-bold text-white py-3 px-6 transition text-center inline-block min-w-[200px]"
                style={{ background: "linear-gradient(to bottom, #5b7cff 0%, #4066FF 35%, #0026FF 70%, #001a99 100%)", boxShadow: "0 2px 10px rgba(0,38,255,0.4)" }}
              >
                Run Full Scan
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`${CARD_STYLE} min-h-[200px] flex flex-col`} style={CARD_BG}>
            <div className="flex items-center gap-2 mb-3">
              {CHART_ICON}
              <h2 className="text-lg font-medium text-slate-200">Recent Activity</h2>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-4xl font-normal text-slate-200">12</span>
                <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700/70 border border-slate-600/50">
                  Transactions (24h)
                </span>
              </div>
              <div className="w-[28%] min-w-[70px] h-11 shrink-0 self-center">
                {WALLET_STATUS_CHART}
              </div>
            </div>
            <p className="text-base text-slate-300 mt-2">Contract Calls: 7 · Suspicious Events: 2</p>
            <div className="mt-auto pt-4">
              <p className="text-sm text-slate-500">Last Scan: 2 hrs ago</p>
            </div>
          </div>
        </div>

        {/* Col 2 */}
        <div className="space-y-4">
          {/* Active Alerts */}
          <div className={`${CARD_STYLE} min-h-[200px] flex flex-col`} style={CARD_BG}>
            <div className="flex items-center gap-2 mb-3">
              {ALERT_ICON}
              <h2 className="text-lg font-medium text-slate-200">Active Alerts</h2>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-4xl font-normal text-slate-200">7</span>
                <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700/70 border border-slate-600/50">
                  Total risks alert
                </span>
              </div>
              <div className="w-[28%] min-w-[70px] h-11 shrink-0 self-center">
                {WALLET_STATUS_CHART}
              </div>
            </div>
            <div className="text-base mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium" style={{ color: "#F00500" }}>1 High risk</span>
              <span className="text-slate-500 shrink-0" aria-hidden>|</span>
              <span className="text-amber-500 font-medium">2 Medium risk</span>
              <span className="text-slate-500 shrink-0" aria-hidden>|</span>
              <span className="text-[#32BB1D] font-medium">4 Low risk</span>
            </div>
            <div className="mt-auto pt-4">
              <p className="text-sm text-slate-500">Last Scan: 2 hrs ago</p>
            </div>
          </div>

          {/* Connected Wallets & dApps */}
          <div className={`${CARD_STYLE} min-h-[200px] flex flex-col`} style={CARD_BG}>
            <div className="flex items-center gap-2 mb-3">
              {WALLET_ICON}
              <h2 className="text-lg font-medium text-slate-200">Connected Wallets & dApps</h2>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-4xl font-normal text-slate-200">4</span>
                <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700/70 border border-slate-600/50">
                  Total risks level
                </span>
              </div>
              <div className="w-[28%] min-w-[70px] h-11 shrink-0 self-center">
                {WALLET_STATUS_CHART}
              </div>
            </div>
            <p className="text-base text-slate-300 mt-2">High-Risk Connections: 1 · Active dApps: 6</p>
            <div className="mt-auto pt-4">
              <p className="text-sm text-slate-500">Last Scan: 2 hrs ago</p>
            </div>
          </div>
        </div>

        {/* Col 3 - Activity Timeline */}
        <div className={`${CARD_STYLE} xl:row-span-2 min-h-[320px]`} style={CARD_BG}>
          <div className="flex items-center gap-2 mb-4">
            {CLOCK_ICON}
            <h2 className="text-lg font-medium text-slate-200">Activity Timeline</h2>
          </div>
          <ul className="space-y-3 flex-1">
            {TIMELINE_EVENTS.map((e, i) => (
              <li key={i} className="rounded-xl overflow-hidden flex" style={{ backgroundColor: "#25283D" }}>
                <span className="w-1 shrink-0 bg-[#0026FF]" aria-hidden />
                <div className="flex-1 min-w-0 py-3 pl-4 pr-4 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-white">{e.title}</p>
                    <p className="text-xs text-white shrink-0" style={{ fontFamily: "'Satoshi', sans-serif" }}>{e.time}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{e.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-3.5 transition"
          >
            Download Incident Report
          </button>
        </div>
      </div>

      {/* Bottom row: Live activity feed (left) + Connected Wallets list (right) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        {/* Live activity feed */}
        <div className={`${CARD_STYLE} flex-col min-h-[480px]`} style={CARD_BG}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              {CHART_ICON}
              <h2 className="text-lg font-medium text-slate-200">Live activity feed</h2>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <div className="relative w-full max-w-[200px] min-w-[120px]">
                <input
                  type="search"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border bg-[#25283D] border-[#25283D] text-white text-sm placeholder:text-slate-500 pl-4 pr-10 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="relative shrink-0">
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="rounded-lg border bg-[#25283D] border-[#25283D] text-white text-sm font-medium pl-3 pr-8 py-2.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-500 min-w-[7rem]"
                >
                  <option value="All">All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <button type="button" className="rounded-lg border border-slate-600/60 bg-[#25283D] text-slate-400 hover:text-white p-2.5 transition shrink-0" aria-label="Filter options">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1 min-h-0 rounded-lg">
            <table className="w-full text-sm border-separate" style={{ borderSpacing: "0 8px" }}>
              <thead style={{ backgroundColor: "#25283D" }} className="sticky top-0 z-10">
                <tr className="text-slate-300">
                  <th className="text-left py-3 px-4 font-medium rounded-tl-lg rounded-bl-lg whitespace-nowrap">Time</th>
                  <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Wallet</th>
                  <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Type</th>
                  <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Asset & Amount</th>
                  <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Counterparty/dApp</th>
                  <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Risk Level</th>
                  <th className="text-left py-3 px-4 font-medium rounded-tr-lg rounded-br-lg whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITY_ROWS.map((row, i) => (
                  <tr key={i} className="text-slate-300 hover:bg-slate-700/20 transition-colors bg-[#25283D]/50 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
                    <td className="py-3 px-4 text-slate-200 whitespace-nowrap" style={{ fontFamily: "'Satoshi', sans-serif" }}>{row.time}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{row.wallet}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{row.type}</td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-white">{row.assetAmount}</td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">{row.counterparty}</td>
                    <td className="py-3 px-4 whitespace-nowrap"><span className={`font-medium ${RISK_CLASS[row.risk]}`}>{row.risk}</span></td>
                    <td className="py-3 px-4 whitespace-nowrap"><span className={STATUS_CLASS[row.status]}>{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-700/50">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white bg-[#25283D] border border-slate-600/50 hover:border-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
              ← Prev 10
            </button>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <button type="button" onClick={() => setPage(1)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === 1 ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}>1</button>
              <span className="px-1 text-slate-500">...</span>
              {[11, 12, 13].map((n) => (
                <button key={n} type="button" onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === n ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}>{n}</button>
              ))}
              <span className="px-1 text-slate-500">...</span>
              {[14, 15, 16, 17, 18, 19, 20].map((n) => (
                <button key={n} type="button" onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === n ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}>{n}</button>
              ))}
              <span className="px-1 text-slate-500">...</span>
              <button type="button" onClick={() => setPage(totalPages)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === totalPages ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}>{totalPages}</button>
            </div>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white bg-[#25283D] border border-slate-600/50 hover:border-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
              Next 10 →
            </button>
          </div>
        </div>

        {/* Connected Wallets / dApps list */}
        <div className={`${CARD_STYLE} min-h-[320px]`} style={CARD_BG}>
          <div className="flex rounded-lg p-1 bg-[#25283D] border border-slate-700/50 mb-4">
            <button type="button" onClick={() => setConnectedTab("wallet")} className={`flex-1 rounded-md py-2 text-sm font-medium transition ${connectedTab === "wallet" ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white"}`}>
              Connected wallet
            </button>
            <button type="button" onClick={() => setConnectedTab("dapps")} className={`flex-1 rounded-md py-2 text-sm font-medium transition ${connectedTab === "dapps" ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white"}`}>
              Connected dApps
            </button>
          </div>
          {connectedTab === "wallet" && (
            <ul className="space-y-3 overflow-y-auto">
              {CONNECTED_WALLETS.map((w, i) => (
                <li key={i} className="rounded-2xl p-4 bg-[#2C2C34] flex flex-col gap-4">
                  {/* Top: wallet id (left) + network & status (right) */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-2 shrink-0 overflow-hidden">
                        <Image src={w.icon} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">{w.name}</p>
                        <p className="text-xs text-slate-400 font-mono truncate mt-0.5">{w.address}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">{w.network}</p>
                      <p className={`text-xs mt-0.5 ${w.statusColor}`}>{w.status}</p>
                    </div>
                  </div>
                  {/* Middle: Security Level + Last Activity in one row */}
                  <div className="flex flex-nowrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 shrink-0">
                      Security Level: <span className={`font-medium ${w.securityColor}`}>{w.security}</span>
                    </span>
                    <span className="text-slate-500 shrink-0">
                      Last Activity: <span className="text-slate-500">{w.lastActivity}</span>
                    </span>
                  </div>
                  {/* Bottom: View Wallet button */}
                  <button
                    type="button"
                    className="w-full rounded-xl py-3 text-sm font-medium text-white bg-[#3A3A42] hover:bg-[#44444e] transition"
                  >
                    View Wallet
                  </button>
                </li>
              ))}
            </ul>
          )}
          {connectedTab === "dapps" && (
            <ul className="space-y-3 overflow-y-auto">
              {CONNECTED_DAPPS.map((d, i) => (
                <li key={i} className="rounded-2xl p-4 bg-[#2C2C34] flex flex-col gap-3">
                  {/* Top: icon + name & subtitle (left) | assets & status (right) */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-2 shrink-0 overflow-hidden">
                        <Image src={d.icon} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">{d.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{d.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">{d.assets}</p>
                      <p className={`text-xs mt-0.5 ${d.statusColor}`}>{d.status}</p>
                    </div>
                  </div>
                  {/* Divider */}
                  <hr className="border-slate-600/60" />
                  {/* Connection details */}
                  <div className="flex flex-nowrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span>Connected Wallet: <span className="font-semibold text-slate-300">{d.connectedWallet}</span></span>
                    <span>Last Activity: <span className="font-semibold text-slate-300">{d.lastActivity}</span></span>
                  </div>
                  {/* View Wallet button */}
                  <button
                    type="button"
                    className="w-full rounded-xl py-3 text-sm font-medium text-white bg-[#3A3A42] hover:bg-[#44444e] transition"
                  >
                    View Wallet
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
