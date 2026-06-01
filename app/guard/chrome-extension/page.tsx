"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useGuardSearch } from "@/context/GuardSearchContext";
import { useWallet } from "@/hooks/useWallet";
import {
  getExtensionOverview,
  getExtensionTradeInsights,
  type ExtensionOverviewData,
  type ExtensionTradeInsightItem,
} from "@/services/dashboardService";

import shieldIcon from "@/assets/icons/Shield.png";

const CARD_STYLE = "rounded-lg border p-5 flex flex-col shadow-sm";
const CARD_BG = { backgroundColor: "#191D35", borderColor: "#191D35" };
const STAT_CARD_CLASS = "rounded-lg flex flex-col bg-gradient-to-br from-blue-950 to-slate-900 p-5 min-h-[140px]";
const MOBILE_BLEED = "-mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)]";
const MOBILE_STAT_CARD =
  "rounded-lg border border-white/[0.06] p-3 min-h-[118px] flex flex-col bg-gradient-to-br from-blue-900/35 via-slate-900/95 to-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

const DEFAULT_EXTENSION_WALLET = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed";

type UiRiskLevel = "Critical" | "High" | "Medium" | "Low";

interface UiTradeRow {
  wallet: string;
  network: string;
  activity: string;
  risk: UiRiskLevel;
  insight: string;
  time: string;
  id: string;
  status: "Pending" | "Completed";
}

const FALLBACK_TRADE_ROWS: UiTradeRow[] = [
  {
    wallet: "Wallet",
    network: "—",
    activity: "Contract Approval",
    risk: "High",
    insight: "No live trade insights yet.",
    time: "—",
    id: "—",
    status: "Pending",
  },
];

function formatRelativeTime(value: string | undefined): string {
  if (!value) return "—";
  if (/min|hr|day|ago/i.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMins < 60) return `${diffMins}mins ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}hr ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function normalizeStatus(item: ExtensionTradeInsightItem): "Pending" | "Completed" {
  const statusRaw = String(item.status || "").toLowerCase();
  if (statusRaw.includes("pending") || statusRaw.includes("warn") || statusRaw.includes("processing")) {
    return "Pending";
  }
  const riskRaw = String(item.risk_level || item.risk_band || item.severity || "").toLowerCase();
  const scoreRaw = Number(item.risk_score ?? item.riskScore ?? item.score);
  if (riskRaw === "high" || riskRaw === "critical" || (Number.isFinite(scoreRaw) && scoreRaw >= 70)) {
    return "Pending";
  }
  return "Completed";
}

function normalizeRisk(item: ExtensionTradeInsightItem): UiRiskLevel {
  const raw = String(item.risk_level || item.risk_band || item.severity || "").toLowerCase();
  if (raw.includes("critical")) return "Critical";
  if (raw.includes("high")) return "High";
  if (raw.includes("medium")) return "Medium";
  if (raw.includes("low")) return "Low";
  const score = Number(item.risk_score ?? item.riskScore ?? item.score);
  if (Number.isFinite(score) && score >= 90) return "Critical";
  if (Number.isFinite(score) && score >= 70) return "High";
  if (Number.isFinite(score) && score >= 40) return "Medium";
  return "Low";
}

function toUiTradeRows(items: ExtensionTradeInsightItem[]): UiTradeRow[] {
  return items.map((item, idx) => ({
    wallet: item.wallet || item.wallet_address || "Wallet",
    network: "—",
    activity: item.title || item.type || item.action || item.event || "Activity",
    risk: normalizeRisk(item),
    insight: item.title || item.event || "SenseiGuard trade insight",
    time: formatRelativeTime(item.time || item.detected_at || item.created_at || item.updated_at),
    id:
      item.id ||
      item.tx_id ||
      item.tx_hash ||
      item.transaction_hash ||
      item.wallet_address ||
      `row-${idx}`,
    status: normalizeStatus(item),
  }));
}

function TrendUpBadge({ value = "+2.3%" }: { value?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#2F4F2F] text-[#A0E0A0">
      <span aria-hidden>↗</span>
      {value}
    </span>
  );
}

function TrendDownBadge({ value = "−2.3%" }: { value?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#F00500]/20 text-[#F00500]">
      <span aria-hidden>↘</span>
      {value}
    </span>
  );
}

function MobileStatIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 text-slate-400 shrink-0" aria-hidden>
      {children}
    </span>
  );
}

export default function ChromeExtensionPage() {
  const { activeAddress } = useWallet();
  const { query, setQuery } = useGuardSearch();
  const [days, setDays] = useState("7");
  const [riskLevel, setRiskLevel] = useState("high");
  const [tradePage, setTradePage] = useState(1);
  const [tradePerPage] = useState(10);
  const [overview, setOverview] = useState<ExtensionOverviewData | null>(null);
  const [tradeRows, setTradeRows] = useState<UiTradeRow[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingTradeRows, setLoadingTradeRows] = useState(false);
  const [mobileTradeExpanded, setMobileTradeExpanded] = useState(false);

  const effectiveWalletAddress = activeAddress || DEFAULT_EXTENSION_WALLET;
  const period = useMemo(() => `${days}d`, [days]);

  useEffect(() => {
    setTradePage(1);
  }, [effectiveWalletAddress, period, riskLevel, query]);

  useEffect(() => {
    let ignore = false;
    if (!effectiveWalletAddress) return;
    setLoadingOverview(true);
    getExtensionOverview(effectiveWalletAddress)
      .then((data) => {
        if (!ignore) setOverview(data);
      })
      .finally(() => {
        if (!ignore) setLoadingOverview(false);
      });
    return () => {
      ignore = true;
    };
  }, [effectiveWalletAddress]);

  useEffect(() => {
    let ignore = false;
    if (!effectiveWalletAddress) return;
    const timer = setTimeout(() => {
      setLoadingTradeRows(true);
      getExtensionTradeInsights({
        wallet_address: effectiveWalletAddress,
        page: tradePage,
        per_page: tradePerPage,
        period,
        risk_level: riskLevel,
        search: query.trim() || undefined,
      })
        .then((rows) => {
          if (!ignore) {
            const mapped = toUiTradeRows(rows);
            setTradeRows(mapped.length ? mapped : FALLBACK_TRADE_ROWS);
          }
        })
        .finally(() => {
          if (!ignore) setLoadingTradeRows(false);
        });
    }, 250);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [effectiveWalletAddress, tradePage, tradePerPage, period, riskLevel, query]);

  const visibleMobileTradeRows = mobileTradeExpanded ? tradeRows : tradeRows.slice(0, 5);
  const scansThisMonth = overview?.scans_this_month ?? 0;
  const unreadAlerts = overview?.unread_alerts ?? 0;
  const highRiskAlerts = overview?.high_risk_alerts ?? 0;
  const scansTrend = Number(overview?.scans_trend_percent ?? 0);
  const alertsTrend = Number(overview?.alerts_trend_percent ?? 0);
  const scansTrendLabel = `${scansTrend >= 0 ? "+" : ""}${scansTrend}%`;
  const alertsTrendLabel = `${alertsTrend >= 0 ? "+" : ""}${alertsTrend}%`;
  const connectedWalletCount = effectiveWalletAddress ? 1 : 0;

  return (
    <>
      {/* Mobile — extension side-menu mockup */}
      <div className={`lg:hidden flex flex-col gap-3.5 ${MOBILE_BLEED}`}>
        <section className="grid grid-cols-2 gap-2.5" aria-label="Overview">
          <article className={MOBILE_STAT_CARD}>
            <div className="flex items-center gap-1.5 min-h-[18px]">
              <MobileStatIcon>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </MobileStatIcon>
              <span className="text-[11px] font-medium text-white leading-tight">Active Extensions</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-[22px] font-medium text-white leading-none">3</span>
              <TrendUpBadge />
            </div>
            <span className="text-[10px] text-slate-400 mt-auto pt-2.5">This month</span>
          </article>

          <article className={MOBILE_STAT_CARD}>
            <div className="flex items-center gap-1.5 min-h-[18px]">
              <MobileStatIcon>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </MobileStatIcon>
              <span className="text-[11px] font-medium text-white leading-tight">Contract Scanned</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-[22px] font-medium text-white leading-none">{loadingOverview ? "…" : scansThisMonth}</span>
              {scansTrend >= 0 ? <TrendUpBadge value={scansTrendLabel} /> : <TrendDownBadge value={scansTrendLabel} />}
            </div>
            <span className="text-[10px] text-slate-400 mt-auto pt-2.5">This month</span>
          </article>

          <article className={MOBILE_STAT_CARD}>
            <div className="flex items-center gap-1.5 min-h-[18px]">
              <MobileStatIcon>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </MobileStatIcon>
              <span className="text-[11px] font-medium text-white leading-tight">Connected wallet</span>
            </div>
            <span className="text-[22px] font-medium text-white leading-none mt-2">{connectedWalletCount}</span>
            <span className="text-[10px] text-slate-400 mt-auto pt-2.5">This month</span>
          </article>

          <article className={MOBILE_STAT_CARD}>
            <div className="flex items-center gap-1.5 min-h-[18px]">
              <MobileStatIcon>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </MobileStatIcon>
              <span className="text-[11px] font-medium text-white leading-tight">Unread Alerts</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-[22px] font-medium text-white leading-none">{loadingOverview ? "…" : unreadAlerts}</span>
              {alertsTrend <= 0 ? <TrendDownBadge value={alertsTrendLabel} /> : <TrendUpBadge value={alertsTrendLabel} />}
            </div>
            <span className="text-[10px] text-slate-400 pt-1">This month</span>
            {highRiskAlerts > 0 ? (
              <span className="text-[10px] font-semibold text-amber-500 mt-1.5 flex items-center gap-1.5">
                <span aria-hidden>⚠</span>
                {highRiskAlerts} high risk
              </span>
            ) : null}
          </article>
        </section>

        <section
          className="rounded-lg px-3.5 pt-3.5 pb-1.5 border border-white/[0.05]"
          style={{ backgroundColor: "#191D35" }}
          aria-label="Trade insight"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-700/75 border border-slate-600/45 shrink-0">
                <Image src={shieldIcon} alt="" width={16} height={16} className="object-contain" />
              </span>
              <h2 className="text-sm font-medium text-white">Trade insight</h2>
            </div>
            <button
              type="button"
              onClick={() => setMobileTradeExpanded((prev) => !prev)}
              className="text-xs font-semibold text-[#4066FF] hover:text-[#5b7cff] hover:underline shrink-0"
            >
              {mobileTradeExpanded ? "See Less" : "See More"}
            </button>
          </div>

          <ul className="list-none m-0 p-0">
            {loadingTradeRows && (
              <li className="py-3 text-[12px] text-slate-400">Loading trade insights…</li>
            )}
            {visibleMobileTradeRows.map((row, i) => (
              <li
                key={`${row.id}-${i}`}
                className={`flex items-start justify-between gap-3 py-3 ${i > 0 ? "border-t border-slate-600/30" : ""}`}
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-white m-0">{row.activity}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 m-0">{row.id}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-xs font-semibold m-0 ${
                      row.status === "Pending" ? "text-amber-500" : "text-[#32BB1D]"
                    }`}
                  >
                    {row.status}
                  </p>
                  <p className="text-[11px] text-white mt-0.5 m-0">{row.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block rounded-lg bg-blue-950/25 border border-blue-900/40 p-6 space-y-6">
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
              <span className="text-2xl font-bold text-white">{loadingOverview ? "…" : scansThisMonth}</span>
              <span
                className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium ${
                  scansTrend >= 0 ? "bg-[#2F4F2F] text-[#A0E0A0]" : "bg-[#F00500]/20 text-[#F00500]"
                }`}
              >
                <svg className={`w-2.5 h-2.5 ${scansTrend < 0 ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
                {scansTrendLabel}
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
            <span className="text-2xl font-bold text-white mt-3">{connectedWalletCount}</span>
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
              <span className="text-2xl font-bold text-white">{loadingOverview ? "…" : unreadAlerts}</span>
              <span
                className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium ${
                  alertsTrend <= 0 ? "bg-[#F00500]/20 text-[#F00500]" : "bg-[#2F4F2F] text-[#A0E0A0]"
                }`}
              >
                <svg className={`w-2.5 h-2.5 ${alertsTrend <= 0 ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
                {alertsTrendLabel}
              </span>
            </div>
            <span className="text-sm text-slate-400 mt-1">This month</span>
            {highRiskAlerts > 0 ? (
              <span className="text-xs font-semibold text-amber-500 mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden />
                {highRiskAlerts} high risk
              </span>
            ) : null}
          </div>
        </section>

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
              <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)} className="rounded-lg bg-slate-800/80 border border-slate-700/50 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#4066FF]" aria-label="Risk level">
                <option value="high">High risk</option>
                <option value="medium">Medium risk</option>
                <option value="low">Low risk</option>
                <option value="">All risks</option>
              </select>
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
                {loadingTradeRows ? (
                  <tr>
                    <td className="py-6 px-4 text-slate-400" colSpan={6}>Loading trade insights…</td>
                  </tr>
                ) : tradeRows.map((row, i) => (
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
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setTradePage((p) => Math.max(1, p - 1))}
              disabled={tradePage <= 1 || loadingTradeRows}
              className="px-3 py-1.5 text-xs rounded border border-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400">Page {tradePage}</span>
            <button
              type="button"
              onClick={() => setTradePage((p) => p + 1)}
              disabled={loadingTradeRows || tradeRows.length < tradePerPage}
              className="px-3 py-1.5 text-xs rounded border border-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
