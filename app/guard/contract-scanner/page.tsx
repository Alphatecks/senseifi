"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

import { useWallet } from "@/hooks/useWallet";
import { isInsufficientXpError, useWaitlistXp } from "@/context/WaitlistXpContext";
import {
  scanContract,
  getLatestContractScan,
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
import {
  formatContractScanNetworkLabel,
  normalizeContractAddressForCompare,
  parseContractScanInput,
  type ParsedContractScanTarget,
  type SolanaNetwork,
} from "@/utils/contractScan";

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

function normalizeAddress(addr: string | null | undefined): string {
  return normalizeContractAddressForCompare(addr);
}

function addressesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = normalizeAddress(a);
  const right = normalizeAddress(b);
  return Boolean(left && right && left === right);
}

function formatScanDate(iso: string): string {
  try {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function formatScanDateLong(iso: string): string {
  try {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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
const MOBILE_HISTORY_PREVIEW = 5;

const MOBILE_BLEED = "-mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)]";
const MOBILE_CARD = "rounded-2xl flex flex-col p-5";
const MOBILE_CARD_BG = { backgroundColor: "#191D35" };

const SCANNER_ICON = (
  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  </span>
);

const SCAN_BUTTON_STYLE = {
  background: "linear-gradient(to bottom, #5b7cff 0%, #4066FF 35%, #0026FF 70%, #001a99 100%)",
  boxShadow: "0 2px 10px rgba(0,38,255,0.4)",
} as const;

const PRIVILEGE_BULLET = (
  <span className="w-4 h-4 rounded-full border-[3px] border-[#4066FF] bg-transparent shrink-0" aria-hidden />
);

type DetailRow = { label: string; value: string; mono?: boolean };

function MobileSmartContractDetailsPanel({ rows }: { rows: DetailRow[] }) {
  return (
    <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
      <p className="text-base font-medium text-white mb-3">Smart Contract Details</p>
      <div className="rounded-xl border px-4 py-1 divide-y divide-[#444554]" style={INNER_BG}>
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-center gap-4 py-3">
            <span className="text-slate-400 text-sm shrink-0">{row.label}</span>
            <span className={`text-slate-200 text-sm text-right break-all ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type MobilePermissionPanelProps = {
  privilegedFunctions: string[];
  riskLabel: string;
  riskColor: string;
  loading?: boolean;
};

function MobilePermissionAnalysisPanel({ privilegedFunctions, riskLabel, riskColor, loading }: MobilePermissionPanelProps) {
  return (
    <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
      <p className="text-base font-medium text-white mb-4">Permission & Control Analysis</p>
      <div className="rounded-xl border px-4 py-4 flex flex-col" style={INNER_BG}>
        <div className="rounded-lg px-4 py-3 mb-5" style={{ backgroundColor: "#0d1029" }}>
          <p className="text-[#4066FF] font-medium text-sm mb-0">Detected Privileged Functions</p>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500 mb-6">Loading analysis…</p>
        ) : (
          <ul className="space-y-5 mb-6">
            {(privilegedFunctions.length ? privilegedFunctions : ["—"]).map((fn, i) => (
              <li key={`${fn}-${i}`} className="text-sm text-white flex items-center gap-3">
                {PRIVILEGE_BULLET}
                {fn}
              </li>
            ))}
          </ul>
        )}
        <div className="rounded-lg px-4 py-3" style={{ backgroundColor: "#303242" }}>
          <p className="text-sm text-white mb-0">
            <span className="text-slate-300">Risk Level: </span>
            <span className="font-medium" style={{ color: riskColor }}>
              {riskLabel}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

type MobileTrustPointPanelProps = {
  trustScore: number;
  summaryText: string;
};

function MobileTrustPointPanel({ trustScore, summaryText }: MobileTrustPointPanelProps) {
  const scoreLabel = trustScoreToLabel(trustScore);
  const scoreColor = trustScoreColor(trustScore);

  return (
    <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
      <p className="text-base font-medium text-white mb-4">Trust Point</p>
      <div className="rounded-xl border p-4" style={INNER_BG}>
        <div className="flex flex-col items-center gap-5">
          <div
            className="relative w-40 h-40 shrink-0 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse 75% 75% at 50% 50%, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
            }}
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="contractTrustGradMobile" x1="0%" y1="0%" x2="100%" y2="0%">
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
                stroke="url(#contractTrustGradMobile)"
                strokeWidth="3.5"
                strokeDasharray={`${trustScore}, 100`}
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-2xl font-medium leading-tight">
                {trustScore}
                <span className="text-lg font-normal text-slate-400">/100</span>
              </span>
              <span className="text-sm font-medium flex items-center gap-1 mt-0.5" style={{ color: scoreColor }}>
                <Image src={trendUpIcon} alt="" className="w-5 h-5" width={20} height={20} />
                {scoreLabel}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 w-full">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Trust Score</span>
              <span className="rounded-md px-3 py-1.5 bg-white/10 border border-white/10">
                <span className="text-base font-bold text-white">{trustScore}</span>
                <span className="text-sm font-normal text-slate-400">/100</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Confidence Level</span>
              <span
                className="rounded-lg px-3 py-1.5 bg-white/10 border border-white/10 text-sm font-semibold"
                style={{ color: scoreColor }}
              >
                {scoreLabel}
              </span>
            </div>
          </div>

          <div
            className="w-full rounded-lg border p-4 flex flex-col gap-2"
            style={{ backgroundColor: "rgba(13, 16, 41, 0.6)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <p className="text-sm font-semibold text-white">Summary</p>
            <p className="text-sm text-slate-400 leading-relaxed">{summaryText || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type MobileSignalsCardProps = {
  title: string;
  items: string[];
};

function MobileSignalsCard({ title, items }: MobileSignalsCardProps) {
  return (
    <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
      <div className="rounded-xl border p-4" style={{ backgroundColor: "#0d1029", borderColor: "#0d1029" }}>
        <div className="flex flex-col gap-3 mb-4">
          {SCANNER_ICON}
          <h3 className="text-base font-bold text-white">{title}</h3>
        </div>
        <ul className="divide-y divide-[#444554] text-sm text-slate-300">
          {(items.length ? items : ["—"]).map((item, i) => (
            <li key={`${title}-${i}`} className="flex items-start gap-2 py-3 first:pt-0 last:pb-0">
              {DIAMOND_BULLET}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type MetricRow = { label: string; value: string };

type MobileMetricPanelProps = {
  title: string;
  rows: MetricRow[];
  footer?: { label: string; value: string };
};

function MobileMetricPanel({ title, rows, footer }: MobileMetricPanelProps) {
  return (
    <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
      <div className="rounded-xl border p-4 flex flex-col" style={{ backgroundColor: "#0d1029", borderColor: "#0d1029" }}>
        <h3 className="text-base font-bold text-white mb-4">{title}</h3>
        <ul className="divide-y divide-[#444554] text-sm text-slate-300 flex-1">
          {(rows.length ? rows : [{ label: "—", value: "—" }]).map((item, i) => (
            <li key={`${title}-${item.label}-${i}`} className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
              <span className="flex items-start gap-2 min-w-0">
                {DIAMOND_BULLET}
                <span>{item.label}</span>
              </span>
              <span className="text-white font-medium shrink-0">{item.value}</span>
            </li>
          ))}
        </ul>
        {footer ? (
          <div
            className="rounded-lg border mt-4 px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: "rgba(0,0,0,0.2)", borderColor: "#444554" }}
          >
            <span className="text-sm text-white">{footer.label}</span>
            <span className="text-sm font-medium text-white">{footer.value}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type MobileRiskDistributionPanelProps = {
  bars: Array<{ label: string; value: number }>;
  maxValue: number;
};

function MobileRiskDistributionPanel({ bars, maxValue }: MobileRiskDistributionPanelProps) {
  const chartBars = bars.length ? bars : [{ label: "—", value: 0 }];
  const yTicks = [10, 8, 6, 4, 2, 0];

  return (
    <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
      <div className="rounded-xl border p-4" style={{ backgroundColor: "#252736", borderColor: "#252736" }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-medium text-white">Visual Risk Distribution</h3>
          <div className="relative shrink-0">
            <select className="rounded-lg border text-white text-xs font-medium pl-3 pr-7 py-2 appearance-none bg-slate-700/80 border-slate-600/60 min-w-[6.5rem]">
              <option>This month</option>
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col justify-between text-white text-[10px] font-medium shrink-0 h-[200px]">
            {yTicks.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
          <div className="flex-1 relative h-[200px]">
            <div className="absolute left-0 right-0 border-t border-dashed border-slate-500/50 pointer-events-none top-[30%]" aria-hidden />
            <div className="flex items-end justify-between gap-1.5 h-full">
              {chartBars.map((item, i) => (
                <div key={`${item.label}-${i}`} className="flex flex-col items-center gap-1 min-w-0 flex-1 h-full">
                  <div className="w-full max-w-[2.5rem] flex-1 flex flex-col justify-end items-center min-h-0">
                    {item.value > 0 ? (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white mb-1 shrink-0 bg-[#0026FF]">
                        {item.value}/{maxValue}
                      </span>
                    ) : null}
                    <div
                      className="w-full rounded-t-md shrink-0 bg-[#0026FF]"
                      style={{
                        height: maxValue ? `${(item.value / maxValue) * 100}%` : "0%",
                        minHeight: item.value ? "6px" : "0",
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-white text-center leading-tight px-0.5">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type MobileFinalVerdictPanelProps = {
  riskLabel: string;
  riskColor: string;
  recommendation: string;
};

function MobileFinalVerdictPanel({ riskLabel, riskColor, recommendation }: MobileFinalVerdictPanelProps) {
  return (
    <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
      <div className="rounded-xl border p-4" style={{ backgroundColor: "#0d1029", borderColor: "#444554" }}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-white shrink-0">Final Verdict</span>
            <div className="h-4 w-px shrink-0 bg-[#444554]" aria-hidden />
            <span className="text-sm text-slate-400">Risk Level:</span>
            <span className="text-sm font-semibold" style={{ color: riskColor }}>
              {riskLabel}
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
            <span className="text-base font-bold shrink-0" style={{ color: "#0026ff" }}>
              Recommendation
            </span>
            <p className="text-sm text-slate-400 leading-relaxed">
              {recommendation || "Enable alerts and avoid large approvals until ownership risk reduces"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="button"
            className="flex-1 min-w-[9rem] px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(180deg, #2563EB 0%, #0026FF 100%)" }}
          >
            Monitor Owner Wallet
          </button>
          <button
            type="button"
            className="flex-1 min-w-[9rem] px-4 py-2.5 rounded-lg text-sm font-medium text-white border transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1E2238", borderColor: "#444554" }}
          >
            Compare smart Contract
          </button>
        </div>
      </div>
    </div>
  );
}

function historyItemToScan(item: RiskProfileCachedContract): ScanContractResult {
  const contractAddress = getHistoryItemAddress(item);
  return {
    scan_id: "",
    contract_address: contractAddress,
    trust_score: item.trust_score,
    critical_risk_flags: item.critical_risk_flags,
    token_controlled: "",
    owner_admin_count: 0,
    scanned_at: item.scanned_at,
  };
}

function getHistoryItemAddress(item: RiskProfileCachedContract | null | undefined): string {
  if (!item) return "";
  const raw = item as unknown as Record<string, unknown>;
  return String(item.contract_address ?? raw.contractAddress ?? raw.address ?? "").trim();
}

function normalizeRiskProfileItems(items: unknown[] | null | undefined): RiskProfileCachedContract[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((entry) => {
      const raw = entry as Record<string, unknown>;
      return {
        contract_address: String(raw.contract_address ?? raw.contractAddress ?? raw.address ?? "").trim(),
        trust_score: Number(raw.trust_score ?? raw.trustScore ?? 0),
        critical_risk_flags: Number(raw.critical_risk_flags ?? raw.criticalRiskFlags ?? 0),
        scanned_at: String(raw.scanned_at ?? raw.scannedAt ?? ""),
      } satisfies RiskProfileCachedContract;
    })
    .filter((item) => Boolean(item.contract_address));
}

export default function ContractScannerPage() {
  const { activeAddress: address } = useWallet();
  const {
    refreshWaitlistXp,
    applyInsufficientXp,
    canAffordContractScan,
    contractScanCost,
    insufficientXpMessage,
    xpClaimed,
  } = useWaitlistXp();
  const contractScanXpBlocked = !canAffordContractScan(Boolean(address?.trim()));
  const [contractLink, setContractLink] = useState("");
  const [chainIdInput, setChainIdInput] = useState("");
  const [solanaNetwork, setSolanaNetwork] = useState<SolanaNetwork>("mainnet-beta");
  const [lastScanChainId, setLastScanChainId] = useState<number>(1);
  const [lastScanTarget, setLastScanTarget] = useState<ParsedContractScanTarget | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [currentScan, setCurrentScan] = useState<ScanContractResult | null>(null);
  const [scanDetails, setScanDetails] = useState<ScanContractDetailResponse | null>(null);
  const [riskProfile, setRiskProfile] = useState<RiskProfileCachedContract[] | null>(null);
  const [riskProfileLoading, setRiskProfileLoading] = useState(false);
  const [scanHistoryPage, setScanHistoryPage] = useState(1);
  const [scamPattern, setScamPattern] = useState<ContractScamPatternData | null>(null);
  const [activity, setActivity] = useState<ContractActivityData | null>(null);
  const [liquidity, setLiquidity] = useState<ContractLiquidityData | null>(null);
  const [communitySignals, setCommunitySignals] = useState<ContractCommunitySignalsData | null>(null);
  const [mobileHistoryExpanded, setMobileHistoryExpanded] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<RiskProfileCachedContract | null>(null);
  const [historyDetailsLoading, setHistoryDetailsLoading] = useState(false);
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);

  const selectedContractAddress =
    getHistoryItemAddress(selectedHistoryItem) ||
    currentScan?.contract_address?.trim() ||
    null;
  const showMobileDetails = mobileDetailsOpen && Boolean(normalizeAddress(selectedContractAddress));

  const closeMobileDetails = useCallback(() => {
    setMobileDetailsOpen(false);
    setSelectedHistoryItem(null);
  }, []);

  useEffect(() => {
    if (!address?.trim()) {
      setRiskProfile(null);
      setScanHistoryPage(1);
      return;
    }
    setRiskProfileLoading(true);
    setScanHistoryPage(1);
    getRiskProfile(address)
      .then((data) => setRiskProfile(normalizeRiskProfileItems(data?.cached_contract_risks)))
      .finally(() => setRiskProfileLoading(false));
  }, [address]);

  const fetchContractDetails = useCallback((scanId: string, contractAddress: string) => {
    getScanContractDetails(scanId).then(setScanDetails);
    getContractScamPattern(contractAddress).then(setScamPattern);
    getContractActivity(contractAddress).then(setActivity);
    getContractLiquidity(contractAddress).then(setLiquidity);
    getContractCommunitySignals(contractAddress).then(setCommunitySignals);
  }, []);

  const parsedScanTarget = parseContractScanInput(contractLink);
  const isSolanaScanTarget = parsedScanTarget?.chainFamily === "solana";
  const chainIdParsed = chainIdInput.trim() === "" ? null : parseInt(chainIdInput.trim(), 10);
  const chainIdValid = chainIdParsed != null && !Number.isNaN(chainIdParsed) && chainIdParsed > 0;
  const scanDisabled = scanLoading || !contractLink.trim() || contractScanXpBlocked || !parsedScanTarget;
  const scanDisabledDesktop = scanDisabled;

  const handleScan = async () => {
    const target = parseContractScanInput(contractLink.trim());
    if (!target) {
      setScanError("Enter a valid EVM or Solana contract address, or an explorer link.");
      return;
    }
    if (contractScanXpBlocked) {
      setScanError(`Insufficient XP balance (need ${contractScanCost} XP to scan contracts).`);
      return;
    }
    setScanLoading(true);
    setScanError(null);
    setSelectedHistoryItem(null);
    setLastScanTarget(target);
    setLastScanChainId(target.chainFamily === "evm" ? (chainIdValid ? chainIdParsed! : target.chainId ?? 1) : 101);
    setCurrentScan(null);
    setScanDetails(null);
    setScamPattern(null);
    setActivity(null);
    setLiquidity(null);
    setCommunitySignals(null);
    try {
      const result = await scanContract(contractLink.trim(), address ?? undefined, {
        chainId: chainIdValid ? chainIdParsed! : target.chainId,
        chainFamily: target.chainFamily,
        network: target.chainFamily === "solana" ? solanaNetwork : undefined,
      });
      if (result?.scan_id && result?.contract_address) {
        setCurrentScan(result);
        setMobileDetailsOpen(true);
        fetchContractDetails(result.scan_id, result.contract_address);
        await refreshWaitlistXp();
      } else {
        setScanError("Contract scan failed. Please try again.");
      }
    } catch (err) {
      if (isInsufficientXpError(err)) {
        applyInsufficientXp(err);
        setScanError(insufficientXpMessage(err));
      } else {
        setScanError("Contract scan failed. Please try again.");
      }
    } finally {
      setScanLoading(false);
    }
  };

  const loadContractScanResult = useCallback(
    async (contractAddr: string, chainId = 1) => {
      const target = parseContractScanInput(contractAddr);
      const cached = await getLatestContractScan(contractAddr, address ?? undefined);
      if (cached?.scan_id && cached.contract_address) {
        setCurrentScan(cached);
        setLastScanTarget(target);
        fetchContractDetails(cached.scan_id, cached.contract_address);
        return true;
      }
      if (contractScanXpBlocked) return false;
      const result = await scanContract(contractAddr, address ?? undefined, {
        chainId: target?.chainFamily === "evm" ? chainId : undefined,
        chainFamily: target?.chainFamily,
        network: target?.chainFamily === "solana" ? solanaNetwork : undefined,
      });
      if (result?.scan_id && result?.contract_address) {
        setCurrentScan(result);
        fetchContractDetails(result.scan_id, result.contract_address);
        await refreshWaitlistXp();
        return true;
      }
      return false;
    },
    [address, contractScanXpBlocked, fetchContractDetails, refreshWaitlistXp, solanaNetwork]
  );

  const handleSelectHistoryItem = async (item: RiskProfileCachedContract) => {
    const contractAddr = getHistoryItemAddress(item);
    if (!contractAddr) return;

    setContractLink(contractAddr);
    setSelectedHistoryItem(item);
    setMobileDetailsOpen(true);
    setScanError(null);
    setLastScanChainId(1);
    setCurrentScan(historyItemToScan(item));
    setScanDetails(null);
    setScamPattern(null);
    setActivity(null);
    setLiquidity(null);
    setCommunitySignals(null);

    setHistoryDetailsLoading(true);
    try {
      const loaded = await loadContractScanResult(contractAddr, 1);
      if (!loaded && contractScanXpBlocked && xpClaimed) {
        setScanError(`Insufficient XP to refresh scan (need ${contractScanCost} XP). Showing saved summary.`);
      }
    } catch (err) {
      if (isInsufficientXpError(err)) {
        applyInsufficientXp(err);
        setScanError(insufficientXpMessage(err));
      }
    } finally {
      setHistoryDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (!mobileDetailsOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileDetailsOpen]);

  const details = scanDetails?.details ?? currentScan?.details;
  const summaryText = details?.ai_summary ?? currentScan?.ai_summary ?? "";
  const trustScore = scanDetails?.trust_score ?? currentScan?.trust_score ?? selectedHistoryItem?.trust_score ?? 0;
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
  if (Array.isArray(details?.goplus_risk_flags)) {
    details.goplus_risk_flags.slice(0, 3).forEach((flag) => keyRiskFlagsList.push(flag));
  }
  if (ownerPrivileges && !keyRiskFlagsList.length) keyRiskFlagsList.push("Ownership has not been renounced");
  const positiveSignalsList: string[] = [];
  if (details?.reputation?.verified_source) positiveSignalsList.push("Source code verified on explorer");
  if (details?.reputation && !details.reputation.reported_scam) positiveSignalsList.push("No critical vulnerabilities in last audit");
  if (currentScan?.detected_standard) positiveSignalsList.push(`Detected standard: ${currentScan.detected_standard}`);
  if (Array.isArray(details?.goplus_risk_flags) && !details.goplus_risk_flags.length && (currentScan?.trust_score ?? 0) >= 70) {
    positiveSignalsList.push("No GoPlus risk flags reported");
  }
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
  const networkName =
    formatContractScanNetworkLabel(currentScan ?? scanDetails) ||
    (lastScanTarget?.chainFamily === "solana"
      ? solanaNetwork === "mainnet-beta"
        ? "Solana Mainnet"
        : solanaNetwork
      : CHAIN_ID_TO_NETWORK[chainIdForDisplay] ?? (chainIdForDisplay ? `Chain ${chainIdForDisplay}` : "—"));
  const contractStandard =
    currentScan?.detected_standard ||
    (Array.isArray(details?.detected_standards) ? details.detected_standards.join(", ") : null) ||
    currentScan?.token_controlled ||
    scanDetails?.token_controlled ||
    "—";
  const contractName =
    currentScan?.contract_name ||
    details?.contract_name ||
    shortAddress((selectedContractAddress ?? contractLink.trim()) || "—");
  const mobileHistoryItems = riskProfile ?? [];
  const visibleMobileHistory = mobileHistoryExpanded
    ? mobileHistoryItems
    : mobileHistoryItems.slice(0, MOBILE_HISTORY_PREVIEW);
  const activeMobileAddress = selectedContractAddress;
  const riskLevelLabel = details?.rug_pull_probability ?? trustScoreToLabel(trustScore);
  const mobileDetailRows: DetailRow[] = [
    { label: "Contract Name", value: contractName, mono: true },
    { label: "Address", value: activeMobileAddress ?? "—", mono: true },
    { label: "Network", value: networkName },
    { label: "Standard", value: contractStandard },
    {
      label: "Deployed",
      value: formatScanDateLong(currentScan?.scanned_at ?? selectedHistoryItem?.scanned_at ?? ""),
    },
    { label: "Verified", value: details?.reputation?.verified_source ? "Yes" : "No" },
  ];
  const communitySignalsList = communitySignals
    ? [
        `${communitySignals.report_count} community reports submitted`,
        `${communitySignals.confirmed_exploits} confirmed exploits`,
        `${communitySignals.users_flagged_count} users flagged`,
      ]
    : [];
  const mobileRiskBars = [
    { label: "Ownership Risk", value: riskBreakdown?.owner_privileges ?? 0 },
    {
      label: "Approval Risk",
      value: riskBreakdown?.token_control_scope ?? riskBreakdown?.token_scope ?? riskBreakdown?.simulation ?? 0,
    },
    {
      label: "Liquidity Safety",
      value: riskBreakdown?.anomaly ?? riskBreakdown?.user_anomaly ?? riskBreakdown?.contract_age ?? 0,
    },
    { label: "Code Transparency", value: riskBreakdown?.reputation ?? 0 },
    { label: "Community Trust", value: riskBreakdown?.contract_age ?? 0 },
  ];
  const mobileRiskMax = Math.max(10, ...mobileRiskBars.map((bar) => bar.value));
  const scamPatternRows: MetricRow[] = scamPattern
    ? [
        { label: "Honeypot:", value: scamPattern.honeypot ? "Yes" : "No" },
        { label: "Approval Drain:", value: scamPattern.approval_drain ? "Yes" : "No" },
        { label: "Delayed Rug:", value: scamPattern.delayed_rug ? "Yes" : "No" },
        { label: "Fee Escalation:", value: scamPattern.fee_escalation ? "Yes" : "No" },
      ]
    : [];
  const activityRows: MetricRow[] = activity
    ? [
        { label: "Avg Tx / Day", value: activity.avg_tx_per_day != null ? activity.avg_tx_per_day.toLocaleString() : "—" },
        {
          label: "Largest Tx",
          value: activity.largest_tx_usd != null ? `$${activity.largest_tx_usd.toLocaleString()}` : "—",
        },
        { label: "Abnormal Activity", value: activity.abnormal_activity ? "Yes" : "No" },
      ]
    : [];
  const liquidityRows: MetricRow[] = liquidity
    ? [
        {
          label: "Initial LP",
          value: liquidity.initial_lp_usd != null ? `$${liquidity.initial_lp_usd.toLocaleString()}` : "—",
        },
        {
          label: "Current LP",
          value: liquidity.current_lp_usd != null ? `$${liquidity.current_lp_usd.toLocaleString()}` : "—",
        },
        {
          label: "Sudden Pulls",
          value:
            liquidity.sudden_pulls == null
              ? "—"
              : liquidity.sudden_pulls === 0
                ? "None"
                : String(liquidity.sudden_pulls),
        },
      ]
    : [];
  const finalRecommendation =
    summaryText || "Enable alerts and avoid large approvals until ownership risk reduces";

  const mobileDetailsPanels = (
    <div className="flex flex-col gap-4">
      <MobileSmartContractDetailsPanel rows={mobileDetailRows} />
      <MobilePermissionAnalysisPanel
        privilegedFunctions={privilegedFunctionsList}
        riskLabel={riskLevelLabel}
        riskColor={trustScoreColor(trustScore)}
        loading={historyDetailsLoading || (scanLoading && !privilegedFunctionsList.length)}
      />
      <MobileTrustPointPanel trustScore={trustScore} summaryText={summaryText} />
      <MobileSignalsCard title="Key Risk Flags" items={keyRiskFlagsList} />
      <MobileSignalsCard title="Positive Signals" items={positiveSignalsList} />
      <MobileSignalsCard title="Community Signals" items={communitySignalsList} />
      <MobileRiskDistributionPanel bars={mobileRiskBars} maxValue={mobileRiskMax} />
      <MobileMetricPanel
        title="Scam Pattern Intelligence"
        rows={scamPatternRows}
        footer={{
          label: "Similarity Score:",
          value: scamPattern != null ? `${scamPattern.similarity_score_percent}%` : "—",
        }}
      />
      <MobileMetricPanel title="Activity" rows={activityRows} />
      <MobileMetricPanel title="Liquidity" rows={liquidityRows} />
      <MobileFinalVerdictPanel
        riskLabel={riskLevelLabel}
        riskColor={trustScoreColor(trustScore)}
        recommendation={finalRecommendation}
      />
    </div>
  );

  return (
    <div className="rounded-2xl p-4 lg:p-6 space-y-4 lg:space-y-6 lg:bg-blue-950/25 lg:border lg:border-blue-900/40">
      {/* Mobile: Contract Scanner + Scan History */}
      <div className={`lg:hidden flex flex-col gap-4 ${MOBILE_BLEED}`}>
        <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
          <div className="flex items-center gap-2 mb-4">
            {SCANNER_ICON}
            <h2 className="text-base font-medium text-white">Contract Scanner</h2>
          </div>

          <label className="block text-sm text-white mb-2">Smart Contract Link</label>
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="0x…, Solana program id, or explorer link"
              value={contractLink}
              onChange={(e) => setContractLink(e.target.value)}
              className="w-full rounded-lg border bg-[#25283D] border-[#25283D] text-white text-sm pl-4 pr-24 py-3 focus:outline-none focus:ring-1 focus:ring-slate-500 placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={handleScan}
              disabled={scanDisabled}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60"
              style={SCAN_BUTTON_STYLE}
            >
              {scanLoading ? "…" : contractScanXpBlocked && xpClaimed ? "No XP" : "Scan"}
            </button>
          </div>

          {contractScanXpBlocked && xpClaimed ? (
            <p className="mb-3 text-xs text-amber-300">Contract scan requires {contractScanCost} XP. Your balance is too low.</p>
          ) : null}
          {scanError ? <p className="mb-3 text-xs text-red-300">{scanError}</p> : null}
        </div>

        <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              {SCANNER_ICON}
              <h2 className="text-base font-medium text-white truncate">Scan History</h2>
            </div>
            {mobileHistoryItems.length > MOBILE_HISTORY_PREVIEW && !mobileHistoryExpanded ? (
              <button
                type="button"
                onClick={() => setMobileHistoryExpanded(true)}
                className="text-xs font-medium text-[#4066FF] hover:underline shrink-0"
              >
                See more
              </button>
            ) : null}
          </div>

          <ul className="space-y-3">
            {!address ? (
              <li className="rounded-xl p-4 bg-[#25283D] text-sm text-slate-500">Connect wallet for scan history</li>
            ) : riskProfileLoading ? (
              <li className="rounded-xl p-4 bg-[#25283D] text-sm text-slate-500">Loading…</li>
            ) : !mobileHistoryItems.length ? (
              <li className="rounded-xl p-4 bg-[#25283D] text-sm text-slate-500">No scan history yet</li>
            ) : (
              visibleMobileHistory.map((item, i) => {
                const itemAddress = getHistoryItemAddress(item);
                const isSelected = addressesMatch(itemAddress, activeMobileAddress);
                return (
                  <li key={`${itemAddress}-${item.scanned_at}-${i}`}>
                    <button
                      type="button"
                      onClick={() => handleSelectHistoryItem(item)}
                      className={`w-full rounded-xl p-4 bg-[#25283D] border text-left transition ${
                        isSelected ? "border-[#4066FF]" : "border-slate-700/40 hover:border-slate-600/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-white truncate">{shortAddress(itemAddress)}</p>
                        <p className="text-xs text-slate-400 shrink-0">{formatScanDateLong(item.scanned_at)}</p>
                      </div>
                      <div className="flex items-end justify-between gap-3 mt-2">
                        <p className="text-xs text-slate-400">Ethereum Mainnet</p>
                        <p className="text-sm text-white shrink-0">Trust {item.trust_score}</p>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

      </div>

      {showMobileDetails && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex flex-col bg-[#0a0a1a] lg:hidden"
              style={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 bg-[#0a0a1a]">
                <button
                  type="button"
                  onClick={closeMobileDetails}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition shrink-0"
                  aria-label="Back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {SCANNER_ICON}
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-semibold text-white truncate">Contract Details</h1>
                  <p className="text-xs text-slate-400 font-mono truncate">
                    {activeMobileAddress ? shortAddress(activeMobileAddress) : "—"}
                  </p>
                </div>
                {historyDetailsLoading ? (
                  <span className="text-xs text-slate-400 shrink-0">Loading…</span>
                ) : null}
              </header>
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <div className="p-4 pb-8 flex flex-col gap-4">{mobileDetailsPanels}</div>
              </div>
            </div>,
            document.body
          )
        : null}

      <div className="hidden lg:grid lg:grid-cols-[1fr_2fr] gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Contract Scanner card */}
          <div className={`${CARD_STYLE} min-h-[200px]`} style={CARD_BG}>
            <div className="flex items-center gap-2 mb-4">
              {ENVELOPE_ICON}
              <h2 className="text-lg font-medium text-white">Contract Scanner</h2>
            </div>
            <div className="mb-3">
              <label className="block text-sm text-slate-400 mb-2">Contract / Program Address</label>
              <div className="rounded-lg border focus-within:ring-1 focus-within:ring-slate-500 emboss-inset-3d-input" style={{ borderColor: "#25283D", backgroundColor: "#25283D" }}>
                <input
                  type="text"
                  placeholder="0x…, Solana program id, or Solscan URL"
                  value={contractLink}
                  onChange={(e) => setContractLink(e.target.value)}
                  className="w-full rounded-lg bg-transparent text-white text-sm pl-3 py-3 focus:outline-none placeholder:text-slate-500 border-0"
                />
              </div>
            </div>
            {isSolanaScanTarget ? (
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">Solana Network</label>
                <div className="rounded-lg border focus-within:ring-1 focus-within:ring-slate-500 emboss-inset-3d-input" style={{ borderColor: "#25283D", backgroundColor: "#25283D" }}>
                  <select
                    value={solanaNetwork}
                    onChange={(e) => setSolanaNetwork(e.target.value as SolanaNetwork)}
                    className="w-full rounded-lg bg-transparent text-white text-sm pl-3 py-3 focus:outline-none border-0"
                  >
                    <option value="mainnet-beta">Mainnet Beta</option>
                    <option value="devnet">Devnet</option>
                    <option value="testnet">Testnet</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">Chain ID (EVM)</label>
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
              </div>
            )}
            <button
              type="button"
              onClick={handleScan}
              disabled={scanDisabledDesktop}
              className="mt-3 w-full rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] disabled:opacity-60 text-white text-sm font-medium py-3 transition"
            >
              {scanLoading ? "Scanning…" : contractScanXpBlocked && xpClaimed ? "Insufficient XP" : "Scan"}
            </button>
            {contractScanXpBlocked && xpClaimed ? (
              <p className="mt-2 text-xs text-amber-300">Contract scan requires {contractScanCost} XP. Your balance is too low.</p>
            ) : null}
            {scanError ? <p className="mt-2 text-xs text-red-300">{scanError}</p> : null}
            {!parsedScanTarget && contractLink.trim() ? (
              <p className="mt-2 text-xs text-amber-300">Could not detect a valid EVM or Solana contract from this input.</p>
            ) : null}
            {currentScan && (
              <div className="rounded-lg border p-5 space-y-0 text-sm min-h-[200px] mt-4" style={{ ...INNER_BG, backgroundColor: "#0d1029" }}>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Network:</span><span className="text-right">{networkName}</span></p>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Name:</span><span className="text-right">{contractName}</span></p>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Address:</span><span className="text-right font-mono">{shortAddress(currentScan.contract_address)}</span></p>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Token Scope:</span><span className="text-right">{currentScan.token_controlled || "—"}</span></p>
                <p className="flex justify-between items-center gap-3 text-slate-300 py-3"><span className="text-slate-500 shrink-0">Detected Standard:</span><span className="text-right">{contractStandard}</span></p>
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
