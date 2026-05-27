"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useWallet } from "@/hooks/useWallet";
import { useConnectNetworksModal } from "@/context/ConnectWalletsModalContext";
import { getDashboardSummary, getDashboardMetrics, getDashboardApprovals, getWalletsForAddress, getTransactionMonitoring, runFullScan, getScanContractDetails, scanContract, getProtectionSettings, updateProtectionSettings, setEmergencyLock, protectionSettingsToControls, getSecurityAlerts, getAddressSafety, analyzeTransaction, getRiskyTokens, getActiveThreats, getThreatHistory, resolveThreat, dismissThreat, refreshWalletHealth, verifyThreat, verifyAllThreats, recordThreatRemediationAction, inferThreatRemediation } from "@/services/dashboardService";
import type { DashboardSummaryData, DashboardMetricsData, DashboardApproval, WalletListItem, WalletsPagination, TransactionMonitoringItem, RunFullScanData, ScanContractResult, ScanContractDetailResponse, SecurityAlertItem, AddressSafetyItem, AnalyzeTransactionResponse, RiskyTokenItem, WalletThreatItem, ActiveThreatsMeta, ThreatHistoryMeta, ThreatCorrelation } from "@/services/dashboardService";
import { walletService } from "@/services/walletService";
import type { WalletModalData } from "@/services/walletService";

import alertIcon from "@/assets/icons/alert.png";
import scanIcon from "@/assets/icons/scan.png";
import vectorIcon from "@/assets/icons/Vector.png";
import shieldIcon from "@/assets/icons/Shield.png";

const CHECK_ICON = (
  <svg className="w-5 h-5 shrink-0" style={{ color: "#32BB1D" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const WARN_ICON = (
  <svg className="w-5 h-5 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const SHIELD_ICON = (
  <svg className="w-5 h-5 shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const SECURITY_STATUS_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  </span>
);

const APPROVAL_HEADER_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0 overflow-hidden p-1.5">
    <Image src={vectorIcon} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
  </span>
);

const WALLET_ICON = "/images/icons/wallet-header.png";

/** Known provider logo URLs (used when API does not return logo_url). */
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

function getWalletLogoUrl(w: WalletListItem): string {
  if (w.logo_url) return w.logo_url;
  const key = (w.provider || "").toLowerCase().trim();
  return PROVIDER_LOGOS[key] ?? WALLET_ICON;
}

const PROTECTION_CONTROLS = [
  { id: "auto-scan", label: "Auto Security Scan", on: true },
  { id: "high-risk", label: "High-Risk Tx Warnings", on: true },
  { id: "approval", label: "New Approval Alerts", on: true },
  { id: "dapp", label: "New dApp Connection Alerts", on: true },
  { id: "auto-block-contract", label: "Auto block malicious smart contract", on: true },
  { id: "emergency-lock", label: "Emergency lock (firewall)", on: false },
];

const KEY_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  </span>
);

const CHAIN_TO_NETWORK: Record<string, string> = {
  Ethereum: "Ethereum Mainnet",
  Bitcoin: "Bitcoin Mainnet",
  BNB: "BNB Smart Chain",
  Litecoin: "Litecoin",
  Ripple: "XRP Ledger",
};

const HOW_TO_FIX_PER_PAGE = 3;

function howToFixTotalPages(meta: ActiveThreatsMeta | ThreatHistoryMeta | null, tab: "active" | "history"): number {
  if (!meta) return 1;
  if (tab === "history" && "total" in meta) {
    return Math.max(1, Math.ceil(meta.total / HOW_TO_FIX_PER_PAGE));
  }
  if ("count" in meta) {
    return Math.max(1, Math.ceil(meta.count / HOW_TO_FIX_PER_PAGE));
  }
  return 1;
}

function howToFixSubtitle(meta: ActiveThreatsMeta | ThreatHistoryMeta | null, tab: "active" | "history"): string {
  if (!meta) return tab === "history" ? "Loading history..." : "Loading remediation plan...";
  if (tab === "history" && "total" in meta) {
    return `${meta.total} past incident(s)`;
  }
  if ("count" in meta) {
    const high = meta.high_priority_count ?? 0;
    return `${meta.count} active issue(s) • ${high} high priority`;
  }
  return tab === "history" ? "Past incidents" : "Active issues";
}

function formatMetricChange(changePercent: number): string {
  const sign = changePercent >= 0 ? "+" : "";
  return `${sign}${Number(changePercent).toFixed(1)}%`;
}

function formatApprovalDate(iso: string): string {
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

function formatApprovalDateShort(iso: string): string {
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

function truncateAddress(addr: string, start = 5, end = 4): string {
  if (!addr || addr.length <= start + end) return addr;
  return `${addr.slice(0, start)}...${addr.slice(-end)}`;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

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

function formatThreatDetectedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown time";
  return d.toLocaleString();
}

function getSeverityBadgeClass(severity: string): string {
  const normalized = String(severity || "").toLowerCase();
  if (normalized === "high") return "bg-[#F00500]/20 text-[#ff6b67] border-[#F00500]/40";
  if (normalized === "medium") return "bg-amber-500/20 text-amber-300 border-amber-500/40";
  return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
}

function formatCampaignType(value: string): string {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function CorrelationPanel({ correlation }: { correlation: ThreatCorrelation }) {
  return (
    <div className="rounded-lg border border-[#4066FF]/35 bg-[#4066FF]/10 p-3 space-y-2 text-sm">
      <p className="text-xs uppercase tracking-wide text-[#a8bfff]">Correlated threat campaign</p>
      <p className="text-slate-200 leading-relaxed">{correlation.narrative}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        <span>Type: <span className="text-slate-200">{formatCampaignType(correlation.campaign_type)}</span></span>
        <span>Confidence: <span className="text-slate-200">{correlation.confidence_score}%</span></span>
        <span>Campaign risk: <span className="text-slate-200">{correlation.risk_score}</span></span>
        <span>Evidence: <span className="text-slate-200">{correlation.evidence_count}</span></span>
      </div>
      <p className="text-[11px] text-slate-500 font-mono truncate" title={correlation.campaign_id}>
        Campaign: {correlation.campaign_id}
      </p>
    </div>
  );
}

function remediationActionLabel(item: WalletThreatItem): string | null {
  const payload = inferThreatRemediation(item);
  if (!payload) return null;
  switch (payload.action) {
    case "revoke_approval":
      return "Log revoke";
    case "block_contract":
      return "Log block";
    case "disconnect_dapp":
      return "Log disconnect";
    case "hide_token":
      return "Log hide token";
    default:
      return "Log action";
  }
}

export default function WalletSecurityPage() {
  const { activeAddress: address } = useWallet();
  const [txPage, setTxPage] = useState(1);
  const [txList, setTxList] = useState<TransactionMonitoringItem[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txPagination, setTxPagination] = useState<WalletsPagination | null>(null);
  const [controls, setControls] = useState(PROTECTION_CONTROLS);
  const [protectionLoading, setProtectionLoading] = useState(false);
  const [protectionSavingId, setProtectionSavingId] = useState<string | null>(null);
  const [protectionApiResponse, setProtectionApiResponse] = useState<{
    controlLabel: string;
    enabled: boolean;
    response: unknown;
    updatedAt: string;
  } | null>(null);
  const [walletsList, setWalletsList] = useState<WalletListItem[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [walletsPagination, setWalletsPagination] = useState<WalletsPagination | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletListItem | null>(null);
  const [walletModalTab, setWalletModalTab] = useState<"details" | "balance" | "security" | "activity" | "contract">("details");
  const [walletModalData, setWalletModalData] = useState<WalletModalData | null>(null);
  const [walletModalLoading, setWalletModalLoading] = useState(false);
  const [selectedApprovalIndex, setSelectedApprovalIndex] = useState<number | null>(null);
  const [rescanModalOpen, setRescanModalOpen] = useState(false);
  const [rescanProgress, setRescanProgress] = useState(0);
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [weakEmergencyModalOpen, setWeakEmergencyModalOpen] = useState(false);
  const [weakEmergencyModalEvaluated, setWeakEmergencyModalEvaluated] = useState(false);
  const [scanInProgress, setScanInProgress] = useState(false);
  const [scanTriggered, setScanTriggered] = useState(false);
  const [scanResult, setScanResult] = useState<RunFullScanData | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetricsData | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [approvals, setApprovals] = useState<DashboardApproval[] | null>(null);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [approvalPeriod, setApprovalPeriod] = useState("this_month");
  const [contractScannerAddress, setContractScannerAddress] = useState("");
  const [scannerLoading, setScannerLoading] = useState(false);
  const [lastContractScanResult, setLastContractScanResult] = useState<ScanContractResult | null>(null);
  const [scanDetailsModalOpen, setScanDetailsModalOpen] = useState(false);
  const [scanDetails, setScanDetails] = useState<ScanContractDetailResponse | null>(null);
  const [scanDetailsLoading, setScanDetailsLoading] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlertItem[] | null>(null);
  const [securityAlertsLoading, setSecurityAlertsLoading] = useState(false);
  const [addressSafety, setAddressSafety] = useState<AddressSafetyItem[] | null>(null);
  const [addressSafetyLoading, setAddressSafetyLoading] = useState(false);
  const connectNetworksModal = useConnectNetworksModal();
  const [analyzeTxModalOpen, setAnalyzeTxModalOpen] = useState(false);
  const [analyzeTxLoading, setAnalyzeTxLoading] = useState(false);
  const [analyzeTxResult, setAnalyzeTxResult] = useState<AnalyzeTransactionResponse | null>(null);
  const [analyzeTxError, setAnalyzeTxError] = useState<string | null>(null);
  const [analyzeTxTo, setAnalyzeTxTo] = useState("");
  const [analyzeTxValue, setAnalyzeTxValue] = useState("");
  const [analyzeTxData, setAnalyzeTxData] = useState("");
  const [analyzeTxChainId, setAnalyzeTxChainId] = useState("");
  const [riskyTokensModalOpen, setRiskyTokensModalOpen] = useState(false);
  const [riskyTokensLoading, setRiskyTokensLoading] = useState(false);
  const [riskyTokensList, setRiskyTokensList] = useState<RiskyTokenItem[] | null>(null);
  const [howToFixModalOpen, setHowToFixModalOpen] = useState(false);
  const [howToFixLoading, setHowToFixLoading] = useState(false);
  const [howToFixError, setHowToFixError] = useState<string | null>(null);
  const [howToFixTab, setHowToFixTab] = useState<"active" | "history">("active");
  const [howToFixPage, setHowToFixPage] = useState(1);
  const [howToFixItems, setHowToFixItems] = useState<WalletThreatItem[]>([]);
  const [howToFixMeta, setHowToFixMeta] = useState<ActiveThreatsMeta | ThreatHistoryMeta | null>(null);
  const [threatActionId, setThreatActionId] = useState<string | null>(null);
  const [verifyAllLoading, setVerifyAllLoading] = useState(false);
  const [threatActionFeedback, setThreatActionFeedback] = useState<string | null>(null);
  const [activeThreatsCount, setActiveThreatsCount] = useState(0);
  const [threatListRefreshKey, setThreatListRefreshKey] = useState(0);

  const refreshHealthAndSummary = useCallback(async () => {
    if (!address?.trim()) return;
    const [health, freshSummary, active] = await Promise.all([
      refreshWalletHealth(address),
      getDashboardSummary(address),
      getActiveThreats(address, 50),
    ]);
    if (health?.security_status) {
      setSummary((prev) =>
        prev
          ? { ...prev, security_status: health.security_status }
          : freshSummary
      );
    } else if (freshSummary) {
      setSummary(freshSummary);
    }
    if (active) {
      setActiveThreatsCount(active.meta.count);
    }
  }, [address]);

  const handleResolveThreat = async (threatId: string) => {
    if (!address?.trim()) return;
    setThreatActionId(threatId);
    setThreatActionFeedback(null);
    try {
      const res = await resolveThreat(address, threatId, "Fixed via SenseiGuard dashboard");
      if (res?.success !== false) {
        await refreshHealthAndSummary();
        setThreatListRefreshKey((k) => k + 1);
        if (howToFixModalOpen) {
          setHowToFixPage(1);
          setHowToFixTab("active");
        }
      }
    } finally {
      setThreatActionId(null);
    }
  };

  const handleDismissThreat = async (threatId: string) => {
    if (!address?.trim()) return;
    setThreatActionId(threatId);
    setThreatActionFeedback(null);
    try {
      const res = await dismissThreat(address, threatId, "dismissed_by_user");
      if (res?.success !== false) {
        await refreshHealthAndSummary();
        setThreatListRefreshKey((k) => k + 1);
        if (howToFixModalOpen) {
          setHowToFixPage(1);
        }
      }
    } finally {
      setThreatActionId(null);
    }
  };

  const handleVerifyThreat = async (threatId: string) => {
    if (!address?.trim()) return;
    console.log('[Wallet Security] Verify fix clicked:', {
      threatId,
      walletAddress: address.trim(),
    });
    setThreatActionId(threatId);
    setThreatActionFeedback(null);
    try {
      const res = await verifyThreat(address, threatId);
      console.log('[Wallet Security] Verify fix result:', res);
      if (!res) {
        setThreatActionFeedback("No response from verify API. Check console for details.");
        return;
      }
      if (res.success === false) {
        setThreatActionFeedback(res.message || "Verification failed. Try again.");
        return;
      }
      const resolved = res?.data?.resolved;
      const verified = res?.data?.verified;
      if (resolved) {
        setThreatActionFeedback("Fix verified — threat resolved.");
      } else if (verified === false) {
        setThreatActionFeedback(res?.data?.message || "On-chain check did not confirm the fix yet.");
      } else {
        setThreatActionFeedback(res?.data?.message || res?.message || "Verification complete.");
      }
      await refreshHealthAndSummary();
      setThreatListRefreshKey((k) => k + 1);
    } finally {
      setThreatActionId(null);
    }
  };

  const handleVerifyAllThreats = async () => {
    if (!address?.trim()) return;
    setVerifyAllLoading(true);
    setThreatActionFeedback(null);
    try {
      const res = await verifyAllThreats(address);
      if (res?.success === false) {
        setThreatActionFeedback(res.message || "Verify-all failed. Try again.");
        return;
      }
      const resolved = res?.data?.resolved_count ?? 0;
      const stillOpen = res?.data?.still_open_count;
      if (resolved > 0) {
        setThreatActionFeedback(`${resolved} issue(s) verified and resolved.${stillOpen != null ? ` ${stillOpen} still open.` : ""}`);
      } else {
        setThreatActionFeedback(res?.data?.still_open_count
          ? "No issues auto-resolved yet. Complete the fix steps, then verify again."
          : "All open issues verified.");
      }
      await refreshHealthAndSummary();
      setThreatListRefreshKey((k) => k + 1);
      setHowToFixPage(1);
    } finally {
      setVerifyAllLoading(false);
    }
  };

  const handleRecordRemediation = async (item: WalletThreatItem) => {
    if (!address?.trim()) return;
    const payload = inferThreatRemediation(item);
    if (!payload) {
      setThreatActionFeedback("No automated action mapping for this threat type.");
      return;
    }
    setThreatActionId(item.id);
    setThreatActionFeedback(null);
    try {
      const res = await recordThreatRemediationAction(address, item.id, payload);
      if (res?.success === false) {
        setThreatActionFeedback(res.message || "Could not record action.");
        return;
      }
      setThreatActionFeedback("Action recorded. Run verify to confirm on-chain.");
      setThreatListRefreshKey((k) => k + 1);
    } finally {
      setThreatActionId(null);
    }
  };

  const openAnalyzeTxModal = () => {
    setAnalyzeTxResult(null);
    setAnalyzeTxError(null);
    setAnalyzeTxTo("");
    setAnalyzeTxValue("");
    setAnalyzeTxData("");
    setAnalyzeTxChainId("");
    setAnalyzeTxModalOpen(true);
  };

  const openRiskyTokensModal = () => {
    setRiskyTokensList(null);
    setRiskyTokensModalOpen(true);
  };

  const runAnalyzeTransaction = () => {
    const walletAddress = address?.trim();
    if (!walletAddress) {
      setAnalyzeTxError("Connect your wallet first.");
      return;
    }
    const to = analyzeTxTo.trim();
    if (!to) {
      setAnalyzeTxError("Enter the recipient address (to).");
      return;
    }
    const chainId = parseInt(analyzeTxChainId.trim(), 10);
    if (!analyzeTxChainId.trim() || Number.isNaN(chainId)) {
      setAnalyzeTxError("Enter a valid chain ID.");
      return;
    }
    setAnalyzeTxError(null);
    setAnalyzeTxLoading(true);
    setAnalyzeTxResult(null);
    analyzeTransaction({
      wallet_address: walletAddress,
      to,
      value: analyzeTxValue.trim() || "0",
      data: analyzeTxData.trim() || "0x",
      chain_id: chainId,
    })
      .then((data) => {
        setAnalyzeTxResult(data ?? null);
        if (!data) setAnalyzeTxError("Analysis failed. Please try again.");
      })
      .catch(() => setAnalyzeTxError("Request failed. Please try again."))
      .finally(() => setAnalyzeTxLoading(false));
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

  useEffect(() => {
    if (!rescanModalOpen) return;
    setRescanProgress(0);
    const interval = setInterval(() => {
      setRescanProgress((p) => (p >= 100 ? 100 : p + 2));
    }, 120);
    return () => clearInterval(interval);
  }, [rescanModalOpen]);

  useEffect(() => {
    if (!address) {
      setSummary(null);
      setActiveThreatsCount(0);
      return;
    }
    setSummaryLoading(true);
    getDashboardSummary(address)
      .then(setSummary)
      .finally(() => setSummaryLoading(false));
    getActiveThreats(address, 50).then((res) => {
      if (res) {
        setActiveThreatsCount(res.meta.count);
      }
    });
  }, [address]);

  useEffect(() => {
    setWeakEmergencyModalOpen(false);
    setWeakEmergencyModalEvaluated(false);
  }, [address]);

  useEffect(() => {
    if (weakEmergencyModalEvaluated || summaryLoading || !summary) return;
    const status = String(summary.security_status?.status || "").trim().toLowerCase();
    if (status === "weak") {
      setWeakEmergencyModalOpen(true);
    }
    setWeakEmergencyModalEvaluated(true);
  }, [summary, summaryLoading, weakEmergencyModalEvaluated]);

  useEffect(() => {
    if (!address) {
      setMetrics(null);
      return;
    }
    setMetricsLoading(true);
    getDashboardMetrics(address)
      .then((data) => setMetrics(data ?? null))
      .finally(() => setMetricsLoading(false));
  }, [address]);

  useEffect(() => {
    if (!address) {
      setApprovals(null);
      return;
    }
    setApprovalsLoading(true);
    getDashboardApprovals(address, approvalPeriod)
      .then((data) => setApprovals(data ?? null))
      .finally(() => setApprovalsLoading(false));
  }, [address, approvalPeriod]);

  useEffect(() => {
    if (!address) {
      setWalletsList([]);
      setWalletsPagination(null);
      return;
    }
    setWalletsLoading(true);
    getWalletsForAddress(address)
      .then((res) => {
        if (res) {
          setWalletsList(res.data);
          setWalletsPagination(res.pagination);
        } else {
          setWalletsList([]);
          setWalletsPagination(null);
        }
      })
      .finally(() => setWalletsLoading(false));
  }, [address]);

  useEffect(() => {
    if (!address) {
      setTxList([]);
      setTxPagination(null);
      return;
    }
    setTxLoading(true);
    getTransactionMonitoring(address, txPage, 10)
      .then((res) => {
        if (res) {
          setTxList(res.data);
          setTxPagination(res.pagination);
        } else {
          setTxList([]);
          setTxPagination(null);
        }
      })
      .finally(() => setTxLoading(false));
  }, [address, txPage]);

  useEffect(() => {
    if (!address) {
      setControls(protectionSettingsToControls(null));
      return;
    }
    setProtectionLoading(true);
    getProtectionSettings(address)
      .then((data) => setControls(protectionSettingsToControls(data)))
      .finally(() => setProtectionLoading(false));
  }, [address]);

  useEffect(() => {
    if (!address) {
      setSecurityAlerts(null);
      return;
    }
    setSecurityAlertsLoading(true);
    getSecurityAlerts(address, 3)
      .then((data) => setSecurityAlerts(Array.isArray(data) ? data : null))
      .finally(() => setSecurityAlertsLoading(false));
  }, [address]);

  useEffect(() => {
    if (!address) {
      setAddressSafety(null);
      return;
    }
    setAddressSafetyLoading(true);
    getAddressSafety(address)
      .then((data) => setAddressSafety(Array.isArray(data) ? data : null))
      .finally(() => setAddressSafetyLoading(false));
  }, [address]);

  useEffect(() => {
    if (!riskyTokensModalOpen || !address?.trim()) return;
    setRiskyTokensLoading(true);
    setRiskyTokensList(null);
    getRiskyTokens(address, 20)
      .then((list) => setRiskyTokensList(list))
      .finally(() => setRiskyTokensLoading(false));
  }, [riskyTokensModalOpen, address]);

  useEffect(() => {
    if (!howToFixModalOpen) return;
    setThreatActionFeedback(null);
  }, [howToFixModalOpen, howToFixTab]);

  useEffect(() => {
    if (!howToFixModalOpen) return;
    if (!address?.trim()) {
      setHowToFixItems([]);
      setHowToFixMeta({ count: 0, high_priority_count: 0 });
      setHowToFixError("Connect your wallet to load fix guidance.");
      return;
    }

    setHowToFixLoading(true);
    setHowToFixError(null);

    if (howToFixTab === "history") {
      getThreatHistory(address, howToFixPage, HOW_TO_FIX_PER_PAGE)
        .then((res) => {
          if (!res) {
            setHowToFixItems([]);
            setHowToFixMeta({ page: 1, per_page: HOW_TO_FIX_PER_PAGE, total: 0 });
            setHowToFixError("Unable to load threat history right now.");
            return;
          }
          setHowToFixItems(res.data);
          setHowToFixMeta(res.meta);
        })
        .catch(() => {
          setHowToFixItems([]);
          setHowToFixMeta({ page: 1, per_page: HOW_TO_FIX_PER_PAGE, total: 0 });
          setHowToFixError("Unable to load threat history right now.");
        })
        .finally(() => setHowToFixLoading(false));
      return;
    }

    getActiveThreats(address, 50)
      .then((res) => {
        if (!res) {
          setHowToFixItems([]);
          setHowToFixMeta({ count: 0, high_priority_count: 0 });
          setHowToFixError("Unable to load active issues right now.");
          return;
        }
        const totalPages = Math.max(1, Math.ceil((res.meta.count || 0) / HOW_TO_FIX_PER_PAGE));
        if (howToFixPage > totalPages) {
          setHowToFixPage(totalPages);
          return;
        }
        const pageData = res.data.slice((howToFixPage - 1) * HOW_TO_FIX_PER_PAGE, howToFixPage * HOW_TO_FIX_PER_PAGE);
        setHowToFixItems(pageData);
        setHowToFixMeta(res.meta);
      })
      .catch(() => {
        setHowToFixItems([]);
        setHowToFixMeta({ count: 0, high_priority_count: 0 });
        setHowToFixError("Unable to load active issues right now.");
      })
      .finally(() => setHowToFixLoading(false));
  }, [howToFixModalOpen, address, howToFixPage, howToFixTab, threatListRefreshKey]);

  useEffect(() => {
    if (!selectedWallet?.address) {
      setWalletModalData(null);
      return;
    }
    setWalletModalTab("details");
    setWalletModalData(null);
    setWalletModalLoading(true);
    walletService
      .getWalletModal(selectedWallet.address)
      .then((data) => setWalletModalData(data ?? null))
      .finally(() => setWalletModalLoading(false));
  }, [selectedWallet?.address]);

  useEffect(() => {
    if (!rescanModalOpen || !address || scanTriggered) return;
    setScanTriggered(true);
    setScanInProgress(true);
    runFullScan(address)
      .then(async (data) => {
        if (data) {
          setScanResult(data);
          await refreshWalletHealth(address);
          setSummary((prev) =>
            prev
              ? {
                  ...prev,
                  security_status: {
                    ...prev.security_status,
                    score: data.score,
                    status: data.status,
                    last_scan_at: data.scanned_at,
                  },
                }
              : prev
          );
          getDashboardSummary(address).then((fresh) => fresh && setSummary(fresh));
          getActiveThreats(address, 50).then((active) => {
            if (active) {
              setActiveThreatsCount(active.meta.count);
            }
          });
        }
      })
      .finally(() => setScanInProgress(false));
  }, [rescanModalOpen, address, scanTriggered]);

  const closeRescanModal = () => {
    setScanTriggered(false);
    setScanResult(null);
    setRescanModalOpen(false);
  };

  const toggleControl = async (id: string) => {
    const control = controls.find((c) => c.id === id);
    if (!control || !address) return;
    const nextValue = !control.on;
    setProtectionSavingId(id);
    if (id === "emergency-lock") {
      const res = await setEmergencyLock(address, nextValue, []);
      setProtectionSavingId(null);
      if (res) {
        setControls((prev) => prev.map((c) => (c.id === "emergency-lock" ? { ...c, on: res.emergency_lock } : c)));
        setProtectionApiResponse({
          controlLabel: control.label,
          enabled: Boolean(res.emergency_lock),
          response: res,
          updatedAt: new Date().toISOString(),
        });
      } else {
        setControls((prev) => prev.map((c) => (c.id === id ? { ...c, on: !c.on } : c)));
        setProtectionApiResponse({
          controlLabel: control.label,
          enabled: nextValue,
          response: { success: false, message: "Failed to update emergency lock setting." },
          updatedAt: new Date().toISOString(),
        });
      }
      return;
    }
    const apiKey = id === "auto-scan" ? "auto_security_scan" : id === "high-risk" ? "high_risk_tx_warnings" : id === "approval" ? "new_approval_alerts" : id === "dapp" ? "new_dapp_connection_alerts" : "auto_block_high_risk";
    const payload = { [apiKey]: nextValue };
    const updated = await updateProtectionSettings(address, payload);
    setProtectionSavingId(null);
    if (updated) {
      setControls(protectionSettingsToControls(updated));
      setProtectionApiResponse({
        controlLabel: control.label,
        enabled: nextValue,
        response: updated,
        updatedAt: new Date().toISOString(),
      });
    } else {
      setControls((prev) => prev.map((c) => (c.id === id ? { ...c, on: !c.on } : c)));
      setProtectionApiResponse({
        controlLabel: control.label,
        enabled: nextValue,
        response: { success: false, message: "Failed to update protection setting." },
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="rounded-none lg:rounded-2xl bg-transparent lg:bg-blue-950/25 border-0 lg:border border-blue-900/40 p-6 space-y-6">
      {/* Top row: Security Status + 4 metric cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
        {/* Security Status - mobile: match dashboard UI */}
        <div className="lg:hidden -mx-6 w-[calc(100%+3rem)] rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-slate-700/80 p-5 flex flex-col shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Image src={vectorIcon} alt="" width={20} height={20} className="w-5 h-5 opacity-90" />
              <h2 className="text-base font-semibold text-white">Security Status</h2>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative w-32 h-32 shrink-0 rounded-full gauge-emboss-inset">
              <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 36 36">
                <defs>
                  <radialGradient id="wsMobileProgressGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#4066FF" />
                    <stop offset="100%" stopColor="#0026FF" />
                  </radialGradient>
                  <filter id="wsMobileArcGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path fill="none" stroke="currentColor" strokeWidth="3.5" className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path fill="none" stroke="url(#wsMobileProgressGrad)" strokeWidth="3.5" strokeDasharray={`${summary?.security_status?.score ?? 0}, 100`} strokeLinecap="round" filter="url(#wsMobileArcGlow)" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
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
            <button type="button" onClick={() => setRescanModalOpen(true)} className="rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white text-sm font-medium px-5 py-2.5 transition">Rescan</button>
          </div>
        </div>

        {/* Security Status - desktop */}
        <div className="hidden lg:flex rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-slate-700/80 p-5 flex-col shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.06)] max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            {SECURITY_STATUS_ICON}
            <h2 className="text-lg font-semibold text-white">Security Status</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1">
            <div className="flex flex-col items-center sm:items-start shrink-0">
              <div
                className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden"
                style={{
                  background: "radial-gradient(ellipse 75% 75% at 50% 50%, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 50%, rgba(12, 20, 45, 1) 100%)",
                }}
              >
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <defs>
                    <radialGradient id="wsProgressGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </radialGradient>
                    <filter id="wsBlueGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
                      <feFlood floodColor="#3b82f6" floodOpacity="0.6" result="glow" />
                      <feComposite in="glow" in2="blur" operator="in" result="softGlow" />
                      <feMerge>
                        <feMergeNode in="softGlow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Ring track (unfilled) – dark grey */}
                  <path
                    fill="none"
                    stroke="#334155"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress arc – bright blue with glow */}
                  <path
                    fill="none"
                    stroke="url(#wsProgressGrad)"
                    strokeWidth="3.5"
                    strokeDasharray={`${summary?.security_status?.score ?? 0}, 100`}
                    strokeLinecap="round"
                    filter="url(#wsBlueGlow)"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-semibold text-slate-300">
                  <span className="inline-flex items-baseline justify-center gap-0.5">
                    <span className="text-4xl sm:text-5xl tracking-tight">{summaryLoading || summary?.security_status?.score == null ? "—" : summary.security_status.score}</span>
                    <span className="text-2xl sm:text-3xl">%</span>
                  </span>
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col sm:mt-12">
              <p className="text-sm text-slate-300">
                Status: <span className="inline-flex items-center justify-center min-w-[5rem] px-4 py-1 rounded-lg bg-[#0026FF] text-white font-medium ml-2 capitalize">{summary?.security_status?.status ?? "—"}</span>
              </p>
              <p className="text-base text-slate-400 mt-2">{summary?.security_status?.message ?? ""}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
            <p className="text-base text-slate-400">Last Scan: {formatLastScan(summary?.security_status?.last_scan_at ?? null)}</p>
            <button
              type="button"
              onClick={() => setRescanModalOpen(true)}
              className="rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-base font-medium px-6 py-3 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90 shrink-0"
            >
              Rescan
            </button>
          </div>
        </div>

        {/* Four metric cards - mobile: same alignment as dashboard 4-card grid */}
        <div className="lg:hidden grid grid-cols-2 gap-3 -mx-6 w-[calc(100%+3rem)]">
          <MetricCard mobile icon={<Image src={alertIcon} alt="" width={28} height={28} className="w-7 h-7 shrink-0 object-contain" />} title="Malicious Transaction" value={metricsLoading ? "—" : (metrics ? String(metrics.malicious_transaction.value) : "0")} change={metrics ? formatMetricChange(metrics.malicious_transaction.change_percent) : "—"} titleClassName="text-lg font-semibold" action={<button type="button" onClick={openAnalyzeTxModal} className="rounded bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white font-medium transition">Analyze transaction</button>} />
          <MetricCard mobile icon={<Image src={scanIcon} alt="" width={28} height={28} className="w-7 h-7 shrink-0 object-contain" />} title="Phishing Indicators" value={metricsLoading ? "—" : (metrics ? String(metrics.phishing_indicators.value) : "0")} change={metrics ? formatMetricChange(metrics.phishing_indicators.change_percent) : "—"} titleClassName="text-lg font-semibold" />
          <MetricCard mobile icon={WARN_ICON} title="Risky Tokens" value={metricsLoading ? "—" : (metrics ? String(metrics.risky_tokens.value) : "0")} change={metrics ? formatMetricChange(metrics.risky_tokens.change_percent) : "—"} titleClassName="text-lg font-semibold" action={<button type="button" onClick={openRiskyTokensModal} className="rounded bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white font-medium transition">View risky tokens</button>} />
          <MetricCard mobile icon={SHIELD_ICON} title="Active Threat level" value={metricsLoading ? "—" : (metrics ? String(metrics.active_threat_level.value) : "Low")} change={metrics ? formatMetricChange(metrics.active_threat_level.change_percent) : "—"} titleClassName="text-lg font-semibold" />
        </div>
        {/* Four metric cards - desktop */}
        <div className="hidden lg:grid grid-cols-2 gap-4">
          <MetricCard icon={<Image src={alertIcon} alt="" width={28} height={28} className="w-7 h-7 shrink-0 object-contain" />} title="Malicious Transaction" value={metricsLoading ? "—" : (metrics ? String(metrics.malicious_transaction.value) : "0")} change={metrics ? formatMetricChange(metrics.malicious_transaction.change_percent) : "—"} titleClassName="text-lg font-semibold" action={<button type="button" onClick={openAnalyzeTxModal} className="rounded bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white font-medium transition text-sm px-4 py-2.5">Analyze transaction</button>} />
          <MetricCard icon={<Image src={scanIcon} alt="" width={28} height={28} className="w-7 h-7 shrink-0 object-contain" />} title="Phishing Indicators" value={metricsLoading ? "—" : (metrics ? String(metrics.phishing_indicators.value) : "0")} change={metrics ? formatMetricChange(metrics.phishing_indicators.change_percent) : "—"} titleClassName="text-lg font-semibold" />
          <MetricCard icon={WARN_ICON} title="Risky Tokens" value={metricsLoading ? "—" : (metrics ? String(metrics.risky_tokens.value) : "0")} change={metrics ? formatMetricChange(metrics.risky_tokens.change_percent) : "—"} titleClassName="text-lg font-semibold" action={<button type="button" onClick={openRiskyTokensModal} className="rounded bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white font-medium transition text-sm px-4 py-2.5">View risky tokens</button>} />
          <MetricCard icon={SHIELD_ICON} title="Active Threat level" value={metricsLoading ? "—" : (metrics ? String(metrics.active_threat_level.value) : "Low")} change={metrics ? formatMetricChange(metrics.active_threat_level.change_percent) : "—"} titleClassName="text-lg font-semibold" />
        </div>
      </div>

      {/* Bottom row: Approval & Permission, Connected networks, Transaction monitoring */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr_1fr] gap-4">
        {/* Approval & Permission - mobile: list layout matching reference */}
        <div className="xl:hidden -mx-6 w-[calc(100%+3rem)] rounded-2xl border border-transparent flex flex-col min-h-[200px] p-5" style={{ backgroundColor: "#191D35" }}>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-700/80 border border-slate-600/60 shrink-0 overflow-hidden p-1">
                <Image src={vectorIcon} alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
              </span>
              <h2 className="text-sm font-semibold text-white truncate">Approval & Permission</h2>
            </div>
            <div className="relative flex items-center shrink-0">
              <select value={approvalPeriod} onChange={(e) => setApprovalPeriod(e.target.value)} className="rounded-lg border text-white text-xs font-medium pl-2.5 pr-7 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-500 min-w-0 whitespace-nowrap" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
                <option value="this_month">This month</option>
                <option value="last_month">Last month</option>
                <option value="last_3_months">Last 3 months</option>
              </select>
              <svg className="absolute right-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
            {approvalsLoading ? (
              <p className="py-6 text-center text-slate-400 text-sm">Loading…</p>
            ) : !approvals || approvals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <p className="text-slate-400 text-sm font-medium">No approvals in this period</p>
                <p className="text-slate-500 text-xs mt-1 text-center">Token approvals will appear here when detected</p>
              </div>
            ) : (
              approvals.map((row, i) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedApprovalIndex(i)}
                  className="w-full flex items-center justify-between gap-4 py-3 px-0 text-left rounded-lg transition-colors hover:bg-slate-800/50 active:bg-slate-800/70"
                >
                  <div className="min-w-0 flex flex-col items-start gap-0.5">
                    <span className="font-mono text-sm font-medium text-white truncate max-w-[180px]">{truncateAddress(row.contract_address)}</span>
                    <span className="text-xs text-white/90">{capitalize(row.approval_type)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className={`text-sm font-medium ${capitalize(row.risk_level) === "Low" ? "text-[#32BB1D]" : capitalize(row.risk_level) === "Medium" ? "text-amber-500" : "text-[#F00500]"}`}>{capitalize(row.risk_level)}</span>
                    <span className="text-xs text-white/80 whitespace-nowrap">{formatApprovalDateShort(row.detected_at)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Approval & Permission - desktop: table */}
        <div className="hidden xl:flex rounded-2xl border p-5 flex-col min-h-[320px] shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {APPROVAL_HEADER_ICON}
              <h2 className="text-lg font-normal text-white">Approval & Permission</h2>
            </div>
            <div className="relative flex items-center">
              <select value={approvalPeriod} onChange={(e) => setApprovalPeriod(e.target.value)} className="rounded-lg border text-white text-sm font-medium pl-3 pr-8 py-2.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-500 min-w-[10rem]" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
                <option value="this_month">This month</option>
                <option value="last_month">Last month</option>
                <option value="last_3_months">Last 3 months</option>
              </select>
              <svg className="absolute right-2.5 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="overflow-x-auto flex-1 min-h-0 overflow-y-auto rounded-lg">
            <table className="w-full text-base border-separate" style={{ borderSpacing: "0 10px" }}>
              <thead style={{ backgroundColor: "#25283D" }} className="sticky top-0 z-10">
                <tr className="text-slate-300">
                  <th className="text-left py-4 px-5 font-medium rounded-tl-lg rounded-bl-lg whitespace-nowrap">Contract Address</th>
                  <th className="text-left py-4 px-5 font-medium whitespace-nowrap">Approval type</th>
                  <th className="text-left py-4 px-5 font-medium whitespace-nowrap">Risk level</th>
                  <th className="text-left py-4 px-5 font-medium whitespace-nowrap">Date</th>
                  <th className="w-12 py-4 px-5 rounded-tr-lg rounded-br-lg" />
                </tr>
              </thead>
              <tbody>
                {approvalsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-5 text-center text-slate-400 text-sm">Loading…</td>
                  </tr>
                ) : !approvals || approvals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-5 align-top">
                      <div className="flex flex-col items-center justify-center py-6 px-4 min-h-[180px]">
                        <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(64, 102, 255, 0.12)", border: "1px solid rgba(64, 102, 255, 0.25)" }}>
                          <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">No approvals in this period</p>
                        <p className="text-slate-500 text-xs mt-1 max-w-[220px] text-center">Token approvals will appear here when detected</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  approvals.map((row, i) => (
                    <tr
                      key={row.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedApprovalIndex(i)}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedApprovalIndex(i)}
                      className="text-slate-300 hover:bg-slate-700/30 transition-colors bg-[#25283D]/50 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg cursor-pointer"
                    >
                      <td className="py-4 px-5 font-mono text-slate-200 whitespace-nowrap min-w-[7rem]">{row.contract_address}</td>
                      <td className="py-4 px-5 whitespace-nowrap">{capitalize(row.approval_type)}</td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`font-medium ${capitalize(row.risk_level) === "Low" ? "text-[#32BB1D]" : capitalize(row.risk_level) === "Medium" ? "text-amber-500" : "text-[#F00500]"}`}>{capitalize(row.risk_level)}</span>
                      </td>
                      <td className="py-4 px-5 text-slate-400 whitespace-nowrap">{formatApprovalDate(row.detected_at)}</td>
                      <td className="py-4 px-5">
                        <svg className="w-4 h-4 text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Connected networks - mobile: card list + pagination */}
        <div className="xl:hidden -mx-6 w-[calc(100%+3rem)] rounded-2xl flex flex-col min-h-[200px] p-5" style={{ backgroundColor: "#191D35" }}>
          <div className="flex items-center gap-1.5 mb-4">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-700/80 border border-slate-600/60 shrink-0 overflow-hidden p-1">
              <Image src={vectorIcon} alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
            </span>
            <h2 className="text-sm font-semibold text-white">Connected networks</h2>
          </div>
          <ul className="space-y-3 flex-1 min-h-0 overflow-y-auto">
            {walletsLoading ? (
              <li className="py-6 text-center text-slate-400 text-sm">Loading…</li>
            ) : walletsList.length === 0 ? (
              <li className="flex flex-col items-center justify-center py-8 px-4">
                <p className="text-slate-400 text-sm font-medium">No connected networks</p>
                <p className="text-slate-500 text-xs mt-1 text-center">Your networks will appear after you connect</p>
              </li>
            ) : (
              walletsList.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-600/50 bg-slate-800/60 shadow-sm transition"
                >
                  <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                    <Image src={getWalletLogoUrl(w)} alt="" width={32} height={32} className="w-8 h-8 rounded object-contain" unoptimized={getWalletLogoUrl(w).startsWith("http")} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{w.provider} • {w.currency}</p>
                    <p className="text-xs text-slate-400 font-mono truncate mt-0.5">{w.address}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
          {walletsPagination && walletsPagination.total > walletsPagination.per_page && (
            <div className="flex gap-2 mt-4 justify-center shrink-0">
              {Array.from({ length: Math.ceil(walletsPagination.total / walletsPagination.per_page) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {}}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${walletsPagination.page === n ? "bg-[#4066FF] text-white" : "bg-slate-700/60 text-slate-400"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => connectNetworksModal?.openConnectNetworksModal()}
            className="mt-4 w-full rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-3 transition shrink-0"
          >
            Connect other networks
          </button>
        </div>

        {/* Connected networks - desktop */}
        <div className="hidden xl:flex rounded-2xl border p-5 flex-col min-h-[320px] shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center gap-2 mb-4">
            {APPROVAL_HEADER_ICON}
            <h2 className="text-lg font-normal text-white">Connected networks</h2>
          </div>
          <ul className="space-y-3 flex-1 overflow-y-auto">
            {walletsLoading ? (
              <li className="py-6 text-center text-slate-400 text-sm">Loading…</li>
            ) : walletsList.length === 0 ? (
              <li className="flex flex-col items-center justify-center py-8 px-4 min-h-[200px]">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(64, 102, 255, 0.12)", border: "1px solid rgba(64, 102, 255, 0.25)" }}>
                  <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">No connected networks</p>
                <p className="text-slate-500 text-xs mt-1 max-w-[200px] text-center">Your networks will appear after you connect</p>
              </li>
            ) : (
              walletsList.map((w) => (
                <li
                  key={w.id}
                  className="emboss-inset-3d-input flex items-center gap-3 p-3 rounded-lg border transition" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}
                >
                  <span className="w-8 h-8 rounded-md bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <Image src={getWalletLogoUrl(w)} alt="" width={28} height={28} className="w-7 h-7 rounded object-contain" unoptimized={getWalletLogoUrl(w).startsWith("http")} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{w.provider} • {w.currency}</p>
                    <p className="text-xs text-slate-400 font-mono truncate">{w.address}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
          <button
            type="button"
            onClick={() => connectNetworksModal?.openConnectNetworksModal()}
            className="mt-4 w-full rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-3 transition shrink-0"
          >
            Connect other networks
          </button>
        </div>

        {/* Transaction monitoring - mobile: card list + pagination */}
        <div className="xl:hidden -mx-6 w-[calc(100%+3rem)] rounded-2xl flex flex-col min-h-[200px] p-5" style={{ backgroundColor: "#191D35" }}>
          <div className="flex items-center gap-1.5 mb-4">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-700/80 border border-slate-600/60 shrink-0 overflow-hidden p-1">
              <Image src={vectorIcon} alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
            </span>
            <h2 className="text-sm font-semibold text-white">Transaction monitoring</h2>
          </div>
          <ul className="space-y-3 flex-1 min-h-0 overflow-y-auto">
            {txLoading ? (
              <li className="py-6 text-center text-slate-400 text-sm">Loading…</li>
            ) : txList.length === 0 ? (
              <li className="flex flex-col items-center justify-center py-8 px-4">
                <p className="text-slate-400 text-sm font-medium">No transactions</p>
                <p className="text-slate-500 text-xs mt-1 text-center">Monitored transactions will appear here</p>
              </li>
            ) : (
              txList.map((t) => {
                const riskLabel = capitalize(t.risk_level);
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-600/50 bg-slate-800/60 shadow-sm">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{t.title}</p>
                    </div>
                    <span className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium bg-slate-700/80 text-white">
                      Risk: {riskLabel}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
          {txPagination && txPagination.total > txPagination.per_page && (
            <div className="flex gap-2 mt-4 justify-center shrink-0">
              {Array.from({ length: Math.ceil(txPagination.total / txPagination.per_page) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTxPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${txPage === n ? "bg-[#4066FF] text-white" : "bg-slate-700/60 text-slate-400"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Transaction monitoring - desktop */}
        <div className="hidden xl:flex rounded-2xl border p-5 flex-col min-h-[320px] shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center gap-2 mb-4">
            {APPROVAL_HEADER_ICON}
            <h2 className="text-lg font-normal text-white">Transaction monitoring</h2>
          </div>
          <ul className="space-y-3 flex-1 overflow-y-auto">
            {txLoading ? (
              <li className="py-6 text-center text-slate-400 text-sm">Loading…</li>
            ) : txList.length === 0 ? (
              <li className="flex flex-col items-center justify-center py-8 px-4 min-h-[200px]">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(64, 102, 255, 0.12)", border: "1px solid rgba(64, 102, 255, 0.25)" }}>
                  <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">No transactions</p>
                <p className="text-slate-500 text-xs mt-1 max-w-[200px] text-center">Monitored transactions will appear here</p>
              </li>
            ) : (
              txList.map((t) => {
                const riskLabel = capitalize(t.risk_level);
                const riskClass = riskLabel === "Low" ? "bg-slate-600/60 text-slate-300" : riskLabel === "Medium" ? "bg-slate-700 text-slate-200" : "bg-slate-800 text-slate-100";
                return (
                  <li key={t.id} className="emboss-inset-3d-input flex items-center justify-between gap-2 p-3 rounded-lg border transition" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
                    <span className="text-sm text-slate-300">{t.title}</span>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${riskClass}`}>
                      Risk: {riskLabel}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
          {txPagination && txPagination.total > txPagination.per_page && (
            <div className="flex gap-1 mt-3 justify-start">
              {Array.from({ length: Math.ceil(txPagination.total / txPagination.per_page) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTxPage(n)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${txPage === n ? "bg-[#4066FF] text-white" : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New section: Smart Wallet Scanner, Protection Control, Security Alerts + Address Safety */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr_1fr] gap-4">
        {/* Smart Wallet Scanner - mobile */}
        <div className="xl:hidden -mx-6 w-[calc(100%+3rem)] rounded-2xl flex flex-col p-5" style={{ backgroundColor: "#191D35" }}>
          <div className="flex items-center gap-1.5 mb-4">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-700/80 border border-slate-600/60 shrink-0 overflow-hidden p-1">
              <Image src={vectorIcon} alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
            </span>
            <h2 className="text-sm font-semibold text-white">Smart Wallet Scanner</h2>
          </div>
          <label className="text-sm text-white font-medium mb-2 block">Smart Wallet Link</label>
          <div className="flex gap-2 rounded-xl border mb-4 overflow-hidden" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
            <input
              type="text"
              placeholder="Enter Smart Contract Link"
              value={contractScannerAddress}
              onChange={(e) => setContractScannerAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runContractScan()}
              className="flex-1 min-w-0 bg-transparent text-white text-sm pl-3 py-3 focus:outline-none placeholder:text-slate-500"
            />
            <button
              type="button"
              disabled={scannerLoading || !contractScannerAddress.trim()}
              onClick={runContractScan}
              className="rounded-lg bg-[#4066FF] hover:bg-[#3355FF] disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-medium px-5 py-3 transition shrink-0 my-1 mr-1"
            >
              {scannerLoading ? "Scanning…" : "Scan"}
            </button>
          </div>
          {!lastContractScanResult ? (
            <p className="text-sm text-slate-500 py-3">Enter a contract address and click Scan.</p>
          ) : (
            <>
              <div className="rounded-xl border overflow-hidden mb-4" style={{ backgroundColor: "rgba(45, 55, 72, 0.9)", borderColor: "rgba(71, 85, 105, 0.5)" }}>
                <ul className="p-4 space-y-3">
                  {[
                    { label: "Trust Score", value: `${lastContractScanResult.trust_score}%`, trend: lastContractScanResult.trust_score >= 50 },
                    { label: "Critical Risk Flags", value: String(lastContractScanResult.critical_risk_flags) },
                    { label: "Token Controlled", value: lastContractScanResult.token_controlled || "—" },
                    { label: "OWNER / ADMIN", value: String(lastContractScanResult.owner_admin_count) },
                  ].map((m, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 py-1">
                      <span className="text-sm text-white">{m.label}</span>
                      <span className="text-sm font-medium text-white flex items-center gap-1">
                        {m.value}
                        {m.trend && (
                          <svg className="w-4 h-4 shrink-0" style={{ color: "#32BB1D" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                disabled={!lastContractScanResult?.scan_id}
                onClick={openScanDetailsModal}
                className="w-full rounded-xl border py-3 text-sm font-medium text-white bg-slate-700/80 border-slate-600/60 hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none transition"
              >
                View Details
              </button>
            </>
          )}
        </div>

        {/* Smart Wallet Scanner - desktop */}
        <div className="hidden xl:flex rounded-2xl border p-5 flex-col min-h-[320px] shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center gap-2 mb-4">
            {SECURITY_STATUS_ICON}
            <h2 className="text-lg font-normal text-white">Contract scanner <span className="text-sm italic text-slate-400">(Only supports Ethereum and BSC)</span></h2>
          </div>
          <div className="emboss-inset-3d-input flex gap-2 rounded-lg border mb-4" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
            <input
              type="text"
              placeholder="Enter contract address (0x...)"
              value={contractScannerAddress}
              onChange={(e) => setContractScannerAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runContractScan()}
              className="flex-1 min-w-0 bg-transparent text-white text-sm pl-3 py-3 focus:outline-none placeholder:text-slate-500"
            />
            <button
              type="button"
              disabled={scannerLoading || !contractScannerAddress.trim()}
              onClick={runContractScan}
              className="rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-medium px-5 py-3 transition shrink-0"
            >
              {scannerLoading ? "Scanning…" : "Scan"}
            </button>
          </div>
          <ul className="space-y-3 flex-1">
            {!lastContractScanResult ? (
              <li className="text-sm text-slate-500 py-2">Enter a contract address and click Scan.</li>
            ) : (
              [
                { label: "Trust Score", value: `${lastContractScanResult.trust_score}%`, trend: lastContractScanResult.trust_score >= 50 },
                { label: "Critical Risk Flags", value: String(lastContractScanResult.critical_risk_flags) },
                { label: "Token Controlled", value: lastContractScanResult.token_controlled || "—" },
                { label: "OWNER / ADMIN", value: String(lastContractScanResult.owner_admin_count) },
              ].map((m, i) => (
                <li key={i} className="emboss-inset-3d-input flex items-center justify-between gap-2 p-3 rounded-lg border" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
                  <span className="text-sm text-slate-400">{m.label}</span>
                  <span className="text-sm font-medium text-white flex items-center gap-1">
                    {m.value}
                    {m.trend && (
                      <svg className="w-4 h-4" style={{ color: "#32BB1D" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    )}
                  </span>
                </li>
              ))
            )}
          </ul>
          <button
            type="button"
            disabled={!lastContractScanResult?.scan_id}
            onClick={openScanDetailsModal}
            className="emboss-inset-3d-input mt-4 w-full rounded-lg border py-3 text-sm font-medium text-slate-300 hover:text-white disabled:opacity-50 disabled:pointer-events-none transition"
            style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}
          >
            View Details
          </button>
        </div>

        {/* Protection Control - mobile */}
        <div className="xl:hidden -mx-6 w-[calc(100%+3rem)] rounded-2xl flex flex-col p-5" style={{ backgroundColor: "#191D35" }}>
          <div className="flex items-center gap-1.5 mb-4">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-700/80 border border-slate-600/60 shrink-0 overflow-hidden p-1">
              <Image src={vectorIcon} alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
            </span>
            <h2 className="text-sm font-semibold text-white">Protection Control</h2>
          </div>
          <ul className="space-y-3 flex-1 min-h-0 overflow-y-auto">
            {protectionLoading ? (
              <li className="py-4 text-center text-slate-400 text-sm">Loading…</li>
            ) : (
              controls.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border shrink-0" style={{ backgroundColor: "#25283D", borderColor: "rgba(51, 65, 85, 0.6)" }}>
                  <span className="text-sm font-medium text-white">{c.label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={c.on}
                    disabled={protectionSavingId !== null}
                    onClick={() => toggleControl(c.id)}
                    className={`relative w-11 h-6 rounded-full transition shrink-0 disabled:opacity-60 disabled:pointer-events-none ${c.on ? "bg-[#4066FF]" : "bg-slate-600"}`}
                  >
                    <span
                      className="absolute top-1 w-4 h-4 rounded-full bg-white transition"
                      style={{ left: c.on ? "calc(100% - 20px)" : "4px" }}
                    />
                  </button>
                </li>
              ))
            )}
          </ul>
          {protectionApiResponse && (
            <div className="mt-4 rounded-xl border p-3" style={{ backgroundColor: "#25283D", borderColor: "rgba(51, 65, 85, 0.6)" }}>
              <p className="text-xs text-slate-300">
                API response: {protectionApiResponse.controlLabel} {protectionApiResponse.enabled ? "enabled" : "disabled"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Updated at {new Date(protectionApiResponse.updatedAt).toLocaleTimeString()}</p>
              <pre className="mt-2 text-[11px] leading-5 text-slate-200 whitespace-pre-wrap break-all">
                {JSON.stringify(protectionApiResponse.response, null, 2)}
              </pre>
            </div>
          )}
          <button
            type="button"
            className="mt-4 w-full rounded-xl border py-3 text-sm font-medium text-white transition"
            style={{ backgroundColor: "#25283D", borderColor: "rgba(71, 85, 105, 0.5)" }}
          >
            Add new control
          </button>
        </div>

        {/* Protection Control - desktop */}
        <div className="hidden xl:flex rounded-2xl border p-5 flex-col min-h-[320px] shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center gap-2 mb-4">
            {SECURITY_STATUS_ICON}
            <h2 className="text-lg font-normal text-white">Protection Control</h2>
          </div>
          <ul className="space-y-3 flex-1 min-h-0 overflow-y-auto">
            {protectionLoading ? (
              <li className="py-4 text-center text-slate-400 text-sm">Loading…</li>
            ) : (
              controls.map((c) => (
              <li key={c.id} className="emboss-inset-3d-input flex items-center justify-between gap-2 p-3 rounded-lg border shrink-0" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
                <span className="text-sm text-slate-300">{c.label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={c.on}
                  disabled={protectionSavingId !== null}
                  onClick={() => toggleControl(c.id)}
                  className={`relative w-11 h-6 rounded-full transition shrink-0 disabled:opacity-60 disabled:pointer-events-none ${c.on ? "bg-[#4066FF]" : "bg-slate-600"}`}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition"
                    style={{ left: c.on ? "calc(100% - 20px)" : "4px" }}
                  />
                </button>
              </li>
              ))
            )}
          </ul>
          {protectionApiResponse && (
            <div className="mt-4 rounded-lg border p-3" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
              <p className="text-xs text-slate-300">
                API response: {protectionApiResponse.controlLabel} {protectionApiResponse.enabled ? "enabled" : "disabled"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Updated at {new Date(protectionApiResponse.updatedAt).toLocaleTimeString()}</p>
              <pre className="mt-2 text-[11px] leading-5 text-slate-200 whitespace-pre-wrap break-all">
                {JSON.stringify(protectionApiResponse.response, null, 2)}
              </pre>
            </div>
          )}
          </div>

        {/* Security Alerts + Address Safety */}
        <div className="flex flex-col gap-4">
          {/* Security Alerts - mobile */}
          <div className="xl:hidden -mx-6 w-[calc(100%+3rem)] rounded-2xl flex flex-col p-5" style={{ backgroundColor: "#191D35" }}>
            <div className="flex items-center gap-1.5 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-700/80 border border-slate-600/60 shrink-0 overflow-hidden p-1">
                <Image src={vectorIcon} alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
              </span>
              <h2 className="text-sm font-semibold text-white">Security Alerts</h2>
            </div>
            {securityAlertsLoading ? (
              <p className="py-6 text-center text-slate-400 text-sm">Loading…</p>
            ) : !securityAlerts || securityAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <p className="text-slate-400 text-sm font-medium">No security alerts</p>
                <p className="text-slate-500 text-xs mt-1 text-center">Alerts will appear here when detected</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {securityAlerts.slice(0, 3).map((alert) => (
                  <li key={alert.id} className="flex items-stretch rounded-xl overflow-hidden border" style={{ backgroundColor: "#25283D", borderColor: "rgba(51, 65, 85, 0.6)" }}>
                    <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-bold text-white mb-1">{alert.title}</p>
                        {alert.type === "high_risk_approval" ? (
                          <p className="text-xs text-white/80 font-mono">Contract: {alert.contract_truncated}</p>
                        ) : (
                          <p className="text-xs text-white/80 line-clamp-2">{alert.body}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="mt-3 w-fit rounded-lg border py-2 px-4 text-xs font-medium text-white transition"
                        style={{ backgroundColor: "#1e293b", borderColor: "rgba(71, 85, 105, 0.5)" }}
                      >
                        View Details
                      </button>
                    </div>
                    <div className="w-[38%] min-w-[100px] flex items-center justify-center py-4 pr-2" style={{ backgroundColor: "rgba(30, 41, 59, 0.5)" }}>
                      <svg className="w-full h-14" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
                        {[0, 25, 50, 75, 100].map((x) => (
                          <line key={x} x1={x} y1="0" x2={x} y2="40" stroke="rgba(71, 85, 105, 0.35)" strokeWidth="0.4" />
                        ))}
                        <path d="M0,20 L12,28 L25,12 L37,25 L50,15 L62,28 L75,10 L87,22 L100,18" fill="none" stroke="#4066FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Security Alerts - desktop */}
          <div className="hidden xl:flex rounded-2xl border p-5 flex-col shadow-sm flex-1 min-h-[320px]" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
            <div className="flex items-center gap-2 mb-4">
              {SECURITY_STATUS_ICON}
              <h2 className="text-lg font-normal text-white">Security Alerts</h2>
            </div>
            {securityAlertsLoading ? (
              <p className="py-6 text-center text-slate-400 text-sm">Loading…</p>
            ) : !securityAlerts || securityAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 flex-1 min-h-[180px]">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(64, 102, 255, 0.12)", border: "1px solid rgba(64, 102, 255, 0.25)" }}>
                  <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">No security alerts</p>
                <p className="text-slate-500 text-xs mt-1 max-w-[220px] text-center">Alerts will appear here when detected</p>
              </div>
            ) : (
              <ul className="space-y-3 flex-1 overflow-y-auto hide-scrollbar">
                {securityAlerts.slice(0, 3).map((alert) => (
                  <li key={alert.id} className="emboss-inset-3d-input p-4 rounded-lg border" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
                    <p className="text-sm font-medium text-white mb-1">{alert.title}</p>
                    {alert.type === "high_risk_approval" ? (
                      <p className="text-xs text-slate-400 font-mono">Contract: {alert.contract_truncated}</p>
                    ) : (
                      <p className="text-xs text-slate-400">{alert.body}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span className="text-xs text-slate-500">{formatApprovalDate(alert.created_at)}</span>
                      {alert.type === "high_risk_approval" ? (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${alert.risk_score >= 70 ? "bg-[#F00500]/20 text-[#F00500]" : alert.risk_score >= 40 ? "bg-amber-500/20 text-amber-400" : "bg-[#32BB1D]/20 text-[#32BB1D]"}`}>
                          Risk: {alert.risk_score}
                        </span>
                      ) : (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${alert.severity === "high" ? "bg-[#F00500]/20 text-[#F00500]" : alert.severity === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-slate-600/60 text-slate-300"}`}>
                          {alert.severity}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Address Safety - mobile */}
          <div className="xl:hidden -mx-6 w-[calc(100%+3rem)] rounded-2xl flex flex-col p-5" style={{ backgroundColor: "#191D35" }}>
            <div className="flex items-center gap-1.5 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-700/80 border border-slate-600/60 shrink-0 overflow-hidden p-1">
                <Image src={vectorIcon} alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
              </span>
              <h2 className="text-sm font-semibold text-white">Address Safety</h2>
            </div>
            {addressSafetyLoading ? (
              <p className="py-6 text-center text-slate-400 text-sm">Loading…</p>
            ) : !addressSafety || addressSafety.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <p className="text-slate-400 text-sm font-medium">No addresses to show</p>
                <p className="text-slate-500 text-xs mt-1 text-center">Address safety data will appear here</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {addressSafety.map((a) => (
                  <li key={a.address} className="p-4 rounded-xl border" style={{ backgroundColor: "#25283D", borderColor: "rgba(51, 65, 85, 0.6)" }}>
                    <p className="text-sm font-mono text-white">{a.address_truncated}</p>
                    <p className="text-xs text-slate-400 mt-1">Safety Score: {a.safety_score}/100</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.risk_level}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Address Safety - desktop */}
          <div className="hidden xl:flex rounded-2xl border p-5 flex-col shadow-sm flex-1 min-h-[320px]" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
            <div className="flex items-center gap-2 mb-4">
              {SECURITY_STATUS_ICON}
              <h2 className="text-lg font-normal text-white">Address Safety</h2>
            </div>
            {addressSafetyLoading ? (
              <p className="py-6 text-center text-slate-400 text-sm">Loading…</p>
            ) : !addressSafety || addressSafety.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 flex-1 min-h-[180px]">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(64, 102, 255, 0.12)", border: "1px solid rgba(64, 102, 255, 0.25)" }}>
                  <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">No addresses to show</p>
                <p className="text-slate-500 text-xs mt-1 max-w-[220px] text-center">Address safety data will appear here</p>
              </div>
            ) : (
              <ul className="space-y-3 flex-1 overflow-y-auto">
                {addressSafety.map((a, i) => {
                  const riskKey = a.risk_level.toLowerCase().replace(/\s*risk\s*$/, "") || a.risk_level;
                  const riskClass = riskKey === "low" ? "bg-[#32BB1D]/20 text-[#32BB1D]" : riskKey === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-[#F00500]/20 text-[#F00500]";
                  return (
                    <li key={a.address} className="emboss-inset-3d-input flex items-center justify-between gap-2 p-3 rounded-lg border" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
                      <div className="min-w-0">
                        <p className="text-sm font-mono text-white truncate">{a.address_truncated}</p>
                        <p className="text-xs text-slate-400">Safety Score: {a.safety_score}/100</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${riskClass}`}>
                        {a.risk_level}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Security Tip + Emergency Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Security Tip - mobile */}
        <div className="lg:hidden -mx-6 w-[calc(100%+3rem)] rounded-2xl flex flex-col p-5" style={{ backgroundColor: "#191D35" }}>
          <div className="flex items-center gap-1.5 mb-4">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-700/80 border border-slate-600/60 shrink-0">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </span>
            <h2 className="text-sm font-semibold text-white">Security Tip</h2>
          </div>
          <h3 className="text-base font-bold text-white mb-2">Revoke What You Don&apos;t Use</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Old approvals stay active even when you stop using a dApp. Clearing them removes hidden access and keeps your wallet secure. 🔒
          </p>
          <div className="mt-4 flex items-end">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden shrink-0 p-1">
              <Image src={shieldIcon} alt="" width={80} height={80} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
        {/* Security Tip - desktop */}
        <div className="hidden lg:flex rounded-2xl border p-5 flex-col shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center gap-2 mb-4">
            {KEY_ICON}
            <h2 className="text-lg font-normal text-white">Security Tip</h2>
          </div>
          <div className="flex gap-4 flex-1">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white mb-2">Revoke What You Don&apos;t Use</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Old approvals stay active even when you stop using a dApp. Clearing them removes hidden access and keeps your wallet secure.
              </p>
            </div>
            <div className="shrink-0 w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden">
              <Image src={shieldIcon} alt="" width={80} height={80} className="w-20 h-20 object-contain" />
            </div>
          </div>
        </div>
        {/* Emergency Actions - mobile */}
        <div className="lg:hidden -mx-6 w-[calc(100%+3rem)] rounded-2xl overflow-hidden flex flex-col" style={{ backgroundColor: "#191D35" }}>
          <div className="p-5">
            <div className="flex items-center gap-1.5 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-700/80 border border-slate-600/60 shrink-0 overflow-hidden p-1">
                <Image src={vectorIcon} alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
              </span>
              <h2 className="text-sm font-semibold text-white">Emergency Actions</h2>
            </div>
            <div className="relative rounded-xl border overflow-hidden min-h-[120px] flex flex-col items-center justify-center py-6 px-4" style={activeThreatsCount > 0 ? { backgroundColor: "rgba(240, 5, 0, 0.06)", borderColor: "rgba(240, 5, 0, 0.25)", boxShadow: "inset 0 0 0 1px rgba(240, 5, 0, 0.08)" } : { backgroundColor: "rgba(34, 197, 94, 0.06)", borderColor: "rgba(34, 197, 94, 0.2)", boxShadow: "inset 0 0 0 1px rgba(34, 197, 94, 0.08)" }}>
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border ${activeThreatsCount > 0 ? "text-[#F00500] bg-[#F00500]/15 border-[#F00500]/30" : "text-[#22c55e] bg-[#22c55e]/15 border-[#22c55e]/30"}`}>
                  {activeThreatsCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#F00500] animate-pulse" />}
                  {activeThreatsCount > 0 ? `${activeThreatsCount} active` : "All clear"}
                </span>
              </div>
              {activeThreatsCount > 0 ? (
                <>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "rgba(240, 5, 0, 0.12)", border: "1px solid rgba(240, 5, 0, 0.35)" }}>
                    <svg className="w-7 h-7 text-[#F00500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">{activeThreatsCount} issue{activeThreatsCount !== 1 ? "s" : ""} need attention</p>
                  <button
                    type="button"
                    onClick={() => { setHowToFixTab("active"); setHowToFixPage(1); setHowToFixModalOpen(true); }}
                    className="mt-3 rounded-lg px-4 py-2 text-xs font-semibold text-white"
                    style={{ background: "linear-gradient(to bottom, #4066FF 0%, #0026FF 100%)" }}
                  >
                    Review & fix
                  </button>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.35)" }}>
                    <svg className="w-7 h-7 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">No actions required</p>
                  <p className="text-xs text-slate-400 mt-0.5 text-center max-w-[200px]">Your wallet is secure. We&apos;ll alert you if anything needs attention.</p>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Emergency Actions - desktop */}
        <div className="hidden lg:flex rounded-2xl border p-5 flex-col min-h-[140px] shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center gap-2">
            {SECURITY_STATUS_ICON}
            <h2 className="text-lg font-normal text-white">Emergency Actions</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            {activeThreatsCount > 0 ? (
              <>
                <p className="text-sm text-[#F00500] font-medium">{activeThreatsCount} active issue{activeThreatsCount !== 1 ? "s" : ""}</p>
                <button
                  type="button"
                  onClick={() => { setHowToFixTab("active"); setHowToFixPage(1); setHowToFixModalOpen(true); }}
                  className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(to bottom, #4066FF 0%, #0026FF 100%)" }}
                >
                  Review & fix
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-500">No actions required</p>
            )}
          </div>
        </div>
      </div>

      {/* Rescan modal - portaled to body */}
      {weakEmergencyModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }}
          onClick={() => setWeakEmergencyModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden"
            style={{ backgroundColor: "#191D35", borderColor: "rgba(240, 5, 0, 0.45)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5" style={{ backgroundColor: "#191D35" }}>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F00500]/20 border border-[#F00500]/40">
                  <svg className="w-5 h-5 text-[#F00500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v3m0 4h.01M10.29 3.86l-8.03 14a2 2 0 001.74 3h16.06a2 2 0 001.74-3l-8.03-14a2 2 0 00-3.48 0z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">Emergency Security Alert</h2>
                  <p className="text-xs text-[#F00500] uppercase tracking-wide">Wallet status is weak</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWeakEmergencyModalOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 transition"
                aria-label="Close emergency alert"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                Your wallet is currently in a weak protection state. Immediate action is recommended to reduce exposure to malicious approvals, scam tokens, and unsafe interactions.
              </p>
              <div className="rounded-xl border border-[#F00500]/35 bg-[#F00500]/10 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-300 mb-1">Current status message</p>
                <p className="text-sm text-white">{summary?.security_status?.message || "High-risk behavior detected. Run an immediate security rescan."}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-[#15182A] px-4 py-3">
                <span className="text-sm text-slate-400">Security score</span>
                <span className="text-lg font-semibold text-white">
                  {summary?.security_status?.score != null ? `${summary.security_status.score}%` : "—"}
                </span>
              </div>
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button
                type="button"
                onClick={() => setWeakEmergencyModalOpen(false)}
                className="flex-1 rounded-xl font-medium text-white py-3 px-4 transition border border-slate-600/50 hover:opacity-90"
                style={{ background: "linear-gradient(to bottom, #4a4a4a 0%, #383838 100%)" }}
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  setWeakEmergencyModalOpen(false);
                  setHowToFixTab("active");
                  setHowToFixPage(1);
                  setHowToFixModalOpen(true);
                }}
                className="flex-1 rounded-xl font-semibold text-white py-3 px-4 transition hover:opacity-95"
                style={{ background: "linear-gradient(to bottom, #4066FF 0%, #0026FF 100%)", boxShadow: "0 4px 15px rgba(0,38,255,0.45)" }}
              >
                How to fix
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* How to fix modal - portaled to body */}
      {howToFixModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[10001] flex items-stretch md:items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-4"
          style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }}
          onClick={() => setHowToFixModalOpen(false)}
        >
          <div
            className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl rounded-none md:rounded-2xl border-0 md:border border-slate-700/70 shadow-none md:shadow-2xl overflow-hidden flex flex-col"
            style={{ backgroundColor: "#191D35" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-700/60" style={{ backgroundColor: "#15182A" }}>
              <div>
                <h2 className="text-lg font-semibold text-white">How to fix</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {howToFixSubtitle(howToFixMeta, howToFixTab)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHowToFixModalOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 transition"
                aria-label="Close how to fix modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 pt-4 flex gap-2">
              <button
                type="button"
                onClick={() => { setHowToFixTab("active"); setHowToFixPage(1); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${howToFixTab === "active" ? "bg-[#0026FF] text-white" : "bg-slate-800/60 text-slate-400 hover:text-white"}`}
              >
                Active issues
              </button>
              <button
                type="button"
                onClick={() => { setHowToFixTab("history"); setHowToFixPage(1); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${howToFixTab === "history" ? "bg-[#0026FF] text-white" : "bg-slate-800/60 text-slate-400 hover:text-white"}`}
              >
                History
              </button>
            </div>

            <div className="p-5 flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-3">
              {threatActionFeedback && howToFixTab === "active" && (
                <div className="rounded-xl border border-[#4066FF]/35 bg-[#4066FF]/10 p-3 text-sm text-slate-200">
                  {threatActionFeedback}
                </div>
              )}
              {howToFixLoading ? (
                <div className="rounded-xl border border-slate-700/60 bg-[#15182A] p-4 text-sm text-slate-300">
                  Loading remediation guidance...
                </div>
              ) : howToFixError ? (
                <div className="rounded-xl border border-[#F00500]/35 bg-[#F00500]/10 p-4 text-sm text-[#ff8c89]">
                  {howToFixError}
                </div>
              ) : howToFixItems.length === 0 ? (
                <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  {howToFixTab === "history"
                    ? "No resolved or dismissed incidents yet."
                    : "No active issues right now. Your wallet posture looks stable."}
                </div>
              ) : (
                howToFixItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-700/60 bg-[#15182A] p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm md:text-base font-semibold text-white">{item.title}</h3>
                      <div className="flex items-center gap-2">
                        {item.status && (
                          <span className="inline-flex items-center rounded-full border border-slate-600/60 px-2.5 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                            {item.status}
                          </span>
                        )}
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide ${getSeverityBadgeClass(item.severity)}`}>
                          {item.severity}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      Detected: {formatThreatDetectedAt(item.detected_at)}
                    </p>
                    {(item.where_to_fix || item.recommended_action) && (
                      <div className="space-y-1.5 text-sm">
                        {item.where_to_fix && (
                          <p className="text-slate-300">
                            <span className="text-slate-400">Where to fix:</span> {item.where_to_fix}
                          </p>
                        )}
                        {item.recommended_action && (
                          <p className="text-slate-300">
                            <span className="text-slate-400">Recommended action:</span> {item.recommended_action}
                          </p>
                        )}
                      </div>
                    )}
                    {item.fix_steps && item.fix_steps.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Fix steps</p>
                        <ol className="space-y-2 list-decimal pl-5 text-sm text-slate-200">
                          {item.fix_steps.map((step, idx) => (
                            <li key={`${item.id}-step-${idx}`}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {howToFixTab === "active" && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleVerifyThreat(item.id)}
                          disabled={threatActionId === item.id || verifyAllLoading}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                          style={{ background: "linear-gradient(to bottom, #4066FF 0%, #0026FF 100%)" }}
                        >
                          {threatActionId === item.id ? "Verifying…" : "Verify fix"}
                        </button>
                        {remediationActionLabel(item) && (
                          <button
                            type="button"
                            onClick={() => handleRecordRemediation(item)}
                            disabled={threatActionId === item.id || verifyAllLoading}
                            className="rounded-lg border border-[#4066FF]/50 bg-[#4066FF]/15 px-3 py-2 text-xs font-medium text-[#a8bfff] disabled:opacity-50"
                          >
                            {remediationActionLabel(item)}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleResolveThreat(item.id)}
                          disabled={threatActionId === item.id || verifyAllLoading}
                          className="rounded-lg border border-slate-600/60 bg-slate-700/40 px-3 py-2 text-xs font-medium text-slate-200 disabled:opacity-50"
                        >
                          Mark as fixed
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismissThreat(item.id)}
                          disabled={threatActionId === item.id || verifyAllLoading}
                          className="rounded-lg border border-slate-600/60 bg-slate-700/40 px-3 py-2 text-xs font-medium text-slate-400 disabled:opacity-50"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-5 pt-0 flex flex-col gap-3">
              {howToFixTab === "active" && howToFixItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleVerifyAllThreats}
                  disabled={verifyAllLoading || !!threatActionId}
                  className="w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(to bottom, #3366ff 0%, #0026FF 50%, #001fcc 100%)" }}
                >
                  {verifyAllLoading ? "Verifying all open issues…" : "Verify all open issues"}
                </button>
              )}
              <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Page {howToFixPage} of {howToFixTotalPages(howToFixMeta, howToFixTab)}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHowToFixPage((p) => Math.max(1, p - 1))}
                  disabled={howToFixPage <= 1 || howToFixLoading || verifyAllLoading}
                  className="rounded-lg border border-slate-600/60 bg-slate-700/40 px-3 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setHowToFixPage((p) => p + 1)}
                  disabled={
                    howToFixLoading ||
                    verifyAllLoading ||
                    howToFixPage >= howToFixTotalPages(howToFixMeta, howToFixTab)
                  }
                  className="rounded-lg border border-[#001a99] px-3 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(to bottom, #3366ff 0%, #0026FF 50%, #001fcc 100%)" }}
                >
                  Next
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Rescan modal - portaled to body */}
      {rescanModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={closeRescanModal}>
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
                  <h3 className="text-xl font-bold text-white text-center mb-2">{scanInProgress ? "Scanning Your Wallet" : "Scan complete"}</h3>
                  {scanInProgress ? (
                    <p className="text-sm text-slate-400 text-center mb-8">Analyzing permissions, activity, and hidden risks in real time.</p>
                  ) : scanResult ? (
                    <div className="mb-6 max-h-[50vh] overflow-y-auto hide-scrollbar space-y-4">
                      <div className="rounded-lg bg-slate-800/60 border border-slate-600/50 p-3 text-sm">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-300">
                          <span>Score: <strong className="text-white">{scanResult.score}%</strong></span>
                          <span>Status: <strong className="text-white capitalize">{scanResult.status}</strong></span>
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
                              <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-slate-600/60 text-slate-200 capitalize">{obs.severity}</span>
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
      )}

      {/* Wallet Details Modal - portaled to body for full viewport coverage */}
      {selectedWallet && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={() => setSelectedWallet(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header - wallet region */}
            <div className="flex items-center justify-between p-5" style={{ backgroundColor: "#1B1B1B" }}>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  <Image src={getWalletLogoUrl(selectedWallet)} alt="" width={32} height={32} className="w-8 h-8 object-contain" unoptimized={getWalletLogoUrl(selectedWallet).startsWith("http")} />
                </span>
                <h2 className="text-lg font-normal text-white">{selectedWallet.provider} Wallet</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWallet(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 transition"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body: Tabs + content + footer */}
            <div style={{ backgroundColor: "#191b28" }}>
            {/* Tabs */}
            <div className="flex gap-6 px-5 pt-4">
              {(["details", "balance", "security", "activity", "contract"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setWalletModalTab(tab)}
                  className={`pb-3 text-sm font-medium capitalize transition ${
                    walletModalTab === tab
                      ? "text-white border-b-2 border-[#4066FF]"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                  style={walletModalTab === tab ? { borderBottomColor: "#4066FF" } : undefined}
                >
                  {tab === "contract" ? "Contract Exposure" : tab}
                </button>
              ))}
            </div>

            {/* Tab content - from GET /wallets/:address/modal */}
            <div className="p-5">
              {walletModalTab === "details" && (
                walletModalLoading ? (
                  <p className="text-slate-400 text-sm py-4">Loading…</p>
                ) : walletModalData?.details ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Provider</label>
                      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                        {walletModalData.details.provider}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Wallet Address</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white font-mono truncate">
                          {walletModalData.details.wallet_address}
                        </div>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard?.writeText(walletModalData.details.wallet_address)}
                          className="shrink-0 w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
                          aria-label="Copy address"
                        >
                          <svg className="w-5 h-5 shrink-0 opacity-80 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Network</label>
                      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                        {walletModalData.details.network}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Connected</label>
                      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                        {formatApprovalDate(walletModalData.details.connected_at)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Wallet Type</label>
                      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                        {walletModalData.details.wallet_type}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Connected Via</label>
                      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                        {walletModalData.details.connected_via}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Security Status</label>
                      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                        {walletModalData.details.security_status}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm py-4">Could not load wallet details.</p>
                )
              )}
              {walletModalTab === "balance" && (
                walletModalLoading ? (
                  <p className="text-slate-400 text-sm py-4">Loading…</p>
                ) : walletModalData?.balance ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Total Balance:</label>
                      <span className="text-4xl font-normal text-white">
                        ${typeof walletModalData.balance.total_usd === "number" ? walletModalData.balance.total_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : walletModalData.balance.total_usd}
                      </span>
                    </div>
                    {walletModalData.balance.assets?.length ? (
                      walletModalData.balance.assets.map((a) => (
                        <div key={a.symbol}>
                          <label className="block text-xs text-slate-400 mb-1.5">{a.symbol}</label>
                          <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                            {a.balance} {a.symbol} (${a.usd_value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">No assets</p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm py-4">Could not load balance.</p>
                )
              )}
              {walletModalTab === "security" && (
                walletModalLoading ? (
                  <p className="text-slate-400 text-sm py-4">Loading…</p>
                ) : walletModalData?.security ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">2FA</label>
                      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-normal text-white">
                        {walletModalData.security.two_fa ?? "—"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Active Approvals</label>
                      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-normal text-white">
                        {walletModalData.security.active_approvals}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Last Scan</label>
                      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-normal text-white">
                        {walletModalData.security.last_scan_ago}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Threat Level</label>
                      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-normal text-white">
                        {walletModalData.security.threat_level}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Risk Exposure</label>
                      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-normal text-white">
                        {typeof walletModalData.security.risk_exposure_percent === "number" ? `${walletModalData.security.risk_exposure_percent}%` : walletModalData.security.risk_exposure_percent}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm py-4">Could not load security.</p>
                )
              )}
              {walletModalTab === "activity" && (
                walletModalLoading ? (
                  <p className="text-slate-400 text-sm py-4">Loading…</p>
                ) : walletModalData?.activity ? (
                  <div className="space-y-4">
                    <h3 className="text-base font-normal text-white">Recent Activity</h3>
                    <div className="space-y-3">
                      {walletModalData.activity.length === 0 ? (
                        <p className="text-slate-500 text-sm">No activity</p>
                      ) : (
                        walletModalData.activity.map((item) => (
                          <div key={item.id} className="rounded-lg bg-slate-800/80 border border-slate-700/60 flex overflow-hidden">
                            <div className="w-1 shrink-0 bg-[#0026FF]" aria-hidden />
                            <div className="flex-1 flex items-start justify-between gap-3 p-4">
                              <div className="min-w-0">
                                <p className="text-sm font-normal text-white">{item.title}</p>
                                {item.description && <p className="text-xs font-normal text-slate-400 mt-1">{item.description}</p>}
                              </div>
                              <span className="text-xs font-normal text-slate-400 shrink-0">{formatApprovalDate(item.created_at)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm py-4">Could not load activity.</p>
                )
              )}
              {walletModalTab === "contract" && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">Contract Exposure</h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Uniswap V3:</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-bold text-white">
                      Low Risk
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">XYZ Staking Pool:</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-bold text-white">
                      Medium Risk
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Unknown DApp</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-bold" style={{ color: "#F00500" }}>
                      High Risk
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5">
              <button
                type="button"
                onClick={() => setSelectedWallet(null)}
                className="flex-1 rounded-lg bg-gradient-to-b from-[#475569] to-[#1e293b] hover:from-[#64748b] hover:to-[#334155] text-white text-sm font-medium py-3 transition shadow-[0_4px_12px_rgba(30,41,59,0.4)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setSelectedWallet(null)}
                className="flex-1 rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-3 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)]"
              >
                Confirm
              </button>
            </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Approval Details Modal - portaled to body for full viewport coverage */}
      {selectedApprovalIndex !== null && typeof document !== "undefined" && createPortal((() => {
        const list = approvals ?? [];
        const a = list[selectedApprovalIndex];
        if (!a) {
          return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={() => setSelectedApprovalIndex(null)}>
              <div className="w-full max-w-lg rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden p-5" style={{ backgroundColor: "#191b28" }} onClick={(e) => e.stopPropagation()}>
                <p className="text-slate-400 text-sm">Approval not found.</p>
                <button type="button" onClick={() => setSelectedApprovalIndex(null)} className="mt-4 rounded-lg bg-slate-600 text-white text-sm font-medium py-2 px-4">Close</button>
              </div>
            </div>
          );
        }
        const riskLabel = capitalize(a.risk_level);
        const riskColor = riskLabel === "Low" ? "text-[#32BB1D]" : riskLabel === "Medium" ? "text-amber-500" : "text-[#F00500]";
        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={() => setSelectedApprovalIndex(null)}>
            <div className="w-full max-w-lg rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5" style={{ backgroundColor: "#1B1B1B" }}>
                <h2 className="text-lg font-bold text-white">Approval Details</h2>
                <button type="button" onClick={() => setSelectedApprovalIndex(null)} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 transition" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-5 space-y-4" style={{ backgroundColor: "#191b28" }}>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-400 shrink-0">Contract Address</span>
                    <span className="text-slate-200 font-mono text-right break-all">{a.contract_address}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-400 shrink-0">Approval type</span>
                    <span className="text-slate-200 text-right">{capitalize(a.approval_type)}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-400 shrink-0">Risk level</span>
                    <span className={`font-medium ${riskColor}`}>{riskLabel}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-400 shrink-0">Detected</span>
                    <span className="text-slate-200 text-right">{formatApprovalDate(a.detected_at)}</span>
                  </div>
                </div>
                <div className="rounded-lg flex overflow-hidden border border-slate-700/60" style={{ backgroundColor: "rgba(0,38,255,0.08)" }}>
                  <div className="w-1 shrink-0 bg-[#0026FF]" aria-hidden />
                  <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <p className="text-sm font-normal text-white">SenseiGuard Warning</p>
                      <p className="text-xs text-slate-400 mt-1">This approval allows the contract to transfer all approved tokens without further confirmation.</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{formatApprovalDate(a.detected_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-5" style={{ backgroundColor: "#191b28" }}>
                <button type="button" onClick={() => setSelectedApprovalIndex(null)} className="flex-1 rounded-lg bg-gradient-to-b from-[#475569] to-[#1e293b] hover:from-[#64748b] hover:to-[#334155] text-white text-sm font-medium py-3 transition">Cancel</button>
                <button type="button" onClick={() => setSelectedApprovalIndex(null)} className="flex-1 rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-3 transition">Confirm</button>
              </div>
            </div>
          </div>
        );
      })(), document.body)}

      {/* Scan Contract Details Modal */}
      {scanDetailsModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={() => setScanDetailsModalOpen(false)}>
          <div className="w-full h-full min-h-full max-h-full md:min-h-0 md:max-w-2xl md:max-h-[90vh] rounded-none md:rounded-2xl border-0 md:border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col bg-[#191b28]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 shrink-0" style={{ backgroundColor: "#1B1B1B" }}>
              <h2 className="text-lg font-bold text-white">Contract Scan Details</h2>
              <button type="button" onClick={() => setScanDetailsModalOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 transition" aria-label="Close">
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
                    <DetailRow label="Trust Score" value={`${scanDetails.trust_score}%`} />
                    <DetailRow label="Critical Risk Flags" value={String(scanDetails.critical_risk_flags)} />
                    <DetailRow label="Token Controlled" value={scanDetails.token_controlled || "—"} />
                    <DetailRow label="Owner / Admin" value={String(scanDetails.owner_admin_count)} />
                    <DetailRow label="Scanned" value={formatApprovalDate(scanDetails.scanned_at)} />
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
                        <DetailSection title="Simulation">
                          <DetailRow label="Drains full balance" value={scanDetails.details.simulation.drains_full_balance ? "Yes" : "No"} />
                          <DetailRow label="Hidden internal calls" value={String(scanDetails.details.simulation.hidden_internal_calls ?? "—")} />
                          <DetailRow label="Approval scope" value={scanDetails.details.simulation.approval_scope ?? "—"} />
                          {scanDetails.details.simulation.dangerous_functions?.length ? (
                            <p className="text-sm"><span className="text-slate-400">Dangerous functions: </span><span className="text-slate-200">{scanDetails.details.simulation.dangerous_functions.join(", ")}</span></p>
                          ) : null}
                        </DetailSection>
                      )}
                      {scanDetails.details.owner_privileges && (
                        <DetailSection title="Owner privileges">
                          <DetailRow label="Mint" value={scanDetails.details.owner_privileges.mint ? "Yes" : "No"} />
                          <DetailRow label="Pause" value={scanDetails.details.owner_privileges.pause ? "Yes" : "No"} />
                          <DetailRow label="Upgradeable" value={scanDetails.details.owner_privileges.upgradeable ? "Yes" : "No"} />
                          <DetailRow label="Withdraw liquidity" value={scanDetails.details.owner_privileges.withdraw_liquidity ? "Yes" : "No"} />
                          <DetailRow label="Blacklist" value={scanDetails.details.owner_privileges.blacklist ? "Yes" : "No"} />
                        </DetailSection>
                      )}
                      {scanDetails.details.reputation && (
                        <DetailSection title="Reputation">
                          <DetailRow label="Reported scam" value={scanDetails.details.reputation.reported_scam ? "Yes" : "No"} />
                          <DetailRow label="Community flags" value={String(scanDetails.details.reputation.community_flags ?? 0)} />
                          <DetailRow label="Verified source" value={scanDetails.details.reputation.verified_source ? "Yes" : "No"} />
                        </DetailSection>
                      )}
                      {scanDetails.details.trend && (
                        <DetailSection title="Trend">
                          <DetailRow label="Scans today" value={String(scanDetails.details.trend.scans_today ?? "—")} />
                          <DetailRow label="Wallets affected" value={String(scanDetails.details.trend.wallets_affected ?? "—")} />
                          <DetailRow label="Risk trend" value={scanDetails.details.trend.risk_trend ?? "—"} />
                        </DetailSection>
                      )}
                      {scanDetails.details.risk_breakdown && (
                        <DetailSection title="Risk breakdown">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(scanDetails.details.risk_breakdown).map(([k, v]) => (
                              <span key={k} className="flex justify-between gap-2"><span className="text-slate-400 capitalize">{k.replace(/_/g, " ")}</span><span className="text-slate-200">{v}%</span></span>
                            ))}
                          </div>
                        </DetailSection>
                      )}
                      {scanDetails.details.user_anomaly_score != null && <DetailRow label="User anomaly score" value={String(scanDetails.details.user_anomaly_score)} />}
                      {scanDetails.details.rug_pull_probability && (() => {
                        const v = scanDetails.details.rug_pull_probability!.toLowerCase();
                        const riskStyle = v === "high" ? { color: "#F00500" } : v === "medium" ? undefined : { color: "#32BB1D" };
                        const riskClass = v === "high" ? "font-semibold" : v === "medium" ? "font-semibold text-amber-500" : "font-semibold text-[#32BB1D]";
                        return <DetailRow label="Rug pull probability" value={scanDetails.details.rug_pull_probability!} valueClassName={riskClass} valueStyle={riskStyle} />;
                      })()}
                    </>
                  )}
                </>
              )}
            </div>
            <div className="p-5 border-t border-slate-700/60 shrink-0">
              <button type="button" onClick={() => setScanDetailsModalOpen(false)} className="w-full rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-3 transition">Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Analyze Transaction modal - uses POST /dashboard/{address}/analyze-tx */}
      {analyzeTxModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={() => setAnalyzeTxModalOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden bg-[#1A1E2E]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#2D2F3C] px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Analyze transaction</h2>
              <button type="button" onClick={() => setAnalyzeTxModalOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 transition" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
              {!address ? (
                <p className="text-slate-400 text-sm">Connect your wallet to analyze a transaction.</p>
              ) : (
                <>
                  <p className="text-slate-400 text-sm">Wallet: <span className="font-mono text-slate-300">{address.slice(0, 10)}…{address.slice(-8)}</span></p>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">To (recipient address)</label>
                    <input type="text" value={analyzeTxTo} onChange={(e) => setAnalyzeTxTo(e.target.value)} placeholder="0x…" className="w-full rounded-lg border bg-[#25283D] border-slate-600/60 text-white text-sm px-3 py-2.5 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#4066FF]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Value (wei, optional)</label>
                    <input type="text" value={analyzeTxValue} onChange={(e) => setAnalyzeTxValue(e.target.value)} placeholder="0" className="w-full rounded-lg border bg-[#25283D] border-slate-600/60 text-white text-sm px-3 py-2.5 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#4066FF]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Data (hex, optional)</label>
                    <input type="text" value={analyzeTxData} onChange={(e) => setAnalyzeTxData(e.target.value)} placeholder="0x" className="w-full rounded-lg border bg-[#25283D] border-slate-600/60 text-white text-sm px-3 py-2.5 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#4066FF]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Chain ID</label>
                    <input type="text" value={analyzeTxChainId} onChange={(e) => setAnalyzeTxChainId(e.target.value)} placeholder="e.g. 1" className="w-full rounded-lg border bg-[#25283D] border-slate-600/60 text-white text-sm px-3 py-2.5 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#4066FF]" />
                  </div>
                  {analyzeTxError && <p className="text-sm text-red-400">{analyzeTxError}</p>}
                  {analyzeTxResult && (
                    <div className="rounded-lg bg-slate-800/60 border border-slate-600/50 p-4 space-y-2 text-sm">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-300">
                        <span>Risk score: <strong className="text-white">{analyzeTxResult.risk_score}</strong></span>
                        <span>Band: <strong className="text-white capitalize">{analyzeTxResult.band}</strong></span>
                        {analyzeTxResult.skipped && <span className="text-amber-400">Skipped</span>}
                      </div>
                      {analyzeTxResult.threat_types?.length ? <p className="text-amber-400">Threats: {analyzeTxResult.threat_types.join(", ")}</p> : null}
                      {(analyzeTxResult.warning || analyzeTxResult.explanation) && (
                        <p className="text-slate-400">{analyzeTxResult.warning || analyzeTxResult.explanation}</p>
                      )}
                      <p className="text-slate-300">{analyzeTxResult.recommended_action || analyzeTxResult.recommendation}</p>
                      {analyzeTxResult.risk_breakdown && (
                        <p className="text-slate-500 text-xs">
                          Approval: {analyzeTxResult.risk_breakdown.approval_risk}
                          {analyzeTxResult.risk_breakdown.destination_risk != null ? ` · Destination: ${analyzeTxResult.risk_breakdown.destination_risk}` : ""}
                          {analyzeTxResult.risk_breakdown.value_exposure_risk != null ? ` · Value exposure: ${analyzeTxResult.risk_breakdown.value_exposure_risk}` : ""}
                          {analyzeTxResult.risk_breakdown.delegatecall_risk != null ? ` · Delegatecall: ${analyzeTxResult.risk_breakdown.delegatecall_risk}` : ""}
                          {" · Simulation drain: "}{analyzeTxResult.risk_breakdown.simulation_drain}
                        </p>
                      )}
                      {analyzeTxResult.correlation && <CorrelationPanel correlation={analyzeTxResult.correlation} />}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="p-5 border-t border-slate-700/50 flex gap-3">
              <button type="button" onClick={() => setAnalyzeTxModalOpen(false)} className="flex-1 rounded-xl font-bold text-white py-3 px-4 transition border border-[#222222] hover:opacity-90" style={{ background: "linear-gradient(to bottom, #4a4a4a 0%, #414141 50%, #383838 100%)" }}>
                Cancel
              </button>
              {address && (
                <button type="button" onClick={runAnalyzeTransaction} disabled={analyzeTxLoading} className="flex-1 rounded-xl font-medium text-white py-3 px-4 transition border border-[#001a99] disabled:opacity-60 hover:opacity-95" style={{ background: "linear-gradient(to bottom, #3366ff 0%, #0026FF 50%, #001fcc 100%)" }}>
                  {analyzeTxLoading ? "Analyzing…" : "Analyze"}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Risky tokens modal */}
      {riskyTokensModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={() => setRiskyTokensModalOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden bg-[#1A1E2E]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#2D2F3C] px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Risky tokens</h2>
              <button type="button" onClick={() => setRiskyTokensModalOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 transition" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {!address ? (
                <p className="text-slate-400 text-sm">Connect your wallet to view risky tokens.</p>
              ) : riskyTokensLoading ? (
                <p className="text-slate-400 text-sm">Loading…</p>
              ) : !riskyTokensList?.length ? (
                <p className="text-slate-400 text-sm">No risky tokens detected.</p>
              ) : (
                <ul className="space-y-3">
                  {riskyTokensList.map((item) => (
                    <li key={item.id} className="rounded-lg border border-slate-600/50 bg-slate-800/40 p-4 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-white">{item.title}</p>
                        <span className={`shrink-0 capitalize px-2 py-0.5 rounded text-xs font-medium ${item.severity === "high" ? "bg-red-500/20 text-red-400" : item.severity === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-slate-600/60 text-slate-300"}`}>{item.severity}</span>
                      </div>
                      {item.source_contract && <p className="mt-1.5 font-mono text-slate-400 text-xs break-all">{item.source_contract}</p>}
                      {item.explanation && <p className="mt-2 text-slate-400 text-xs">{item.explanation}</p>}
                      <p className="mt-2 text-slate-500 text-xs">{formatApprovalDate(item.detected_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-5 border-t border-slate-700/50">
              <button type="button" onClick={() => setRiskyTokensModalOpen(false)} className="w-full rounded-xl font-bold text-white py-3 px-4 transition hover:opacity-90" style={{ background: "linear-gradient(to bottom, #4a4a4a 0%, #414141 50%, #383838 100%)" }}>
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function DetailRow({ label, value, mono, highlight, stackOnMobile, valueClassName, valueStyle }: { label: string; value: string; mono?: boolean; highlight?: boolean; stackOnMobile?: boolean; valueClassName?: string; valueStyle?: React.CSSProperties }) {
  const valueClasses = valueClassName ?? (highlight ? "font-semibold text-amber-500" : "");
  const textColor = valueClasses ? "" : "text-slate-200";
  return (
    <div className={`flex gap-4 ${stackOnMobile ? "flex-col gap-1 md:flex-row md:justify-between md:items-center" : "justify-between items-center"}`}>
      <span className="text-slate-400 shrink-0">{label}</span>
      <span style={valueStyle} className={`${textColor} break-all ${stackOnMobile ? "text-left md:text-right" : "text-right"} ${mono ? "font-mono" : ""} ${valueClasses}`}>{value}</span>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-2">{title}</h3>
      <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 p-3 space-y-2 text-sm">{children}</div>
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  change,
  titleClassName,
  action,
  mobile,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  titleClassName?: string;
  action?: React.ReactNode;
  mobile?: boolean;
}) {
  return (
    <div className={`rounded-xl flex flex-col bg-gradient-to-br from-blue-950 to-slate-900 ${mobile ? "p-2.5 min-h-[115px]" : "p-5 min-h-[160px] border border-slate-700/80 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.06)]"}`}>
      <div className="flex items-center gap-2">
        <span className={mobile ? "w-4 h-4 flex items-center justify-center shrink-0 [&>svg]:w-4 [&>svg]:h-4 [&>img]:w-4 [&>img]:h-4" : "shrink-0"}>{icon}</span>
        <p className={mobile ? "text-white font-medium text-xs" : titleClassName ? `text-white ${titleClassName}` : "text-white font-medium text-sm"}>{title}</p>
      </div>
      <div className={`flex items-baseline gap-2 ${mobile ? "mt-1" : "mt-3"}`}>
        <span className={`text-white font-normal ${mobile ? "text-xl" : "text-3xl"}`}>{value}</span>
        <span className={`inline-flex items-center gap-0.5 rounded font-medium bg-[#2F4F2F] text-[#A0E0A0] ${mobile ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-sm"}`}>
          <svg className={mobile ? "w-2.5 h-2.5" : "w-3 h-3"} fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 14l5-5 5 5z" />
          </svg>
          {change}
        </span>
      </div>
      {action ? (
        <div className={`flex items-center justify-between gap-2 mt-auto ${mobile ? "pt-2" : "pt-4"}`}>
          <p className={`text-slate-400 shrink-0 ${mobile ? "text-[10px] whitespace-nowrap" : "text-base"}`}>This month</p>
          <span className={mobile ? "shrink-0 [&>button]:text-[10px] [&>button]:px-2.5 [&>button]:py-1.5 [&>button]:whitespace-nowrap" : ""}>{action}</span>
        </div>
      ) : (
        <p className={`text-slate-400 mt-auto whitespace-nowrap ${mobile ? "pt-2 text-[10px]" : "pt-3 text-base"}`}>This month</p>
      )}
    </div>
  );
}
