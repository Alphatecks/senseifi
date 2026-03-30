"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

import { getDashboardOverview, getActivityFeed, getActivityMonitorWallets, getActivityMonitorDapps } from "@/services/dashboardService";
import type { DashboardOverviewData, ActivityFeedItem, ActivityFeedPagination, ActivityMonitorWalletItem, ActivityMonitorDappItem } from "@/services/dashboardService";
import { useDashboardUser } from "@/context/DashboardUserContext";
import { useRescanModal } from "@/context/RescanModalContext";
import { useWallet } from "@/hooks/useWallet";

function formatOverviewTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHrs < 24) return `${diffHrs} hr${diffHrs !== 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return d.toLocaleDateString();
}

function formatTimelineTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatFeedTimeShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHrs < 24) return `${diffHrs}hr${diffHrs !== 1 ? "s" : ""}`;
  if (diffDays < 30) return `${diffDays}day${diffDays !== 1 ? "s" : ""}`;
  return d.toLocaleDateString();
}

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

/** Wallet type to logo URL for activity monitor connected wallets */
const WALLET_TYPE_LOGO: Record<string, string> = {
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  "trust wallet": "https://trustwallet.com/assets/images/media/assets/TWT.png",
  coinbase: "https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Product_Wallet.svg",
  rabby: "https://rabby.io/assets/images/logo-128.png",
  phantom: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/phantom.svg",
  "wallet connect": "https://cdn.jsdelivr.net/gh/WalletConnect/walletconnect-assets@master/Logo/Blue%20(Default)/Logo.svg",
};
function getWalletTypeLogoUrl(walletTypeDisplay: string): string {
  const key = (walletTypeDisplay || "").toLowerCase().trim();
  return WALLET_TYPE_LOGO[key] ?? "/images/icons/wallet-header.png";
}

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

type RiskLevel = "Low" | "Medium" | "High";
type StatusType = "Completed" | "Pending" | "Failed";

function formatFeedTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

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

const FEED_POLL_MS = 10000;
const FEED_PER_PAGE = 10;

export default function ActivityMonitorPage() {
  const { address } = useWallet();
  const { dashboardUser } = useDashboardUser();
  const { openRescanModal } = useRescanModal();
  const [search, setSearch] = useState("");
  const [connectedWalletsList, setConnectedWalletsList] = useState<ActivityMonitorWalletItem[] | null>(null);
  const [connectedWalletsLoading, setConnectedWalletsLoading] = useState(false);
  const [connectedDappsList, setConnectedDappsList] = useState<ActivityMonitorDappItem[] | null>(null);
  const [connectedDappsLoading, setConnectedDappsLoading] = useState(false);
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [feedPage, setFeedPage] = useState(1);
  const [feedData, setFeedData] = useState<ActivityFeedItem[]>([]);
  const [feedPagination, setFeedPagination] = useState<ActivityFeedPagination | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const [connectedTab, setConnectedTab] = useState<"wallet" | "dapps">("wallet");
  const [overview, setOverview] = useState<DashboardOverviewData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [liveFeedFullOpen, setLiveFeedFullOpen] = useState(false);
  const [liveFeedSearch, setLiveFeedSearch] = useState("");

  useEffect(() => {
    setOverviewLoading(true);
    getDashboardOverview(20)
      .then((data) => setOverview(data ?? null))
      .finally(() => setOverviewLoading(false));
  }, []);

  const activityMonitorParams = { user_id: dashboardUser?.user_id ?? undefined, wallet_address: address ?? undefined };

  useEffect(() => {
    if (connectedTab !== "wallet") return;
    setConnectedWalletsLoading(true);
    getActivityMonitorWallets(activityMonitorParams)
      .then((data) => setConnectedWalletsList(data ?? null))
      .finally(() => setConnectedWalletsLoading(false));
  }, [connectedTab, dashboardUser?.user_id, address]);

  useEffect(() => {
    if (connectedTab !== "dapps") return;
    setConnectedDappsLoading(true);
    getActivityMonitorDapps(activityMonitorParams)
      .then((data) => setConnectedDappsList(data ?? null))
      .finally(() => setConnectedDappsLoading(false));
  }, [connectedTab, dashboardUser?.user_id, address]);

  const fetchFeed = useCallback(() => {
    const userId = dashboardUser?.user_id;
    if (!userId) {
      setFeedData([]);
      setFeedPagination(null);
      return;
    }
    setFeedLoading(true);
    getActivityFeed(userId, feedPage, FEED_PER_PAGE)
      .then((res) => {
        if (res) {
          setFeedData(res.data);
          setFeedPagination(res.pagination);
        } else {
          setFeedData([]);
          setFeedPagination(null);
        }
      })
      .finally(() => setFeedLoading(false));
  }, [dashboardUser?.user_id, feedPage]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    if (!dashboardUser?.user_id) return;
    const interval = setInterval(fetchFeed, FEED_POLL_MS);
    return () => clearInterval(interval);
  }, [dashboardUser?.user_id, fetchFeed]);

  const feedTotalPages = feedPagination ? Math.max(1, Math.ceil(feedPagination.total / feedPagination.per_page)) : 1;

  const smallChart = (
    <svg className="w-full h-8" viewBox="0 0 120 32" preserveAspectRatio="none">
      <path fill="rgba(64,102,255,0.2)" d="M0,18 C12,8 20,24 30,14 C40,4 50,22 60,12 C70,2 78,20 90,10 C100,22 108,6 120,16 L120,32 L0,32 Z" />
      <path fill="none" stroke="#4066FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d="M0,18 C12,8 20,24 30,14 C40,4 50,22 60,12 C70,2 78,20 90,10 C100,22 108,6 120,16" />
    </svg>
  );

  const smallIcon = (icon: React.ReactNode) => (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-700/80 border border-slate-600/60 shrink-0">
      {icon}
    </span>
  );

  const filteredFeedForFull = liveFeedSearch.trim()
    ? feedData.filter((row) => `${row.wallet} ${row.type}`.toLowerCase().includes(liveFeedSearch.trim().toLowerCase()))
    : feedData;

  return (
    <>
    <div className="rounded-none lg:rounded-2xl bg-transparent lg:bg-blue-950/25 border-0 lg:border border-blue-900/40 p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Mobile: 2x2 grid */}
      <div className="xl:hidden grid grid-cols-2 gap-2 sm:gap-3 -mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)]">
        {/* Wallet Status */}
        <div className={`rounded-xl border p-3 flex flex-col min-h-0`} style={CARD_BG}>
          <div className="flex items-center gap-1.5 mb-2">
            {smallIcon(<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>)}
            <h2 className="text-xs font-medium text-slate-200 truncate">Wallet Status</h2>
          </div>
          {overviewLoading ? (
            <p className="text-slate-500 text-[10px] py-1">Loading…</p>
          ) : overview?.wallet_status ? (
            <>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-normal text-slate-200">{overview.wallet_status.active_wallet_count}</span>
                  <span className="text-[10px] text-slate-400">Active Wallets</span>
                </div>
                <div className="w-[32%] h-8 shrink-0">{smallChart}</div>
              </div>
              <p className="text-[10px] mt-1">Status: <span className="font-medium capitalize" style={{ color: overview.wallet_status.status === "safe" ? "#32BB1D" : overview.wallet_status.status === "warning" ? "#f59e0b" : "#F00500" }}>{overview.wallet_status.status}</span></p>
              <p className="text-[10px] text-slate-500 mt-1">Last Scan: {formatOverviewTime(overview.wallet_status.last_scan_at)}</p>
              <button type="button" onClick={openRescanModal} className="mt-2 rounded-lg text-white text-[10px] font-semibold py-2 px-3 w-full transition" style={{ background: "linear-gradient(to bottom, #5b7cff 0%, #4066FF 50%, #0026FF 100%)" }}>Run Full Scan</button>
            </>
          ) : (
            <p className="text-slate-500 text-[10px] py-1">No data</p>
          )}
        </div>

        {/* Active Alerts */}
        <div className={`rounded-xl border p-3 flex flex-col min-h-0`} style={CARD_BG}>
          <div className="flex items-center gap-1.5 mb-2">
            {smallIcon(<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>)}
            <h2 className="text-xs font-medium text-slate-200 truncate">Active Alerts</h2>
          </div>
          {overviewLoading ? (
            <p className="text-slate-500 text-[10px] py-1">Loading…</p>
          ) : overview?.active_alerts ? (
            <>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-normal text-slate-200">{overview.active_alerts.total}</span>
                  <span className="text-[10px] text-slate-400">Total risks alert</span>
                </div>
                <div className="w-[32%] h-8 shrink-0">{smallChart}</div>
              </div>
              <div className="text-[10px] mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                <span className="font-medium" style={{ color: "#F00500" }}>{overview.active_alerts.high} High</span>
                <span className="text-amber-500 font-medium">{overview.active_alerts.medium} Medium</span>
                <span className="text-[#32BB1D] font-medium">{overview.active_alerts.low} Low</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{overview.wallet_status ? `Last Scan: ${formatOverviewTime(overview.wallet_status.last_scan_at)}` : ""}</p>
            </>
          ) : (
            <p className="text-slate-500 text-[10px] py-1">No data</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className={`rounded-xl border p-3 flex flex-col min-h-0`} style={CARD_BG}>
          <div className="flex items-center gap-1.5 mb-2">
            {smallIcon(<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>)}
            <h2 className="text-xs font-medium text-slate-200 truncate">Recent Activity</h2>
          </div>
          {overviewLoading ? (
            <p className="text-slate-500 text-[10px] py-1">Loading…</p>
          ) : overview?.recent_activity ? (
            <>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-normal text-slate-200">{overview.recent_activity.transactions_24h}</span>
                  <span className="text-[10px] text-slate-400">Transactions (24h)</span>
                </div>
                <div className="w-[32%] h-8 shrink-0">{smallChart}</div>
              </div>
              <p className="text-[10px] text-slate-300 mt-1">Contract Calls: {overview.recent_activity.contract_calls_24h} · Suspicious: {overview.recent_activity.suspicious_events_24h}</p>
              <p className="text-[10px] text-slate-500 mt-1">{overview.wallet_status ? `Last Scan: ${formatOverviewTime(overview.wallet_status.last_scan_at)}` : ""}</p>
            </>
          ) : (
            <p className="text-slate-500 text-[10px] py-1">No data</p>
          )}
        </div>

        {/* Connected Wallets & dApps */}
        <div className={`rounded-xl border p-3 flex flex-col min-h-0`} style={CARD_BG}>
          <div className="flex items-center gap-1.5 mb-2">
            {smallIcon(<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>)}
            <h2 className="text-xs font-medium text-slate-200 truncate">Connected W&dApps</h2>
          </div>
          {overviewLoading ? (
            <p className="text-slate-500 text-[10px] py-1">Loading…</p>
          ) : overview?.connected_risk ? (
            <>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-normal text-slate-200">{overview.connected_risk.total_risk_items}</span>
                  <span className="text-[10px] text-slate-400">Total risks level</span>
                </div>
                <div className="w-[32%] h-8 shrink-0">{smallChart}</div>
              </div>
              <p className="text-[10px] text-slate-300 mt-1">High-Risk: {overview.connected_risk.high_risk_connections} · dApps: {overview.connected_risk.active_dapps}</p>
              <p className="text-[10px] text-slate-500 mt-1">{overview.wallet_status ? `Last Scan: ${formatOverviewTime(overview.wallet_status.last_scan_at)}` : ""}</p>
            </>
          ) : (
            <p className="text-slate-500 text-[10px] py-1">No data</p>
          )}
        </div>
      </div>

      {/* Mobile: Quick actions + Activity Timeline + Download button (below 4 cards) */}
      <div className="xl:hidden space-y-4 -mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)]">
        {/* Quick actions */}
        <div className="rounded-xl border p-4 flex flex-col" style={CARD_BG}>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <h2 className="text-sm font-semibold text-white">Quick actions</h2>
          </div>
          <p className="text-xs text-slate-500 mt-3">No quick actions available</p>
        </div>

        {/* Activity Timeline */}
        <div className="rounded-xl border p-4 flex flex-col" style={CARD_BG}>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h2 className="text-sm font-semibold text-white">Activity Timeline</h2>
          </div>
          {overviewLoading ? (
            <p className="text-slate-500 text-xs py-2">Loading…</p>
          ) : overview?.activity_timeline?.length ? (
            <ul className="space-y-2">
              {overview.activity_timeline.map((e) => (
                <li key={e.id} className="flex rounded-lg overflow-hidden" style={{ backgroundColor: "#25283D" }}>
                  <span className="w-1 shrink-0 bg-[#4066FF]" aria-hidden />
                  <div className="flex-1 min-w-0 py-3 pl-3 pr-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                    <div>
                      <p className="text-sm font-bold text-white">{e.title}</p>
                      {e.description && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{e.description}</p>}
                    </div>
                    <p className="text-xs text-slate-400 shrink-0">{formatTimelineTime(e.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-xs py-4">No timeline events</p>
          )}
        </div>

        {/* Live activity feed */}
        <div className="rounded-xl border p-4 flex flex-col" style={CARD_BG}>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              <h2 className="text-sm font-semibold text-white">Live activity feed</h2>
            </div>
            <button type="button" onClick={() => setLiveFeedFullOpen(true)} className="text-xs font-medium text-[#4066FF] hover:underline shrink-0">
              See More
            </button>
          </div>
          {feedLoading && feedData.length === 0 ? (
            <p className="text-slate-500 text-xs py-4 text-center">Loading…</p>
          ) : !dashboardUser?.user_id ? (
            <p className="text-slate-500 text-xs py-4 text-center">Connect your wallet to see activity.</p>
          ) : feedData.length === 0 ? (
            <p className="text-slate-500 text-xs py-4 text-center">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-slate-700/60">
              {feedData.slice(0, 5).map((row) => {
                const riskLabel = capitalizeFirst(row.risk_level);
                const riskClass = riskLabel === "Low" ? "text-[#32BB1D]" : riskLabel === "Medium" ? "text-amber-500" : "text-[#F00500]";
                return (
                  <li key={row.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{row.wallet}</p>
                      <p className="text-xs text-slate-400 truncate">{row.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-medium ${riskClass}`}>{riskLabel}</p>
                      <p className="text-xs text-slate-400">{formatFeedTimeShort(row.time)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Connected wallet / Connected dApps */}
        <div className="rounded-xl border p-4 flex flex-col" style={CARD_BG}>
          <div className="flex rounded-lg p-1 bg-[#25283D] border border-slate-700/50 mb-4">
            <button type="button" onClick={() => setConnectedTab("wallet")} className={`flex-1 rounded-md py-2 text-xs sm:text-sm font-medium transition ${connectedTab === "wallet" ? "bg-[#4066FF] text-white" : "text-slate-400 hover:text-white"}`}>
              Connected wallet
            </button>
            <button type="button" onClick={() => setConnectedTab("dapps")} className={`flex-1 rounded-md py-2 text-xs sm:text-sm font-medium transition ${connectedTab === "dapps" ? "bg-[#4066FF] text-white" : "text-slate-400 hover:text-white"}`}>
              Connected dApps
            </button>
          </div>
          {connectedTab === "wallet" && (
            <ul className="space-y-3">
              {connectedWalletsLoading ? (
                <li className="py-6 text-center text-slate-400 text-xs">Loading…</li>
              ) : !connectedWalletsList?.length ? (
                <li className="py-6 text-center text-slate-400 text-xs">No connected wallets</li>
              ) : (
                connectedWalletsList.map((w) => {
                  const securityLower = (w.security_level || "").toLowerCase();
                  const securityColor = securityLower === "safe" ? "text-[#32BB1D]" : securityLower === "moderate" ? "text-amber-500" : "text-[#F00500]";
                  const statusColor = (w.status || "").toLowerCase() === "active" ? "text-[#32BB1D]" : "text-slate-400";
                  return (
                    <li key={w.address} className="rounded-xl p-3 flex flex-col gap-2.5" style={{ backgroundColor: "#25283D" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                            <Image src={getWalletTypeLogoUrl(w.wallet_type_display)} alt="" width={24} height={24} className="w-6 h-6 object-contain" unoptimized />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">{w.wallet_type_display}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{shortenAddress(w.address)}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-white">{w.chain_name}</p>
                          <p className={`text-[10px] mt-0.5 ${statusColor}`}>{w.status}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] text-slate-400">
                        <span>Security Level: <span className={`font-medium ${securityColor}`}>{w.security_level}</span></span>
                        <span>Last Activity: <span className="text-slate-400">{w.last_activity}</span></span>
                      </div>
                      <button type="button" className="w-full rounded-lg py-2.5 text-xs font-medium text-white transition" style={{ backgroundColor: "#3A3A42" }}>
                        View Wallet
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}
          {connectedTab === "dapps" && (
            <ul className="space-y-3">
              {connectedDappsLoading ? (
                <li className="py-6 text-center text-slate-400 text-xs">Loading…</li>
              ) : !connectedDappsList?.length ? (
                <li className="py-6 text-center text-slate-400 text-xs">No connected dApps</li>
              ) : (
                connectedDappsList.map((d, i) => {
                  const statusColor = (d.status || "").toLowerCase() === "active" ? "text-[#32BB1D]" : "text-slate-400";
                  return (
                    <li key={d.dapp_name + d.connected_wallet_address + i} className="rounded-xl p-3 flex flex-col gap-2.5" style={{ backgroundColor: "#25283D" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-9 h-9 rounded-full bg-slate-600/60 flex items-center justify-center shrink-0 text-white font-bold text-xs">
                            {d.dapp_name?.charAt(0) ?? "?"}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">{d.dapp_name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{d.description}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-white">{d.tokens}</p>
                          <p className={`text-[10px] mt-0.5 ${statusColor}`}>{d.status}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] text-slate-400">
                        <span>Wallet: <span className="font-mono text-slate-300">{shortenAddress(d.connected_wallet_address)}</span></span>
                        <span>Last Activity: <span className="text-slate-400">{d.last_activity}</span></span>
                      </div>
                      <button type="button" className="w-full rounded-lg py-2.5 text-xs font-medium text-white transition" style={{ backgroundColor: "#3A3A42" }}>
                        View Wallet
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>

        {/* Download Incident Report */}
        <button
          type="button"
          className="w-full rounded-xl bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-3.5 transition"
        >
          Download Incident Report
        </button>
      </div>

      {/* Desktop: Top + middle grid: Wallet Status, Active Alerts, Activity Timeline | Recent Activity, Connected W&dApps */}
      <div className="hidden xl:grid grid-cols-3 gap-4">
        {/* Col 1 */}
        <div className="space-y-4">
          {/* Wallet Status - from API */}
          <div className={`${CARD_STYLE} min-h-[200px] flex flex-col`} style={CARD_BG}>
            <div className="flex items-center gap-2 mb-3">
              {WALLET_ICON}
              <h2 className="text-lg font-medium text-slate-200">Wallet Status</h2>
            </div>
            {overviewLoading ? (
              <p className="text-slate-400 text-sm py-4">Loading…</p>
            ) : overview?.wallet_status ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-4xl font-normal text-slate-200">{overview.wallet_status.active_wallet_count}</span>
                    <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700/70 border border-slate-600/50">
                      Active Wallets
                    </span>
                  </div>
                  <div className="w-[28%] min-w-[70px] h-11 shrink-0 self-center">
                    {WALLET_STATUS_CHART}
                  </div>
                </div>
                <p className="text-base text-slate-300 mt-2">Status: <span className="font-medium capitalize" style={{ color: overview.wallet_status.status === "safe" ? "#32BB1D" : overview.wallet_status.status === "warning" ? "#f59e0b" : "#F00500" }}>{overview.wallet_status.status}</span></p>
                <div className="mt-auto pt-4 flex justify-between items-center gap-4">
                  <p className="text-sm text-slate-500">Last Scan: {formatOverviewTime(overview.wallet_status.last_scan_at)}</p>
                  <button
                    type="button"
                    onClick={openRescanModal}
                    className="rounded-lg font-bold text-white py-3 px-6 transition text-center inline-block min-w-[200px]"
                    style={{ background: "linear-gradient(to bottom, #5b7cff 0%, #4066FF 35%, #0026FF 70%, #001a99 100%)", boxShadow: "0 2px 10px rgba(0,38,255,0.4)" }}
                  >
                    Run Full Scan
                  </button>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm py-4">No wallet status data</p>
            )}
          </div>

          {/* Recent Activity - from API */}
          <div className={`${CARD_STYLE} min-h-[200px] flex flex-col`} style={CARD_BG}>
            <div className="flex items-center gap-2 mb-3">
              {CHART_ICON}
              <h2 className="text-lg font-medium text-slate-200">Recent Activity</h2>
            </div>
            {overviewLoading ? (
              <p className="text-slate-400 text-sm py-4">Loading…</p>
            ) : overview?.recent_activity ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-4xl font-normal text-slate-200">{overview.recent_activity.transactions_24h}</span>
                    <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700/70 border border-slate-600/50">
                      Transactions (24h)
                    </span>
                  </div>
                  <div className="w-[28%] min-w-[70px] h-11 shrink-0 self-center">
                    {WALLET_STATUS_CHART}
                  </div>
                </div>
                <p className="text-base text-slate-300 mt-2">Contract Calls: {overview.recent_activity.contract_calls_24h} · Suspicious Events: {overview.recent_activity.suspicious_events_24h}</p>
                <div className="mt-auto pt-4">
                  <p className="text-sm text-slate-500">{overview.wallet_status ? `Last Scan: ${formatOverviewTime(overview.wallet_status.last_scan_at)}` : ""}</p>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm py-4">No recent activity data</p>
            )}
          </div>
        </div>

        {/* Col 2 */}
        <div className="space-y-4">
          {/* Active Alerts - from API */}
          <div className={`${CARD_STYLE} min-h-[200px] flex flex-col`} style={CARD_BG}>
            <div className="flex items-center gap-2 mb-3">
              {ALERT_ICON}
              <h2 className="text-lg font-medium text-slate-200">Active Alerts</h2>
            </div>
            {overviewLoading ? (
              <p className="text-slate-400 text-sm py-4">Loading…</p>
            ) : overview?.active_alerts ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-4xl font-normal text-slate-200">{overview.active_alerts.total}</span>
                    <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700/70 border border-slate-600/50">
                      Total risks alert
                    </span>
                  </div>
                  <div className="w-[28%] min-w-[70px] h-11 shrink-0 self-center">
                    {WALLET_STATUS_CHART}
                  </div>
                </div>
                <div className="text-base mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-medium" style={{ color: "#F00500" }}>{overview.active_alerts.high} High risk</span>
                  <span className="text-slate-500 shrink-0" aria-hidden>|</span>
                  <span className="text-amber-500 font-medium">{overview.active_alerts.medium} Medium risk</span>
                  <span className="text-slate-500 shrink-0" aria-hidden>|</span>
                  <span className="text-[#32BB1D] font-medium">{overview.active_alerts.low} Low risk</span>
                </div>
                <div className="mt-auto pt-4">
                  <p className="text-sm text-slate-500">{overview.wallet_status ? `Last Scan: ${formatOverviewTime(overview.wallet_status.last_scan_at)}` : ""}</p>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm py-4">No active alerts data</p>
            )}
          </div>

          {/* Connected Wallets & dApps - from API connected_risk */}
          <div className={`${CARD_STYLE} min-h-[200px] flex flex-col`} style={CARD_BG}>
            <div className="flex items-center gap-2 mb-3">
              {WALLET_ICON}
              <h2 className="text-lg font-medium text-slate-200">Connected Wallets & dApps</h2>
            </div>
            {overviewLoading ? (
              <p className="text-slate-400 text-sm py-4">Loading…</p>
            ) : overview?.connected_risk ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-4xl font-normal text-slate-200">{overview.connected_risk.total_risk_items}</span>
                    <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700/70 border border-slate-600/50">
                      Total risks level
                    </span>
                  </div>
                  <div className="w-[28%] min-w-[70px] h-11 shrink-0 self-center">
                    {WALLET_STATUS_CHART}
                  </div>
                </div>
                <p className="text-base text-slate-300 mt-2">High-Risk Connections: {overview.connected_risk.high_risk_connections} · Active dApps: {overview.connected_risk.active_dapps}</p>
                <div className="mt-auto pt-4">
                  <p className="text-sm text-slate-500">{overview.wallet_status ? `Last Scan: ${formatOverviewTime(overview.wallet_status.last_scan_at)}` : ""}</p>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm py-4">No connected risk data</p>
            )}
          </div>
        </div>

        {/* Col 3 - Activity Timeline - from API */}
        <div className={`${CARD_STYLE} xl:row-span-2 min-h-[320px]`} style={CARD_BG}>
          <div className="flex items-center gap-2 mb-4">
            {CLOCK_ICON}
            <h2 className="text-lg font-medium text-slate-200">Activity Timeline</h2>
          </div>
          {overviewLoading ? (
            <p className="text-slate-400 text-sm py-4">Loading…</p>
          ) : (
            <ul className="space-y-3 flex-1 overflow-y-auto">
              {overview?.activity_timeline?.length ? (
                overview.activity_timeline.map((e) => (
                  <li key={e.id} className="rounded-xl overflow-hidden flex" style={{ backgroundColor: "#25283D" }}>
                    <span className="w-1 shrink-0 bg-[#0026FF]" aria-hidden />
                    <div className="flex-1 min-w-0 py-3 pl-4 pr-4 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-white">{e.title}</p>
                        <p className="text-xs text-white shrink-0" style={{ fontFamily: "'Satoshi', sans-serif" }}>{formatTimelineTime(e.created_at)}</p>
                      </div>
                      {e.description && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{e.description}</p>}
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 text-sm py-4">No timeline events</li>
              )}
            </ul>
          )}
          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-3.5 transition"
          >
            Download Incident Report
          </button>
        </div>
      </div>

      {/* Bottom row: Live activity feed (left) + Connected Wallets list (right) - desktop only */}
      <div className="hidden xl:grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
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
                {feedLoading && feedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center text-slate-400 text-sm">Loading…</td>
                  </tr>
                ) : !dashboardUser?.user_id ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center text-slate-500 text-sm">Connect your wallet to see activity.</td>
                  </tr>
                ) : feedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center text-slate-500 text-sm">No activity yet.</td>
                  </tr>
                ) : (
                  feedData.map((row) => {
                    const riskLabel = capitalizeFirst(row.risk_level);
                    const statusLabel = capitalizeFirst(row.status);
                    const riskClass = RISK_CLASS[riskLabel as RiskLevel] ?? "text-slate-400";
                    const statusClass = STATUS_CLASS[statusLabel as StatusType] ?? "text-slate-400";
                    return (
                      <tr key={row.id} className="text-slate-300 hover:bg-slate-700/20 transition-colors bg-[#25283D]/50 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
                        <td className="py-3 px-4 text-slate-200 whitespace-nowrap" style={{ fontFamily: "'Satoshi', sans-serif" }}>{formatFeedTime(row.time)}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{row.wallet}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{row.type}</td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-white">{row.asset}</td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">{row.counterparty}</td>
                        <td className="py-3 px-4 whitespace-nowrap"><span className={`font-medium ${riskClass}`}>{riskLabel}</span></td>
                        <td className="py-3 px-4 whitespace-nowrap"><span className={statusClass}>{statusLabel}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-700/50">
            <button type="button" onClick={() => setFeedPage((p) => Math.max(1, p - 1))} disabled={feedPage <= 1} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white bg-[#25283D] border border-slate-600/50 hover:border-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
              ← Prev
            </button>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {feedTotalPages <= 7
                ? Array.from({ length: feedTotalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} type="button" onClick={() => setFeedPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${feedPage === n ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}>{n}</button>
                  ))
                : (
                  <>
                    <button type="button" onClick={() => setFeedPage(1)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${feedPage === 1 ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}>1</button>
                    {feedPage > 3 && <span className="px-1 text-slate-500">…</span>}
                    {Array.from({ length: feedTotalPages }, (_, i) => i + 1)
                      .filter((n) => n > 1 && n < feedTotalPages && Math.abs(n - feedPage) <= 2)
                      .map((n) => (
                        <button key={n} type="button" onClick={() => setFeedPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${feedPage === n ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}>{n}</button>
                      ))}
                    {feedPage < feedTotalPages - 2 && <span className="px-1 text-slate-500">…</span>}
                    {feedTotalPages > 1 && (
                      <button type="button" onClick={() => setFeedPage(feedTotalPages)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${feedPage === feedTotalPages ? "bg-[#0026FF] text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}>{feedTotalPages}</button>
                    )}
                  </>
                )}
            </div>
            <button type="button" onClick={() => setFeedPage((p) => Math.min(feedTotalPages, p + 1))} disabled={feedPage >= feedTotalPages} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white bg-[#25283D] border border-slate-600/50 hover:border-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
              Next →
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
              {connectedWalletsLoading ? (
                <li className="py-8 text-center text-slate-400 text-sm">Loading connected wallets…</li>
              ) : !connectedWalletsList?.length ? (
                <li className="py-8 text-center text-slate-400 text-sm">No connected wallets</li>
              ) : (
                connectedWalletsList.map((w) => {
                  const securityLower = (w.security_level || "").toLowerCase();
                  const securityColor = securityLower === "safe" ? "text-[#32BB1D]" : securityLower === "moderate" ? "text-amber-500" : "text-[#F00500]";
                  const statusColor = (w.status || "").toLowerCase() === "active" ? "text-[#32BB1D]" : "text-slate-400";
                  return (
                    <li key={w.address} className="rounded-2xl p-4 bg-[#2C2C34] flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-2 shrink-0 overflow-hidden">
                            <Image src={getWalletTypeLogoUrl(w.wallet_type_display)} alt="" width={28} height={28} className="w-7 h-7 object-contain" unoptimized />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white">{w.wallet_type_display}</p>
                            <p className="text-xs text-slate-400 font-mono truncate mt-0.5">{shortenAddress(w.address)}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-white">{w.chain_name}</p>
                          <p className={`text-xs mt-0.5 ${statusColor}`}>{w.status}</p>
                        </div>
                      </div>
                      <div className="flex flex-nowrap items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500 shrink-0">
                          Security Level: <span className={`font-medium ${securityColor}`}>{w.security_level}</span>
                        </span>
                        <span className="text-slate-500 shrink-0">
                          Last Activity: <span className="text-slate-500">{w.last_activity}</span>
                        </span>
                      </div>
                      <button type="button" className="w-full rounded-xl py-3 text-sm font-medium text-white bg-[#3A3A42] hover:bg-[#44444e] transition">
                        View Wallet
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}
          {connectedTab === "dapps" && (
            <ul className="space-y-3 overflow-y-auto">
              {connectedDappsLoading ? (
                <li className="py-8 text-center text-slate-400 text-sm">Loading connected dApps…</li>
              ) : !connectedDappsList?.length ? (
                <li className="py-8 text-center text-slate-400 text-sm">No connected dApps</li>
              ) : (
                connectedDappsList.map((d, i) => {
                  const statusColor = (d.status || "").toLowerCase() === "active" ? "text-[#32BB1D]" : "text-slate-400";
                  return (
                    <li key={d.dapp_name + d.connected_wallet_address + i} className="rounded-2xl p-4 bg-[#2C2C34] flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-11 h-11 rounded-full bg-slate-600/60 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                            {d.dapp_name?.charAt(0) ?? "?"}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white">{d.dapp_name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{d.description}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-white">{d.tokens}</p>
                          <p className={`text-xs mt-0.5 ${statusColor}`}>{d.status}</p>
                        </div>
                      </div>
                      <hr className="border-slate-600/60" />
                      <div className="flex flex-nowrap items-center justify-between gap-2 text-xs text-slate-400">
                        <span>Connected Wallet: <span className="font-semibold text-slate-300 font-mono">{shortenAddress(d.connected_wallet_address)}</span></span>
                        <span>Last Activity: <span className="font-semibold text-slate-300">{d.last_activity}</span></span>
                      </div>
                      <button type="button" className="w-full rounded-xl py-3 text-sm font-medium text-white bg-[#3A3A42] hover:bg-[#44444e] transition">
                        View Wallet
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>
      </div>
    </div>

    {/* Mobile: Full-screen Live activity feed (See More) */}
    {liveFeedFullOpen && typeof document !== "undefined" && createPortal(
      <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0a0a1a]" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <header className="shrink-0 flex items-center gap-3 p-4 border-b border-slate-800/60">
          <button type="button" onClick={() => setLiveFeedFullOpen(false)} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition" aria-label="Back">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
          <h1 className="text-base font-semibold text-white">Live activity feed</h1>
        </header>
        <div className="p-4 pb-2 shrink-0">
          <div className="flex items-center gap-2 rounded-xl border overflow-hidden" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
            <input
              type="search"
              placeholder="Search"
              value={liveFeedSearch}
              onChange={(e) => setLiveFeedSearch(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-white text-sm pl-4 py-3 focus:outline-none placeholder:text-slate-500"
            />
            <span className="w-10 h-10 flex items-center justify-center text-slate-400 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <button type="button" className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white shrink-0" aria-label="Filter">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {feedLoading && feedData.length === 0 ? (
            <p className="py-8 text-center text-slate-400 text-sm">Loading…</p>
          ) : !dashboardUser?.user_id ? (
            <p className="py-8 text-center text-slate-500 text-sm">Connect your wallet to see activity.</p>
          ) : filteredFeedForFull.length === 0 ? (
            <p className="py-8 text-center text-slate-500 text-sm">No activity found.</p>
          ) : (
            <ul className="divide-y divide-slate-700/60">
              {filteredFeedForFull.map((row) => {
                const riskLabel = capitalizeFirst(row.risk_level);
                const riskClass = riskLabel === "Low" ? "text-[#32BB1D]" : riskLabel === "Medium" ? "text-amber-500" : "text-[#F00500]";
                return (
                  <li key={row.id} className="flex items-center justify-between gap-4 py-4 px-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{row.wallet}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{row.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-medium ${riskClass}`}>{riskLabel}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatFeedTimeShort(row.time)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
