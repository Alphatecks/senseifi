"use client";

import React, { useMemo, useState } from "react";
import { useGuardSearch } from "@/context/GuardSearchContext";

const CARD_STYLE = "rounded-2xl border p-5 flex flex-col shadow-sm";
const CARD_BG = { backgroundColor: "#191D35", borderColor: "#191D35" };
/** Dashboard overview stat card gradient (from guard page) */
const STAT_CARD_CLASS = "rounded-xl flex flex-col bg-gradient-to-br from-blue-950 to-slate-900 p-5 min-h-[140px]";

const TRADE_ROWS = [
  { wallet: "MetaMask Wallet", network: "Ethereum", activity: "Contract Approval", risk: "High" as const, insight: "Approval matches known drain-pattern contracts interacting with flagged wallets.", time: "2hr ago" },
  { wallet: "Trust Wallet", network: "Binance Smart Chain", activity: "Token Transfer", risk: "Medium" as const, insight: "Transfer to a wallet associated with a high-risk project.", time: "1hr ago" },
  { wallet: "Coinbase Wallet", network: "Ethereum", activity: "Withdrawal", risk: "Critical" as const, insight: "Withdrawal to unverified addresses flagged for suspicious activity.", time: "30min ago" },
  { wallet: "Ledger Wallet", network: "Bitcoin", activity: "Transaction Confirmation", risk: "Medium" as const, insight: "Transaction confirmed on a blockchain with a history of hacks.", time: "15min ago" },
  { wallet: "Exodus Wallet", network: "Litecoin", activity: "Address Generation", risk: "High" as const, insight: "Generated addresses closely matching known scam patterns.", time: "5min ago" },
  { wallet: "Atomic Wallet", network: "Ripple", activity: "Deposit Alert", risk: "Critical" as const, insight: "High-value deposit to an account linked with fraudulent schemes.", time: "10min ago" },
  { wallet: "MyEtherWallet", network: "Ethereum Classic", activity: "Smart Contract Interaction", risk: "High" as const, insight: "Interaction with a contract flagged for vulnerabilities.", time: "1hr 30min" },
];

export default function ChromeExtensionPage() {
  const { query, setQuery } = useGuardSearch();
  const [days, setDays] = useState("7");

  const filteredTradeRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return TRADE_ROWS;
    return TRADE_ROWS.filter((row) =>
      `${row.wallet} ${row.network} ${row.activity} ${row.risk} ${row.insight} ${row.time}`.toLowerCase().includes(term)
    );
  }, [query]);

  return (
    <div className="rounded-2xl bg-blue-950/25 border border-blue-900/40 p-6 space-y-6">
      {/* Summary cards — icon style matches wallet security (boxed w-9 h-9) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={STAT_CARD_CLASS}>
          <span className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v1a2 2 0 01-2 2h-3a1 1 0 01-1-1v-4a1 1 0 00-1-1h-2a1 1 0 00-1 1v4a1 1 0 01-1 1H7a2 2 0 01-2-2v-1a1 1 0 00-1-1H4a2 2 0 010-4h1a1 1 0 001-1V7a1 1 0 011-1h3a2 2 0 012-2V4z" /></svg>
            </span>
            Active Extensions
          </span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-2xl font-bold text-white">3</span>
            <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium bg-[#2F4F2F] text-[#A0E0A0]">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
              +2.3%
            </span>
          </div>
          <span className="text-sm text-slate-400 mt-auto pt-4">This month</span>
        </div>
        <div className={STAT_CARD_CLASS}>
          <span className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </span>
            Contract Scanned
          </span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-2xl font-bold text-white">12</span>
            <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium bg-[#2F4F2F] text-[#A0E0A0]">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
              +2.3%
            </span>
          </div>
          <span className="text-sm text-slate-400 mt-auto pt-4">This month</span>
        </div>
        <div className={STAT_CARD_CLASS}>
          <span className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </span>
            Connected Wallet
          </span>
          <span className="text-2xl font-bold text-white mt-3">6</span>
          <span className="text-sm text-slate-400 mt-auto pt-4">This month</span>
        </div>
        <div className={STAT_CARD_CLASS}>
          <span className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </span>
            Unread Alerts
          </span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-2xl font-bold text-white">6</span>
            <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "rgba(240,5,0,0.2)", color: "#F00500" }}>
              <svg className="w-2.5 h-2.5 rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
              −2.3%
            </span>
          </div>
          <span className="text-sm text-slate-400 mt-1">This month</span>
          <span className="text-xs font-semibold text-amber-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden />
            1 high risk
          </span>
        </div>
      </section>

      {/* Trade insight */}
      <section className={`${CARD_STYLE}`} style={CARD_BG}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-base font-medium text-white flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </span>
            Trade insight
          </h2>
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div className="flex-1 min-w-[160px] flex items-center gap-2 rounded-lg bg-slate-800/80 border border-slate-700/50 px-3 py-2.5">
              <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth={2} /><path d="M21 21l-4.35-4.35" strokeWidth={2} /></svg>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none" />
            </div>
            <button type="button" className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition" aria-label="Filter">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
            </button>
            <select value={days} onChange={(e) => setDays(e.target.value)} className="rounded-lg bg-slate-800/80 border border-slate-700/50 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#4066FF]" aria-label="Time range">
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700/60">
                <th className="text-left py-3 px-4 font-semibold text-slate-400">Wallet / dApp</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-400">Network</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-400">Activity Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-400">Risk Level</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-400">AI Insight Shown</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTradeRows.map((row, i) => (
                <tr key={i} className="border-b border-slate-700/40 hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <span className="block font-semibold text-white">{row.wallet}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{row.network}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{row.network}</td>
                  <td className="py-3 px-4 text-slate-300">{row.activity}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase ${row.risk === "Critical" ? "text-red-600 bg-red-500/20" : row.risk === "High" ? "text-[#F00500] bg-[#F00500]/15" : "text-amber-500 bg-amber-500/15"}`}>
                      {row.risk}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-[220px] text-xs leading-snug">{row.insight}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
