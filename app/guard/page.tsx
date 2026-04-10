"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";

import { useWallet } from "@/hooks/useWallet";
import { useDashboardUser } from "@/context/DashboardUserContext";
import { useRescanModal } from "@/context/RescanModalContext";
import { getDashboardSummary, getWalletAssets, syncWalletAssets, getDashboardActivity, getWalletsForAddress, scanContract, getScanContractDetails, getUnreadAlerts, getThreatIntelligence } from "@/services/dashboardService";
import type { DashboardSummaryData, WalletAsset, DashboardActivity, WalletListItem, ScanContractResult, ScanContractDetailResponse, UnreadAlertsData, ThreatIntelligenceItem } from "@/services/dashboardService";

/** Resolve logo URL for connected wallet: API logo_url, known provider logo, or default icon. */
const PROVIDER_LOGOS: Record<string, string> = {
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  "meta mask": "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  coinbase: "https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Product_Wallet.svg",
  "coinbase wallet": "https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Product_Wallet.svg",
  walletconnect: "https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg",
  "wallet connect": "https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg",
  rabby: "https://rabby.io/assets/images/logo-128.png",
  phantom: "https://phantom.imgix.net/logo.png",
  trust: "https://trustwallet.com/assets/images/media/assets/TWT.png",
  "trust wallet": "https://trustwallet.com/assets/images/media/assets/TWT.png",
};
const DEFAULT_WALLET_ICON = "/images/icons/wallet-header.png";
function getConnectedWalletLogoUrl(w: WalletListItem): string {
  if (w.logo_url) return w.logo_url;
  const key = (w.provider || "").toLowerCase().trim();
  return PROVIDER_LOGOS[key] ?? DEFAULT_WALLET_ICON;
}
import { walletService } from "@/services/walletService";

import frameCheckIcon from "@/assets/icons/Frame 2147237641.png";
import frameWarnIcon from "@/assets/icons/Frame 2147237641 (1).png";
import frameBlockIcon from "@/assets/icons/Frame 2147237641 (2).png";
import liveActivityTitleIcon from "@/assets/icons/Frame 2147237579.png";
import walletHealthIcon from "@/assets/icons/Frame 2147237579 (1).png";
import shieldIcon from "@/assets/icons/Shield.png";
import securityStatusIcon from "@/assets/icons/Vector.png";
import senseiCardIcon from "@/assets/icons/wallets.png";
import senseiCardLogo from "@/assets/icons/Mono.png";
import senseiCardPattern from "@/assets/icons/SVG.svg";
import walletCardBg from "@/assets/icons/Rectangle 1000002102.png";
const beVietnamPro = localFont({
  src: [
    { path: "../../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Bold.ttf", weight: "700", style: "normal" },
  ],
});

function formatLastScan(lastScanAt: string | null): string {
  if (!lastScanAt) return "Never";
  const d = new Date(lastScanAt);
  if (Number.isNaN(d.getTime())) return "Never";
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

export default function GuardDashboardPage() {
  const router = useRouter();
  const { activeAddress: address, chainId, walletType } = useWallet();
  const { setDashboardUser } = useDashboardUser();
  const { openRescanModal, scanCompleteTimestamp } = useRescanModal();
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [walletAssets, setWalletAssets] = useState<WalletAsset[] | null>(null);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [activityList, setActivityList] = useState<DashboardActivity[] | null>(null);
  const [threatModalOpen, setThreatModalOpen] = useState(false);
  const [threatIntelligenceList, setThreatIntelligenceList] = useState<ThreatIntelligenceItem[] | null>(null);
  const [threatIntelligenceLoading, setThreatIntelligenceLoading] = useState(false);
  const [contractScannerModalOpen, setContractScannerModalOpen] = useState(false);
  const [contractScannerAddress, setContractScannerAddress] = useState("");
  const [scannerLoading, setScannerLoading] = useState(false);
  const [lastContractScanResult, setLastContractScanResult] = useState<ScanContractResult | null>(null);
  const [scanDetailsModalOpen, setScanDetailsModalOpen] = useState(false);
  const [scanDetails, setScanDetails] = useState<ScanContractDetailResponse | null>(null);
  const [scanDetailsLoading, setScanDetailsLoading] = useState(false);
  const [unreadAlertModalOpen, setUnreadAlertModalOpen] = useState(false);
  const [unreadAlertsData, setUnreadAlertsData] = useState<UnreadAlertsData | null>(null);
  const [unreadAlertsLoading, setUnreadAlertsLoading] = useState(false);
  const [connectedWalletModalOpen, setConnectedWalletModalOpen] = useState(false);
  const [connectedWalletsList, setConnectedWalletsList] = useState<WalletListItem[] | null>(null);
  const [connectedWalletsLoading, setConnectedWalletsLoading] = useState(false);
  const [assetsSyncLoading, setAssetsSyncLoading] = useState(false);
  const [assetsSyncMessage, setAssetsSyncMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSyncTokens = () => {
    if (!address || assetsSyncLoading) return;
    setAssetsSyncLoading(true);
    setAssetsSyncMessage(null);
    syncWalletAssets(address)
      .then((res) => {
        if (res.ok) {
          const upserted = res.data.chains.reduce((s, c) => s + (c.tokens_upserted ?? 0), 0);
          const okChains = res.data.chains.filter((c) => c.status === "ok").length;
          const errChains = res.data.chains.filter((c) => c.status === "error");
          const skipped = res.data.chains.filter((c) => c.status === "skipped").length;
          let text = `${upserted} token(s) updated`;
          if (okChains) text += ` · ${okChains} chain(s) ok`;
          if (skipped) text += ` · ${skipped} skipped`;
          if (errChains.length) {
            const first = errChains[0].detail ?? errChains[0].status;
            text += ` · ${errChains.length} error(s)${first ? `: ${first}` : ""}`;
          }
          setAssetsSyncMessage({ tone: errChains.length ? "err" : "ok", text });
          return getWalletAssets(address).then((data) => setWalletAssets(data ?? null));
        }
        setAssetsSyncMessage({ tone: "err", text: res.message });
      })
      .finally(() => setAssetsSyncLoading(false));
  };

  const runContractScan = () => {
    if (!contractScannerAddress.trim()) return;
    setScannerLoading(true);
    setLastContractScanResult(null);
    scanContract(contractScannerAddress.trim(), address ?? undefined)
      .then((res) => setLastContractScanResult(res ?? null))
      .finally(() => setScannerLoading(false));
  };

  const openScanDetailsModal = () => {
    if (!lastContractScanResult?.scan_id) return;
    setScanDetailsModalOpen(true);
    setScanDetails(null);
    setScanDetailsLoading(true);
    getScanContractDetails(lastContractScanResult.scan_id)
      .then((res) => setScanDetails(res ?? null))
      .finally(() => setScanDetailsLoading(false));
  };

  const closeContractScannerModal = () => {
    setContractScannerModalOpen(false);
    setContractScannerAddress("");
    setLastContractScanResult(null);
    setScanDetailsModalOpen(false);
    setScanDetails(null);
  };

  useEffect(() => {
    if (!threatModalOpen) {
      setThreatIntelligenceList(null);
      return;
    }
    setThreatIntelligenceLoading(true);
    getThreatIntelligence()
      .then((res) => setThreatIntelligenceList(res ?? null))
      .finally(() => setThreatIntelligenceLoading(false));
  }, [threatModalOpen]);

  useEffect(() => {
    if (!unreadAlertModalOpen || !address) {
      setUnreadAlertsData(null);
      return;
    }
    setUnreadAlertsLoading(true);
    getUnreadAlerts(address, 20)
      .then((res) => setUnreadAlertsData(res ?? null))
      .finally(() => setUnreadAlertsLoading(false));
  }, [unreadAlertModalOpen, address]);

  useEffect(() => {
    if (!connectedWalletModalOpen || !address) {
      setConnectedWalletsList(null);
      return;
    }
    setConnectedWalletsLoading(true);
    getWalletsForAddress(address)
      .then((res) => {
        setConnectedWalletsList(res?.data ?? null);
      })
      .finally(() => setConnectedWalletsLoading(false));
  }, [connectedWalletModalOpen, address]);

  useEffect(() => {
    if (!address) {
      setSummary(null);
      return;
    }
    setSummaryLoading(true);
    const chain = chainId ?? 1;
    walletService
      .connectWallet(address, chain, walletType)
      .then(({ dashboard_user }) => {
        if (dashboard_user) setDashboardUser(dashboard_user);
      })
      .catch(() => {})
      .finally(() => {
        getDashboardSummary(address)
          .then(setSummary)
          .finally(() => setSummaryLoading(false));
      });
  }, [address, chainId, walletType, setDashboardUser]);

  useEffect(() => {
    if (!address || scanCompleteTimestamp === 0) return;
    getDashboardSummary(address).then((fresh) => fresh && setSummary(fresh));
  }, [address, scanCompleteTimestamp]);

  useEffect(() => {
    if (!address) {
      setWalletAssets(null);
      return;
    }
    setAssetsLoading(true);
    getWalletAssets(address)
      .then((data) => setWalletAssets(data ?? null))
      .finally(() => setAssetsLoading(false));
  }, [address]);

  useEffect(() => {
    if (!address) {
      setActivityList(null);
      return;
    }
    const fetchActivity = () => {
      getDashboardActivity(address).then((data) => data && setActivityList(data));
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 10000);
    return () => clearInterval(interval);
  }, [address]);

  function getAssetIcon(symbol: string): string {
    const s = symbol.toUpperCase();
    if (s === "BTC") return "/images/icons/bitcoin-ellipse.png";
    if (s === "ETH") return "/images/icons/ethereum.png";
    if (s === "LTC") return "/images/icons/litecoin.png";
    return "/images/icons/ethereum.png";
  }

  function formatAssetBalance(usdValue: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(usdValue);
  }

  function formatChangePercent(changePercent: number): string {
    const sign = changePercent >= 0 ? "+" : "";
    return `${sign}${changePercent.toFixed(1)}%`;
  }

  function getActivityIcon(activityType: string): "check" | "warn" | "block" {
    const t = activityType?.toLowerCase();
    if (t === "outgoing_tx") return "check";
    if (t === "suspicious_approval") return "warn";
    if (t === "blocked_interaction") return "block";
    return "check";
  }

  const assetsList = walletAssets ?? [];
  const activitiesList = activityList ?? [];

  return (
    <div className="p-4 space-y-6 lg:rounded-2xl lg:bg-blue-950/25 lg:border lg:border-blue-900/40 lg:p-6">
      {/* MOBILE LAYOUT - visible only below lg, no outer card background on mobile */}
      <div className="lg:hidden space-y-4">
        {/* Security Status - full width on mobile */}
        <div className="-mx-6 w-[calc(100%+3rem)] rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-slate-700/80 p-5 flex flex-col shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Image src={securityStatusIcon} alt="" width={20} height={20} className="w-5 h-5 opacity-90" />
              <h2 className="text-base font-semibold text-white">Security Status</h2>
            </div>
            <button type="button" className="text-sm text-slate-400 hover:text-white transition">View</button>
          </div>
          <div className="flex gap-4">
            <div className="relative w-32 h-32 shrink-0 rounded-full gauge-emboss-inset">
              <svg className="w-full h-full -rotate-90 animate-arc-rotate absolute inset-0" viewBox="0 0 36 36">
                <defs>
                  <radialGradient id="mobileWalletProgressGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#4066FF" />
                    <stop offset="100%" stopColor="#0026FF" />
                  </radialGradient>
                  <filter id="mobileArcGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-slate-700"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  fill="none"
                  stroke="url(#mobileWalletProgressGradient)"
                  strokeWidth="3.5"
                  strokeDasharray={`${summary?.security_status?.score ?? 0}, 100`}
                  strokeLinecap="round"
                  filter="url(#mobileArcGlow)"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{summaryLoading || summary?.security_status?.score == null ? "—" : `${summary.security_status.score}%`}</span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm text-slate-300">Status: <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#0026FF] text-white font-medium text-xs capitalize">{summary?.security_status?.status ?? "—"}</span></p>
              <p className="text-xs text-slate-400 mt-2 leading-snug">{summary?.security_status?.message ?? ""}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4">
            <p className="text-sm text-slate-400">Last Scan: {formatLastScan(summary?.security_status?.last_scan_at ?? null)}</p>
            <button type="button" onClick={openRescanModal} className="rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white text-sm font-medium px-5 py-2.5 transition">Run Full Scan</button>
          </div>
        </div>

        {/* 4 cards grid - full width on mobile for wider cards */}
        <div className="grid grid-cols-2 gap-3 -mx-6 w-[calc(100%+3rem)]">
          <ThreatIntelligenceCard mobile summary={summary} onViewThreats={() => setThreatModalOpen(true)} />
          <RecentScansCard mobile summary={summary} onScanContracts={() => setContractScannerModalOpen(true)} />
          <TotalAssetCard mobile summary={summary} onViewWallets={() => setConnectedWalletModalOpen(true)} />
          <UnreadAlertsCard mobile summary={summary} onViewAlerts={() => setUnreadAlertModalOpen(true)} />
        </div>

        {/* Wallet Assets - full width, no container on mobile */}
        <section className="-mx-10 w-[calc(100%+5rem)] px-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Image src="/images/icons/wallets.png" alt="" width={20} height={20} className="w-5 h-5 opacity-90" />
              <h2 className="text-base font-semibold text-white">Wallet Assets</h2>
            </div>
            <button
              type="button"
              onClick={handleSyncTokens}
              disabled={!address || assetsSyncLoading}
              className="text-sm text-slate-400 hover:text-white transition disabled:opacity-40 disabled:pointer-events-none"
            >
              {assetsSyncLoading ? "Syncing…" : "Sync tokens"}
            </button>
          </div>
          {assetsSyncMessage ? (
            <p className={`text-xs mb-2 ${assetsSyncMessage.tone === "err" ? "text-amber-400" : "text-slate-400"}`}>{assetsSyncMessage.text}</p>
          ) : null}
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 -mx-1">
            {assetsLoading ? (
              <p className="text-slate-400 text-sm py-4">Loading assets…</p>
            ) : assetsList.length === 0 ? (
              <div className="flex w-full min-w-full justify-center items-center py-8">
                <p className="text-slate-400 text-sm">No assets</p>
              </div>
            ) : (
              assetsList.map((asset) => (
                <div
                  key={asset.id}
                  className="shrink-0 w-[220px] min-h-[120px] rounded-2xl p-4 relative overflow-hidden border border-slate-700/60"
                >
                  <Image
                    src={walletCardBg}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="220px"
                  />
                  <div className="absolute right-0 bottom-0 top-0 w-[45%] pointer-events-none z-[1]">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-blue-900/80" preserveAspectRatio="none">
                      <path
                        fill="currentColor"
                        stroke="rgba(0,0,0,0.35)"
                        strokeWidth="0.6"
                        d="M0 100 L0 75 Q25 55 40 65 T80 45 Q95 35 100 40 L100 100 Z"
                      />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-start gap-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 shrink-0">
                        <Image src={getAssetIcon(asset.symbol)} alt={asset.name} width={20} height={20} className="object-contain" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{asset.symbol}</p>
                        <p className="text-white/80 text-xs">{asset.name}</p>
                      </div>
                    </div>
                    <p className="text-white font-normal text-lg mt-3">{formatAssetBalance(asset.usd_value)}</p>
                    <span className="inline-flex items-center gap-0.5 text-xs font-medium mt-1" style={{ color: "#32BB1D" }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
                      {formatChangePercent(asset.change_percent)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Live Activity - full width on mobile */}
        <section className="-mx-8 w-[calc(100%+4rem)] rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Image src={liveActivityTitleIcon} alt="" width={22} height={22} className="w-5 h-5 opacity-90" />
              <h2 className="text-base font-semibold text-white">Live Activity</h2>
            </div>
            <button type="button" onClick={() => setConnectedWalletModalOpen(true)} className="text-sm text-slate-400 hover:text-white transition">View wallets</button>
          </div>
          {activitiesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-slate-400 text-sm text-center">Live activity has nothing here</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {activitiesList.map((a, i) => {
                const icon = getActivityIcon(a.activity_type);
                return (
                  <li key={a.id ?? `activity-m-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/80 border border-slate-700/40">
                    {icon === "check" && (
                      <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#32BB1D]/20">
                        <Image src={frameCheckIcon} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                      </span>
                    )}
                    {icon === "warn" && (
                      <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-amber-500/20">
                        <Image src={frameWarnIcon} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                      </span>
                    )}
                    {icon === "block" && (
                      <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#F00500]/20">
                        <Image src={frameBlockIcon} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white leading-snug">{a.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{a.description}</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Sensei Card - under Live Activity on mobile, same design as desktop */}
        <section className="-mx-8 w-[calc(100%+4rem)] rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Image src={senseiCardIcon} alt="" width={22} height={22} className="w-5 h-5 shrink-0 object-contain opacity-90" />
            <h2 className="text-base font-semibold text-white">Sensei Card</h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[1.6/1] flex flex-col justify-between p-4 border border-slate-500/50 shadow-[0_4px_14px_rgba(0,0,0,0.25)]" style={{ background: "linear-gradient(165deg, #2d3561 0%, #1e2442 50%, #161b32 100%)" }}>
            <div className="absolute bottom-0 right-0 w-[55%] h-[60%] opacity-60 pointer-events-none" style={{ backgroundImage: `url(${typeof senseiCardPattern === "string" ? senseiCardPattern : (senseiCardPattern as { src?: string }).src})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "100% 100%" }} aria-hidden />
            <div className="relative z-10 flex items-start justify-between">
              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-md">
                <Image src={senseiCardLogo} alt="" width={36} height={36} className="w-full h-full object-contain" />
              </div>
              <span className={`text-white text-sm font-semibold tracking-tight ${beVietnamPro.className}`}>SenseiCard</span>
            </div>
            <p className={`relative z-10 text-white text-lg font-bold ${beVietnamPro.className}`}>5022 3386 9820 1246</p>
            <div className="relative z-10 flex items-center justify-between text-xs text-white/80">
              <span>Finances</span>
              <span>01/10</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" className="flex-1 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: "#27283B" }}>Withdraw</button>
            <button type="button" className="flex-1 rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-2.5 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90">Transfer</button>
          </div>
          <p className="mt-3 pt-3 text-sm text-slate-500 flex items-center gap-1.5 shrink-0 border-t border-slate-700/60">
            <svg className="w-4 h-4 text-slate-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            Information needed
          </p>
        </section>

        {/* Security Tip - after Sensei Card on mobile */}
        <section className="-mx-8 w-[calc(100%+4rem)] rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Image src={liveActivityTitleIcon} alt="" width={22} height={22} className="w-5 h-5 object-contain opacity-90" />
            <h2 className="text-xs font-medium text-slate-400 tracking-wider">Security Tip</h2>
          </div>
          <div className="flex flex-row items-center gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white">Revoke What You Don&apos;t Use</h3>
              <p className="text-xs text-slate-400 mt-1">Old approvals stay active even when you stop using a dApp. Clearing them removes hidden access and keeps your wallet secure.</p>
            </div>
            <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <Image src={shieldIcon} alt="" width={40} height={40} className="w-10 h-10 object-contain" />
            </div>
          </div>
        </section>
      </div>

      {/* DESKTOP LAYOUT - visible only at lg+, unchanged */}
      <div className="hidden lg:block space-y-6">
          {/* Status card + 2x2 cards beside it */}
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
            {/* Wallet Security Overview */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-slate-700/80 p-5 flex flex-col shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.06)] lg:max-w-lg">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1 pt-8">
                <div className="flex flex-col items-center sm:items-start shrink-0">
                  <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full gauge-emboss-inset">
                    <svg className="w-full h-full -rotate-90 animate-arc-rotate" viewBox="0 0 36 36">
                      <defs>
                        <radialGradient id="walletProgressGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="0%" stopColor="#4066FF" />
                          <stop offset="100%" stopColor="#0026FF" />
                        </radialGradient>
                        <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        className="text-slate-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        fill="none"
                        stroke="url(#walletProgressGradient)"
                        strokeWidth="3.5"
                        strokeDasharray={`${summary?.security_status?.score ?? 0}, 100`}
                        strokeLinecap="round"
                        filter="url(#arcGlow)"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white">{summaryLoading || summary?.security_status?.score == null ? "—" : `${summary.security_status.score}%`}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:mt-16">
                  <p className="text-sm text-slate-300">Status: <span className="inline-flex items-center justify-center min-w-[5rem] px-4 py-1 rounded-lg bg-[#0026FF] text-white font-medium capitalize">{summary?.security_status?.status ?? "—"}</span></p>
                  <p className="text-base text-slate-400 mt-2">{summary?.security_status?.message ?? ""}</p>
                </div>
              </div>
              <div className="flex items-center w-full mt-4 gap-4">
                <div className="w-44 sm:w-52 shrink-0 flex items-center">
                  <p className="text-base text-slate-400">Last Scan: {formatLastScan(summary?.security_status?.last_scan_at ?? null)}</p>
                </div>
                <div className="flex-1 min-w-4" />
                <button
                  type="button"
                  onClick={openRescanModal}
                  className="rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-base font-medium px-6 py-3 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90 shrink-0"
                >
                  Run Full Scan
                </button>
              </div>
            </div>

            {/* Four cards in 2x2 */}
            <div className="grid grid-cols-2 gap-4">
              <ThreatIntelligenceCard summary={summary} onViewThreats={() => setThreatModalOpen(true)} />
              <RecentScansCard summary={summary} onScanContracts={() => setContractScannerModalOpen(true)} />
              <TotalAssetCard summary={summary} onViewWallets={() => setConnectedWalletModalOpen(true)} />
              <UnreadAlertsCard summary={summary} onViewAlerts={() => setUnreadAlertModalOpen(true)} />
            </div>
          </div>

          {/* Wallet Assets */}
          <section className="rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-slate-700/80 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Image src="/images/icons/wallets.png" alt="" width={24} height={24} className="w-6 h-6 opacity-90" />
                <h2 className="text-lg font-semibold text-white">Wallet Assets</h2>
              </div>
              <button
                type="button"
                onClick={handleSyncTokens}
                disabled={!address || assetsSyncLoading}
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
                style={{ backgroundColor: "#27283B" }}
              >
                {assetsSyncLoading ? "Syncing…" : "Sync tokens"}
              </button>
            </div>
            {assetsSyncMessage ? (
              <p className={`text-xs mb-3 -mt-2 ${assetsSyncMessage.tone === "err" ? "text-amber-400" : "text-slate-400"}`}>{assetsSyncMessage.text}</p>
            ) : null}
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {assetsLoading ? (
                <p className="text-slate-400 text-sm py-4">Loading assets…</p>
              ) : assetsList.length === 0 ? (
                <div className="flex w-full min-w-full justify-center items-center py-8">
                  <p className="text-slate-400 text-sm">No assets</p>
                </div>
              ) : (
                assetsList.map((asset) => (
                  <div
                    key={asset.id}
                    className="shrink-0 w-[240px] rounded-2xl p-4 relative overflow-hidden bg-cover bg-center border border-slate-700/60 shadow-lg"
                    style={{ backgroundImage: 'url(/images/icons/rectangle-card.png)' }}
                  >
                    <div className="absolute right-0 bottom-0 top-0 w-[50%] pointer-events-none">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-blue-900/80" preserveAspectRatio="none">
                        <path
                          fill="currentColor"
                          stroke="rgba(0,0,0,0.35)"
                          strokeWidth="0.6"
                          d="M0 100 L0 75 Q25 55 40 65 T80 45 Q95 35 100 40 L100 100 Z"
                        />
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-start gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/10 ring-2 ring-white/30 shrink-0">
                          <Image src={getAssetIcon(asset.symbol)} alt={asset.name} width={24} height={24} className="w-6 h-6 object-contain" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-base leading-tight">{asset.symbol}</p>
                          <p className="text-white/90 text-xs">{asset.name}</p>
                        </div>
                      </div>
                      <p className="text-white font-bold text-xl mt-3">{formatAssetBalance(asset.usd_value)}</p>
                      <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 mt-2 text-xs font-medium border border-[#32BB1D]/40" style={{ backgroundColor: "rgba(50,187,29,0.2)", color: "#32BB1D" }}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
                        {formatChangePercent(asset.change_percent)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Bottom row: left column = Live Activity + Wallet health + Revoke; right column = Sensei Card */}
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            <div className="flex-1 min-w-0 lg:min-w-[600px] flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Live Activity - constrained width and compact height */}
            <div className="lg:w-[560px] lg:max-w-[560px] lg:shrink-0 rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 h-[320px] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <Image src={liveActivityTitleIcon} alt="" width={28} height={28} className="w-7 h-7 shrink-0 object-contain opacity-90" />
                  <h2 className="text-lg font-semibold text-white">Live Activity</h2>
                </div>
                <button
                  type="button"
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: "#27283B" }}
                >
                  View wallets
                </button>
              </div>
              {activitiesList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-10">
                  <p className="text-slate-400 text-sm text-center">Live activity has nothing here</p>
                </div>
              ) : (
                <ul className="flex-1 flex flex-col justify-between min-h-0 overflow-auto">
                  {activitiesList.map((a, i) => {
                    const icon = getActivityIcon(a.activity_type);
                    const descIcon = icon === "warn";
                    return (
                      <li key={a.id ?? `activity-d-${i}`} className="emboss-inset-3d-input flex items-center gap-3 p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/40 hover:border-slate-600 transition">
                        {icon === "check" && (
                          <span className="shrink-0 w-8 h-8 flex items-center justify-center overflow-hidden rounded">
                            <Image src={frameCheckIcon} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                          </span>
                        )}
                        {icon === "warn" && (
                          <span className="shrink-0 w-8 h-8 flex items-center justify-center overflow-hidden rounded">
                            <Image src={frameWarnIcon} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                          </span>
                        )}
                        {icon === "block" && (
                          <span className="shrink-0 w-8 h-8 flex items-center justify-center overflow-hidden rounded">
                            <Image src={frameBlockIcon} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white leading-snug">{a.title}</p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 leading-snug">
                            {a.description}
                            {descIcon && (
                              <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" /></svg>
                            )}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Wallet health */}
            <div className="flex-1 min-w-0 rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 h-[320px] flex flex-col" style={{ ["--gauge-percent" as string]: summary?.security_status?.score ?? 0 }}>
                <div className="flex items-center gap-2 mb-3 shrink-0">
                  <Image src={walletHealthIcon} alt="" width={28} height={28} className="w-7 h-7 shrink-0 object-contain opacity-90" />
                  <h2 className="text-base font-semibold text-white">Wallet health</h2>
                </div>
                <div className="flex-1 flex flex-col items-center min-h-0">
                  <div className="relative w-56 h-36">
                    <svg className="w-full h-full" viewBox="0 0 100 58" fill="none">
                      <defs>
                        <filter id="walletGaugeNeedleGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
                          <feFlood floodColor="white" floodOpacity="0.9" result="flood" />
                          <feComposite in="flood" in2="blur" operator="in" result="glow" />
                          <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Dark blue track (full semi-circle) */}
                      <path d="M 10 50 A 40 40 0 0 1 90 50" stroke="#1e3a5f" strokeWidth="10" strokeLinecap="round" fill="none" />
                      {/* Bright blue filled segment - matches security status score */}
                      <path d="M 10 50 A 40 40 0 0 1 90 50" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" fill="none" className="animate-gauge-arc-fill" />
                      {/* Grey needle - sweeps to score position */}
                      <g filter="url(#walletGaugeNeedleGlow)" className="animate-gauge-needle-sweep" style={{ transformOrigin: "50px 50px" }}>
                        <path d="M 50 50 L 47 44 L 50 14 L 53 44 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="0.5" />
                      </g>
                      {/* Center pivot - dark circle */}
                      <circle cx="50" cy="50" r="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-white mt-1">{summaryLoading || summary?.security_status?.score == null ? "—" : `${summary.security_status.score}%`}</p>
                  <p className="mt-auto pt-2 text-base text-slate-400 shrink-0">Issues This Month: <span className="text-white font-medium">{summary?.issues_this_month ?? "—"}</span></p>
                </div>
              </div>
              </div>

              {/* Security Tip - under Live Activity & Wallet health */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <Image src={liveActivityTitleIcon} alt="" width={28} height={28} className="w-7 h-7 object-contain opacity-90" />
                  <h2 className="text-sm font-medium text-slate-400 tracking-wider">Security Tip</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white">Revoke What You Don&apos;t Use</h3>
                  <p className="text-sm text-slate-400 mt-1">Old approvals stay active even when you stop using a dApp. Clearing them removes hidden access and keeps your wallet secure.</p>
                </div>
                <div className="shrink-0 w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden">
                  <Image src={shieldIcon} alt="" width={80} height={80} className="w-20 h-20 object-contain" />
                </div>
                </div>
              </div>
            </div>

            {/* Sensei Card - max-width so it doesn't dominate when row has only 2 flex children */}
            <div className="flex-[1.8] min-w-0 max-w-[420px] rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 shrink-0 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Image src={senseiCardIcon} alt="" width={24} height={24} className="w-6 h-6 shrink-0 object-contain opacity-90" />
                  <h2 className="text-lg font-semibold text-white">Sensei Card</h2>
                </div>
                <div className="relative rounded-2xl overflow-hidden aspect-[1.6/1] flex flex-col justify-between p-4 border border-slate-500/50 shadow-[0_4px_14px_rgba(0,0,0,0.25)]" style={{ background: "linear-gradient(165deg, #2d3561 0%, #1e2442 50%, #161b32 100%)" }}>
                  {/* SVG pattern at bottom-right of card */}
                  <div className="absolute bottom-0 right-0 w-[55%] h-[60%] opacity-60 pointer-events-none" style={{ backgroundImage: `url(${typeof senseiCardPattern === "string" ? senseiCardPattern : (senseiCardPattern as { src?: string }).src})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "100% 100%" }} aria-hidden />
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-md">
                      <Image src={senseiCardLogo} alt="" width={40} height={40} className="w-full h-full object-contain" />
                    </div>
                    <span className={`text-white text-sm font-semibold tracking-tight ${beVietnamPro.className}`}>SenseiCard</span>
                  </div>
                  <p className={`relative z-10 text-white text-xl sm:text-2xl font-bold ${beVietnamPro.className}`}>5022 3386 9820 1246</p>
                  <div className="relative z-10 flex items-center justify-between text-sm text-white/80">
                    <span>Finances</span>
                    <span>01/10</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="button" className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: "#27283B" }}>Withdraw</button>
                  <button type="button" className="flex-1 rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-2.5 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90">Transfer</button>
                </div>
                <p className="mt-auto pt-4 text-lg text-slate-500 flex items-center gap-1.5 shrink-0">
                  <svg className="w-5 h-5 text-slate-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  Information needed
                </p>
            </div>
          </div>
      </div>

      {/* Threat Intelligence modal */}
      {threatModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={() => setThreatModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden bg-[#1a1d24]" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 pb-6">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-slate-700/80 border border-slate-600/50 text-slate-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </span>
                  <h2 className="text-lg font-bold text-white truncate">Threat Intelligence</h2>
                </div>
                <button type="button" onClick={() => setThreatModalOpen(false)} className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 transition" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto hide-scrollbar">
                {threatIntelligenceLoading ? (
                  <p className="text-slate-400 text-sm py-6 text-center">Loading threat intelligence…</p>
                ) : !threatIntelligenceList?.length ? (
                  <p className="text-slate-400 text-sm py-6 text-center">No threat intelligence data</p>
                ) : (
                  threatIntelligenceList.map((item, i) => {
                    const severityLower = (item.severity || "").toLowerCase();
                    const severityCritical = severityLower === "critical";
                    const severityHigh = severityLower === "high";
                    const severityClass = severityCritical ? "text-[#F00500]" : severityHigh ? "text-[#F00500]" : "text-amber-500";
                    return (
                      <div key={i} className="rounded-lg bg-slate-800/80 border border-slate-700/50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-white font-bold leading-tight">{item.title}</p>
                            {item.description && <p className="text-slate-400 text-sm mt-1">{item.description}</p>}
                          </div>
                          <span className={`shrink-0 text-sm font-medium capitalize ${severityClass}`}>{item.severity}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setThreatModalOpen(false)} className="flex-1 rounded-xl font-bold text-white py-3 px-4 transition border border-[#222222] hover:opacity-90" style={{ background: "linear-gradient(to bottom, #4a4a4a 0%, #414141 50%, #383838 100%)" }}>
                  Cancel
                </button>
                <button type="button" onClick={() => { setThreatModalOpen(false); router.push("/guard/threat-intelligence"); }} className="flex-1 rounded-xl font-medium text-white py-3 px-4 transition border border-[#001a99] hover:opacity-95" style={{ background: "linear-gradient(to bottom, #3366ff 0%, #0026FF 50%, #001fcc 100%)" }}>
                  view intelligence
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Contract Scanner modal - same API as wallet-security contract scanner */}
      {contractScannerModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={closeContractScannerModal}>
          <div className="w-full max-w-md rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden bg-[#1a1d24]" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 pb-6">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-slate-700/80 border border-slate-600/50 text-slate-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </span>
                  <h2 className="text-lg font-bold text-white truncate">Contract Scanner</h2>
                </div>
                <button type="button" onClick={closeContractScannerModal} className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 transition" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-400 mb-2">Contract address (Ethereum and BSC)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={contractScannerAddress}
                    onChange={(e) => setContractScannerAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runContractScan()}
                    placeholder="Enter contract address (0x...)"
                    className="flex-1 min-w-0 rounded-lg bg-slate-800/80 border border-slate-700/50 px-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#4066FF] focus:border-transparent"
                  />
                  <button
                    type="button"
                    disabled={scannerLoading || !contractScannerAddress.trim()}
                    onClick={runContractScan}
                    className="shrink-0 rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] disabled:opacity-50 disabled:pointer-events-none text-white font-medium px-5 py-3 text-sm hover:opacity-95 transition"
                  >
                    {scannerLoading ? "Scanning…" : "Scan"}
                  </button>
                </div>
              </div>
              {!lastContractScanResult ? (
                <p className="text-sm text-slate-500 py-2 mb-4">Enter a contract address and click Scan.</p>
              ) : (
                <div className="rounded-lg border border-slate-700/50 p-4 space-y-3 mb-6" style={{ backgroundColor: "#0D1029" }}>
                  {[
                    { label: "Trust Score", value: `${lastContractScanResult.trust_score}%`, trend: lastContractScanResult.trust_score >= 50 },
                    { label: "Critical Risk Flags", value: String(lastContractScanResult.critical_risk_flags) },
                    { label: "Token Controlled", value: lastContractScanResult.token_controlled || "—" },
                    { label: "OWNER / ADMIN", value: String(lastContractScanResult.owner_admin_count) },
                  ].map((m, i) => (
                    <div key={i} className="flex justify-between items-center gap-4 py-1.5">
                      <span className="text-slate-400 text-sm">{m.label}</span>
                      <span className="text-sm font-medium text-white flex items-center gap-1">
                        {m.value}
                        {m.trend && (
                          <svg className="w-4 h-4" style={{ color: "#32BB1D" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={closeContractScannerModal} className="flex-1 rounded-xl font-bold text-white py-3 px-4 transition border border-[#222222] hover:opacity-90" style={{ background: "linear-gradient(to bottom, #4a4a4a 0%, #414141 50%, #383838 100%)" }}>
                  Done
                </button>
                <button type="button" disabled={!lastContractScanResult?.scan_id} onClick={openScanDetailsModal} className="flex-1 rounded-xl font-medium text-white py-3 px-4 transition border border-[#001a99] disabled:opacity-50 disabled:pointer-events-none hover:opacity-95" style={{ background: "linear-gradient(to bottom, #3366ff 0%, #0026FF 50%, #001fcc 100%)" }}>
                  View full details
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Contract Scan Details modal (same as wallet-security) */}
      {scanDetailsModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={() => { setScanDetailsModalOpen(false); setScanDetails(null); }}>
          <div className="w-full h-full min-h-full max-h-full md:min-h-0 md:max-w-2xl md:max-h-[90vh] rounded-none md:rounded-2xl border-0 md:border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col bg-[#191b28]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 shrink-0" style={{ backgroundColor: "#1B1B1B" }}>
              <h2 className="text-lg font-bold text-white">Contract Scan Details</h2>
              <button type="button" onClick={() => { setScanDetailsModalOpen(false); setScanDetails(null); }} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 transition" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4 hide-scrollbar">
              {scanDetailsLoading ? (
                <p className="text-slate-400 text-sm">Loading details…</p>
              ) : !scanDetails ? (
                <p className="text-slate-400 text-sm">Could not load scan details.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col gap-1 md:flex-row md:justify-between md:items-center md:gap-4">
                      <span className="text-slate-400 shrink-0">Contract Address</span>
                      <span className="text-slate-200 font-mono text-left md:text-right break-all">{scanDetails.contract_address}</span>
                    </div>
                    <ContractDetailRow label="Trust Score" value={`${scanDetails.trust_score}%`} />
                    <ContractDetailRow label="Critical Risk Flags" value={String(scanDetails.critical_risk_flags)} />
                    <ContractDetailRow label="Token Controlled" value={scanDetails.token_controlled || "—"} />
                    <ContractDetailRow label="Owner / Admin" value={String(scanDetails.owner_admin_count)} />
                    <ContractDetailRow label="Scanned" value={formatContractScanDate(scanDetails.scanned_at)} />
                  </div>
                  {lastContractScanResult?.ai_summary && (
                    <div>
                      <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-2">AI Summary</h3>
                      <p className="text-sm text-slate-200 rounded-lg bg-slate-800/80 border border-slate-700/60 p-3">{lastContractScanResult.ai_summary}</p>
                    </div>
                  )}
                  {scanDetails.details && (
                    <>
                      {scanDetails.details.simulation && (
                        <ContractDetailSection title="Simulation">
                          <ContractDetailRow label="Drains full balance" value={scanDetails.details.simulation.drains_full_balance ? "Yes" : "No"} />
                          <ContractDetailRow label="Hidden internal calls" value={String(scanDetails.details.simulation.hidden_internal_calls ?? "—")} />
                          <ContractDetailRow label="Approval scope" value={scanDetails.details.simulation.approval_scope ?? "—"} />
                          {scanDetails.details.simulation.dangerous_functions?.length ? (
                            <p className="text-sm"><span className="text-slate-400">Dangerous functions: </span><span className="text-slate-200">{scanDetails.details.simulation.dangerous_functions.join(", ")}</span></p>
                          ) : null}
                        </ContractDetailSection>
                      )}
                      {scanDetails.details.owner_privileges && (
                        <ContractDetailSection title="Owner privileges">
                          <ContractDetailRow label="Mint" value={scanDetails.details.owner_privileges.mint ? "Yes" : "No"} />
                          <ContractDetailRow label="Pause" value={scanDetails.details.owner_privileges.pause ? "Yes" : "No"} />
                          <ContractDetailRow label="Upgradeable" value={scanDetails.details.owner_privileges.upgradeable ? "Yes" : "No"} />
                          <ContractDetailRow label="Withdraw liquidity" value={scanDetails.details.owner_privileges.withdraw_liquidity ? "Yes" : "No"} />
                          <ContractDetailRow label="Blacklist" value={scanDetails.details.owner_privileges.blacklist ? "Yes" : "No"} />
                        </ContractDetailSection>
                      )}
                      {scanDetails.details.reputation && (
                        <ContractDetailSection title="Reputation">
                          <ContractDetailRow label="Reported scam" value={scanDetails.details.reputation.reported_scam ? "Yes" : "No"} />
                          <ContractDetailRow label="Community flags" value={String(scanDetails.details.reputation.community_flags ?? 0)} />
                          <ContractDetailRow label="Verified source" value={scanDetails.details.reputation.verified_source ? "Yes" : "No"} />
                        </ContractDetailSection>
                      )}
                      {scanDetails.details.trend && (
                        <ContractDetailSection title="Trend">
                          <ContractDetailRow label="Scans today" value={String(scanDetails.details.trend.scans_today ?? "—")} />
                          <ContractDetailRow label="Wallets affected" value={String(scanDetails.details.trend.wallets_affected ?? "—")} />
                          <ContractDetailRow label="Risk trend" value={scanDetails.details.trend.risk_trend ?? "—"} />
                        </ContractDetailSection>
                      )}
                      {scanDetails.details.risk_breakdown && (
                        <ContractDetailSection title="Risk breakdown">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(scanDetails.details.risk_breakdown).map(([k, v]) => (
                              <span key={k} className="flex justify-between gap-2"><span className="text-slate-400 capitalize">{k.replace(/_/g, " ")}</span><span className="text-slate-200">{v}%</span></span>
                            ))}
                          </div>
                        </ContractDetailSection>
                      )}
                      {scanDetails.details.user_anomaly_score != null && <ContractDetailRow label="User anomaly score" value={String(scanDetails.details.user_anomaly_score)} />}
                      {scanDetails.details.rug_pull_probability && (() => {
                        const v = scanDetails.details.rug_pull_probability!.toLowerCase();
                        const riskStyle = v === "high" ? { color: "#F00500" } : v === "medium" ? undefined : { color: "#32BB1D" };
                        const riskClass = v === "high" ? "font-semibold" : v === "medium" ? "font-semibold text-amber-500" : "font-semibold text-[#32BB1D]";
                        return <ContractDetailRow label="Rug pull probability" value={scanDetails.details.rug_pull_probability!} valueClassName={riskClass} valueStyle={riskStyle} />;
                      })()}
                    </>
                  )}
                </>
              )}
            </div>
            <div className="p-5 border-t border-slate-700/60 shrink-0">
              <button type="button" onClick={() => { setScanDetailsModalOpen(false); setScanDetails(null); }} className="w-full rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-3 transition">Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Unread Alert modal */}
      {unreadAlertModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={() => setUnreadAlertModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden bg-[#1A1E2E]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#2D2F3C] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-slate-700/80 border border-slate-600/50 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </span>
                <h2 className="text-lg font-bold text-white truncate">Unread Alert</h2>
              </div>
              <button type="button" onClick={() => setUnreadAlertModalOpen(false)} className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 transition" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 max-h-[50vh] overflow-y-auto hide-scrollbar space-y-2">
              {unreadAlertsLoading ? (
                <p className="text-slate-400 text-sm py-6 text-center">Loading alerts…</p>
              ) : !unreadAlertsData?.alerts?.length ? (
                <p className="text-slate-400 text-sm py-6 text-center">No unread alerts</p>
              ) : (
                unreadAlertsData.alerts.map((alert) => (
                  <div key={alert.id} className="rounded-lg p-4 flex items-center justify-between gap-4 bg-[#262938] border border-slate-700/40">
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold truncate">{alert.title}</p>
                      {alert.body && <p className="text-slate-400 text-sm mt-0.5 line-clamp-2">{alert.body}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-medium text-sm capitalize ${alert.severity === "high" || alert.severity === "critical" ? "text-[#F00500]" : alert.severity === "medium" ? "text-amber-500" : "text-slate-300"}`}>{alert.severity}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{formatContractScanDate(alert.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-5 flex gap-3 border-t border-slate-700/50">
              <button type="button" onClick={() => setUnreadAlertModalOpen(false)} className="flex-1 rounded-xl font-bold text-white py-3 px-4 transition hover:opacity-90" style={{ background: "linear-gradient(to bottom, #4a4a4a 0%, #414141 50%, #383838 100%)" }}>
                Done
              </button>
              <button type="button" onClick={() => setUnreadAlertModalOpen(false)} className="flex-1 rounded-xl font-medium text-white py-3 px-4 transition hover:opacity-95" style={{ background: "linear-gradient(to bottom, #3366ff 0%, #0026FF 50%, #001fcc 100%)" }}>
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Connected Wallet modal - list from getWalletsForAddress API */}
      {mounted && connectedWalletModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={() => setConnectedWalletModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden bg-[#1A1E2E]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#2D2F3C] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-slate-700/80 border border-slate-600/50 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </span>
                <h2 className="text-lg font-bold text-white truncate">Connected Wallets</h2>
              </div>
              <button type="button" onClick={() => setConnectedWalletModalOpen(false)} className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 transition" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 max-h-[50vh] overflow-y-auto hide-scrollbar space-y-2">
              {connectedWalletsLoading ? (
                <p className="text-slate-400 text-sm py-6 text-center">Loading connected wallets…</p>
              ) : !connectedWalletsList?.length ? (
                <p className="text-slate-400 text-sm py-6 text-center">No connected wallets</p>
              ) : (
                connectedWalletsList.map((w) => (
                  <div key={w.id} className="rounded-lg p-3 flex items-center gap-3 bg-[#262938]/90 border border-slate-700/40">
                    <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden border border-slate-600/50">
                      <Image src={getConnectedWalletLogoUrl(w)} alt={w.provider || "Wallet"} width={28} height={28} className="w-7 h-7 object-contain" unoptimized />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium text-sm truncate">{w.provider} • {w.currency}</p>
                      <p className="text-slate-400 text-xs font-mono truncate mt-0.5">{w.address}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-5 flex gap-3 border-t border-slate-700/50">
              <button type="button" onClick={() => setConnectedWalletModalOpen(false)} className="flex-1 rounded-xl font-bold text-white py-3 px-4 transition hover:opacity-90" style={{ background: "linear-gradient(to bottom, #4a4a4a 0%, #414141 50%, #383838 100%)" }}>
                Done
              </button>
              <button type="button" onClick={() => { setConnectedWalletModalOpen(false); router.push("/guard/wallet-security"); }} className="flex-1 rounded-xl font-medium text-white py-3 px-4 transition hover:opacity-95" style={{ background: "linear-gradient(to bottom, #3366ff 0%, #0026FF 50%, #001fcc 100%)" }}>
                view wallet security
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function ThreatIntelligenceCard({ mobile, summary, onViewThreats }: { mobile?: boolean; summary?: DashboardSummaryData | null; onViewThreats?: () => void }) {
  const count = summary?.threats_this_month;
  const trend = summary?.threats_trend_percent;
  const positive = trend != null && trend >= 0;
  return (
    <div className={`rounded-xl flex flex-col bg-gradient-to-br from-blue-950 to-slate-900 ${mobile ? "p-2.5 min-h-[115px]" : "p-5 min-h-[180px]"}`}>
      <div className="flex items-center gap-2">
        <Image src="/images/icons/alert.png" alt="" width={mobile ? 16 : 20} height={mobile ? 16 : 20} className="shrink-0" />
        <p className={`text-white font-medium ${mobile ? "text-xs" : "text-base"}`}>Threat Intelligence</p>
      </div>
      <div className={`flex items-baseline gap-2 mt-2 ${mobile ? "mt-1" : "mt-3"}`}>
        <span className={`text-white font-normal ${mobile ? "text-xl" : "text-4xl"}`}>{count != null ? count : "—"}</span>
        {trend != null && (
          <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium ${positive ? "bg-[#2F4F2F] text-[#A0E0A0]" : ""}`} style={positive ? undefined : { backgroundColor: "rgba(240,5,0,0.2)", color: "#F00500" }}>
            <svg className={`w-2.5 h-2.5 ${positive ? "" : "rotate-180"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
            {positive ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div className={`flex items-center justify-between mt-auto ${mobile ? "pt-2" : "pt-4"}`}>
        <p className={`text-slate-400 ${mobile ? "text-[10px]" : "text-sm"}`}>This month</p>
        <button
          type="button"
          onClick={onViewThreats}
          className={`rounded bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white font-medium transition ${mobile ? "text-xs px-2.5 py-1.5" : "text-sm px-4 py-2.5"}`}
        >
          View Threat
        </button>
      </div>
    </div>
  );
}

function TotalAssetCard({ mobile, summary, onViewWallets }: { mobile?: boolean; summary?: DashboardSummaryData | null; onViewWallets?: () => void }) {
  const raw = summary?.total_asset_usd;
  const value = raw != null ? (raw.startsWith("$") ? raw : `$${raw}`) : "—";
  const trend = summary?.total_asset_trend_percent;
  const positive = trend != null && trend >= 0;
  return (
    <div className={`rounded-xl flex flex-col bg-gradient-to-br from-blue-950 to-slate-900 ${mobile ? "p-2.5 min-h-[115px]" : "p-5 min-h-[180px]"}`}>
      <div className="flex items-center gap-2">
        <Image src="/images/icons/wallets.png" alt="" width={mobile ? 16 : 20} height={mobile ? 16 : 20} className="shrink-0" />
        <p className={`text-white font-medium ${mobile ? "text-xs" : "text-base"}`}>Total Asset</p>
      </div>
      <div className={`flex items-baseline gap-2 ${mobile ? "mt-1" : "mt-3"}`}>
        <span className={`text-white font-normal ${mobile ? "text-xl" : "text-4xl"}`}>{value}</span>
        {!mobile && trend != null && (
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium ${positive ? "bg-[#2F4F2F] text-[#A0E0A0]" : ""}`} style={positive ? undefined : { backgroundColor: "rgba(240,5,0,0.2)", color: "#F00500" }}>
            <svg className={`w-3 h-3 ${positive ? "" : "rotate-180"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
            {positive ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div className={`flex items-center justify-between mt-auto ${mobile ? "pt-2" : "pt-4"}`}>
        <p className={`text-slate-400 ${mobile ? "text-[10px]" : "text-sm"}`}>This month</p>
        <button
          type="button"
          onClick={onViewWallets}
          className={`rounded bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white font-medium transition ${mobile ? "text-xs px-2.5 py-1.5" : "text-sm px-4 py-2.5"}`}
        >
          View wallets
        </button>
      </div>
    </div>
  );
}

function UnreadAlertsCard({ mobile, summary, onViewAlerts }: { mobile?: boolean; summary?: DashboardSummaryData | null; onViewAlerts?: () => void }) {
  const count = summary?.unread_alerts;
  const highRisk = summary?.high_risk_alerts;
  const trend = summary?.alerts_trend_percent;
  const positive = trend != null && trend >= 0;
  return (
    <div className={`rounded-xl flex flex-col bg-gradient-to-br from-blue-950 to-slate-900 ${mobile ? "p-2.5 min-h-[115px]" : "p-5 min-h-[180px]"}`}>
      <div className="flex items-center gap-2">
        <Image src="/images/icons/alert-02.png" alt="" width={mobile ? 16 : 20} height={mobile ? 16 : 20} className="shrink-0" />
        <p className={`text-white font-medium ${mobile ? "text-xs" : "text-base"}`}>Unread Alerts</p>
      </div>
      <div className={`flex items-baseline gap-2 ${mobile ? "mt-1" : "mt-3"}`}>
        <span className={`text-white font-normal ${mobile ? "text-xl" : "text-4xl"}`}>{count != null ? count : "—"}</span>
        {trend != null && (
          <span className={`inline-flex items-center gap-0.5 rounded font-medium ${mobile ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-sm"} ${positive ? "bg-[#2F4F2F] text-[#A0E0A0]" : ""}`} style={positive ? undefined : { backgroundColor: "rgba(240,5,0,0.2)", color: "#F00500" }}>
            <svg className={`${positive ? "" : "rotate-180"} ${mobile ? "w-2.5 h-2.5" : "w-3 h-3"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
            {positive ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div className={`flex items-center justify-between mt-auto ${mobile ? "pt-2" : "pt-4"}`}>
        <div className="flex items-center gap-1.5">
          {!mobile && <Image src="/images/icons/alert-01.png" alt="" width={16} height={16} className="w-4 h-4 shrink-0" />}
          <p className={`text-slate-400 ${mobile ? "text-[10px]" : "text-sm"}`}>{highRisk != null ? `${highRisk} high risk` : "—"}</p>
        </div>
        <button
          type="button"
          onClick={onViewAlerts}
          className={`rounded bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white font-medium transition ${mobile ? "text-xs px-2.5 py-1.5" : "text-sm px-4 py-2.5"}`}
        >
          View Alerts
        </button>
      </div>
    </div>
  );
}

function RecentScansCard({ mobile, summary, onScanContracts }: { mobile?: boolean; summary?: DashboardSummaryData | null; onScanContracts?: () => void }) {
  const count = summary?.scans_this_month;
  const trend = summary?.scans_trend_percent;
  const positive = trend != null && trend >= 0;
  return (
    <div className={`rounded-xl flex flex-col bg-gradient-to-br from-blue-950 to-slate-900 ${mobile ? "p-2.5 min-h-[115px]" : "p-5 min-h-[180px]"}`}>
      <div className="flex items-center gap-2">
        <Image src="/images/icons/scan.png" alt="" width={mobile ? 16 : 20} height={mobile ? 16 : 20} className="shrink-0" />
        <p className={`text-white font-medium ${mobile ? "text-xs" : "text-base"}`}>Recent Scans</p>
      </div>
      <div className={`flex items-baseline gap-2 ${mobile ? "mt-1" : "mt-3"}`}>
        <span className={`text-white font-normal ${mobile ? "text-xl" : "text-4xl"}`}>{count != null ? count : "—"}</span>
        {trend != null && (
          <span className={`inline-flex items-center gap-0.5 rounded font-medium ${positive ? "bg-[#2F4F2F] text-[#A0E0A0]" : ""} ${mobile ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-sm"}`} style={positive ? undefined : { backgroundColor: "rgba(240,5,0,0.2)", color: "#F00500" }}>
            <svg className={`${positive ? "" : "rotate-180"} ${mobile ? "w-2.5 h-2.5" : "w-3 h-3"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
            {positive ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div className={`flex items-center justify-between mt-auto ${mobile ? "pt-2" : "pt-4"}`}>
        <p className={`text-slate-400 ${mobile ? "text-[10px]" : "text-sm"}`}>This month</p>
        <button
          type="button"
          onClick={onScanContracts}
          className={`rounded bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white font-medium transition ${mobile ? "text-xs px-2 py-1.5" : "text-sm px-4 py-2.5"}`}
        >
          Scan Contracts
        </button>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  positive,
  label,
  buttonLabel,
  alert,
}: {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  label: string;
  buttonLabel: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 flex flex-col">
      <div className="flex items-center gap-2">
        {alert && (
          <svg className="w-5 h-5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" />
          </svg>
        )}
        <p className="text-sm text-slate-400">{title}</p>
      </div>
      <p className="text-2xl font-semibold text-white mt-1">{value}</p>
      {change && (
        <p className={`text-sm mt-0.5 ${positive ? "text-[#32BB1D]" : "text-[#F00500]"}`}>{change}</p>
      )}
      <p className="text-xs text-slate-500 mt-1">{label}</p>
      <button type="button" className="mt-auto pt-3 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-medium py-2 w-full transition">
        {buttonLabel}
      </button>
    </div>
  );
}

function formatContractScanDate(iso: string): string {
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

function ContractDetailRow({ label, value, valueClassName, valueStyle }: { label: string; value: string; valueClassName?: string; valueStyle?: React.CSSProperties }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span style={valueStyle} className={`text-slate-200 break-all text-right ${valueClassName ?? ""}`}>{value}</span>
    </div>
  );
}

function ContractDetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-2">{title}</h3>
      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 p-3 space-y-2 text-sm">{children}</div>
    </div>
  );
}
