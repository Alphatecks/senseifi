"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";

import { useWallet } from "@/hooks/useWallet";
import { useGuardSearch } from "@/context/GuardSearchContext";
import { getDomainThreatFeed, getSecurityOverview, getLiveScamSignalsSummary, getLiveScamSignalDetails, getThreatCampaigns } from "@/services/dashboardService";
import type { DomainThreatFeedData, SecurityOverviewData, LiveScamSignalSummary, LiveScamSignalDetailsData, ThreatCampaign } from "@/services/dashboardService";

import alertIcon from "@/assets/icons/alert.png";
import scanIcon from "@/assets/icons/scan.png";

const CARD_STYLE = "rounded-2xl border p-5 flex flex-col shadow-sm";
const CARD_BG = { backgroundColor: "transparent", borderColor: "rgba(148,163,184,0.2)" };

const ENVELOPE_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  </span>
);

/** Mobile: same envelope icon for all metric cards per design */
const MOBILE_CARD_ICON = (
  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  </span>
);

/** Overall Risk – shield / risk gauge */
const RISK_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  </span>
);

const ALERT_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <Image src={alertIcon} alt="" width={20} height={20} className="w-5 h-5 object-contain opacity-90" />
  </span>
);

const SCAN_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <Image src={scanIcon} alt="" width={20} height={20} className="w-5 h-5 object-contain opacity-90" />
  </span>
);

/** Scam Patterns – document/magnify */
const SCAM_PATTERN_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  </span>
);

/** Reported Threats – flag / report */
const REPORTED_ICON = (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  </span>
);

const MINI_CHART = (
  <svg className="w-full h-12" viewBox="0 0 120 32" preserveAspectRatio="none">
    <line x1="40" y1="0" x2="40" y2="32" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />
    <line x1="80" y1="0" x2="80" y2="32" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />
    <path fill="rgba(64,102,255,0.2)" d="M 0,18 C 12,8 20,24 30,14 C 40,4 50,22 60,12 C 70,2 78,20 90,10 C 100,22 108,6 120,16 L 120,32 L 0,32 Z" />
    <path fill="none" stroke="#4066FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M 0,18 C 12,8 20,24 30,14 C 40,4 50,22 60,12 C 70,2 78,20 90,10 C 100,22 108,6 120,16" />
  </svg>
);

const RISK_CLASS: Record<string, string> = {
  Dangerous: "text-[#F00500]",
  Safe: "text-[#32BB1D]",
};

const CHART_W = 280;
const CHART_H = 100;
const COMMUNITY_ROWS_PER_PAGE = 10;
const LIVE_SIGNALS_PER_PAGE = 4;
const MOBILE_LIVE_SIGNALS_PREVIEW = 2;
const MOBILE_COMMUNITY_PREVIEW = 5;

function truncateAddress(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 12) return trimmed;
  if (trimmed.startsWith("0x") && trimmed.length > 10) {
    return `${trimmed.slice(0, 5)}...${trimmed.slice(-3)}`;
  }
  return `${trimmed.slice(0, 8)}...${trimmed.slice(-4)}`;
}

function formatSignalTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatRelativeTime(dateValue: string | null | undefined): string {
  if (!dateValue) return "—";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  const diffMs = Date.now() - parsed.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}day${diffDays === 1 ? "" : "s"}`;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function communityThreatTitle(domain: string): string {
  const base = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || domain;
  const name = base.split(".")[0] || base;
  return name.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

const SHIELD_CHECK_ICON = (
  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/80 border border-slate-600/60 shrink-0">
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  </span>
);

function smoothCurvePath(points: Array<{ x: number; y: number }>, tension: number = 0.3): string {
  if (points.length < 2) return "";
  const path: string[] = [`M ${points[0].x},${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    path.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
  }
  return path.join(" ");
}

function chartPathFromDaily(daily: Array<{ day: string; count: number }>): { path: string; areaPath: string; dayLabels: string[]; values: number[] } {
  const values = daily.length ? daily.map((d) => d.count) : [0];
  const dayLabels = daily.length ? daily.map((d) => new Date(d.day).toLocaleDateString("en-US", { weekday: "short" })) : ["—"];
  const max = Math.max(1, ...values);
  const n = values.length;
  const xs = n > 1 ? values.map((_, i) => (i / (n - 1)) * CHART_W) : [0];
  const points = values.map((y, i) => ({ x: xs[i], y: CHART_H - (y / max) * CHART_H }));
  const path = smoothCurvePath(points);
  const basePath = path || `M 0,${CHART_H}`;
  const areaPath = `${basePath} L ${CHART_W},${CHART_H} L 0,${CHART_H} Z`;
  return { path: basePath, areaPath, dayLabels, values };
}

type CommunityThreatRow = {
  domain: string;
  listType: "malicious_domains" | "trusted_domains";
  siteSafety: "Dangerous" | "Safe";
  sourceMetadata: string;
  updatedAt: string;
};

function communityThreatDescription(row: CommunityThreatRow): string {
  if (row.siteSafety === "Dangerous") {
    return `Reported ${row.listType.replace(/_/g, " ")} · ${row.domain}`;
  }
  return `Verified ${row.listType.replace(/_/g, " ")} · ${row.domain}`;
}

function communityRiskLabel(siteSafety: CommunityThreatRow["siteSafety"]): string {
  return siteSafety === "Dangerous" ? "Medium" : "Safe";
}

function communityRiskClass(siteSafety: CommunityThreatRow["siteSafety"]): string {
  return siteSafety === "Dangerous" ? "text-orange-400" : "text-[#32BB1D]";
}

function formatUpdatedAt(dateValue: string | null | undefined): string {
  if (!dateValue) return "—";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCampaignType(value: string): string {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractLiveSignalId(signal: LiveScamSignalSummary): string {
  const raw = signal as Record<string, unknown>;
  const candidates = [
    signal.id,
    signal.signal_id,
    signal.threat_id,
    signal.uuid,
    raw.signalId,
    raw.live_signal_id,
    raw.live_scam_signal_id,
    typeof raw.id === "number" ? String(raw.id) : null,
  ];
  for (let i = 0; i < candidates.length; i += 1) {
    const value = candidates[i];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function liveSignalSummaryToDetails(signal: LiveScamSignalSummary): LiveScamSignalDetailsData {
  return {
    title: signal.threat_type,
    address: signal.address,
    threat_type: signal.threat_type,
    risk_level: signal.risk_level,
    detected_at: signal.detected_at,
    description:
      "Summary from live scam signals list. Full detail requires a signal id on each summary row from the backend.",
  };
}

type ChartData = ReturnType<typeof chartPathFromDaily>;

const MOBILE_BLEED = "-mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)]";
const MOBILE_CARD = "rounded-2xl flex flex-col p-5";
const MOBILE_CARD_BG = { backgroundColor: "#191D35" };

const AI_THREAT_FALLBACK_DESCRIPTION =
  "SenseiGuard uses AI to analyze transaction patterns, contract behavior, and community reports to identify potential threats. Risk levels are updated in real time based on verified reports and on-chain activity.";

const RISK_LEVEL_BADGE_STYLE = {
  backgroundColor: "#25283D",
  color: "#F00500",
  boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.06), 0 2px 4px rgba(0,0,0,0.2)",
  border: "1px solid rgba(0,0,0,0.15)",
} as const;

const VIEW_SUMMARY_BUTTON_STYLE = {
  background: "linear-gradient(to bottom, #5b7cff 0%, #4066FF 35%, #0026FF 70%, #001a99 100%)",
  boxShadow: "0 2px 10px rgba(0,38,255,0.4)",
} as const;

type AiThreatExplanationPanelProps = {
  loading: boolean;
  description: string | undefined;
  riskLevel: string | undefined;
  onViewSummary: () => void;
  compact?: boolean;
};

function AiThreatExplanationPanel({
  loading,
  description,
  riskLevel,
  onViewSummary,
  compact = false,
}: AiThreatExplanationPanelProps) {
  const displayDescription = loading ? "—" : (description ?? AI_THREAT_FALLBACK_DESCRIPTION);
  const displayRiskLevel = loading ? "—" : (riskLevel ?? "—");

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        {compact ? MOBILE_CARD_ICON : ENVELOPE_ICON}
        <h2 className={compact ? "text-base font-medium text-white" : "text-lg font-medium text-slate-200"}>
          AI Threat Explanation
        </h2>
      </div>
      <p className={`${compact ? "text-sm" : "text-base"} text-slate-400 leading-relaxed flex-1`}>
        {displayDescription}
      </p>
      <div className={`mt-4 flex gap-4 flex-wrap ${compact ? "items-stretch" : "items-center justify-between"}`}>
        <div
          className={`rounded-lg font-medium ${compact ? "px-3 py-2.5 flex-1 text-center text-sm" : "px-4 py-2.5 w-fit text-base"}`}
          style={RISK_LEVEL_BADGE_STYLE}
        >
          Risk Level: {displayRiskLevel}
        </div>
        <button
          type="button"
          onClick={onViewSummary}
          className={`rounded-lg font-medium text-white transition text-center shrink-0 ${
            compact ? "py-2.5 px-4 flex-1" : "py-3 px-6"
          }`}
          style={VIEW_SUMMARY_BUTTON_STYLE}
        >
          View Summary
        </button>
      </div>
    </>
  );
}

type ScamFrequencyChartProps = {
  periodLabel: string;
  chartData: ChartData;
  highlightDayIndex: number;
  setHighlightDayIndex: (index: number) => void;
  highlightX: number;
  highlightY: number;
  highlightValue: string;
  compact?: boolean;
};

function ScamFrequencyChartPanel({
  periodLabel,
  chartData,
  highlightDayIndex,
  setHighlightDayIndex,
  highlightX,
  highlightY,
  highlightValue,
  compact = false,
}: ScamFrequencyChartProps) {
  const yMax = chartData.values.length ? Math.max(1, ...chartData.values) : 1;
  const yTicks = compact
    ? [yMax, Math.round((yMax * 2) / 3), Math.round(yMax / 3), 0]
    : [yMax, 0];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {compact ? MOBILE_CARD_ICON : SCAN_ICON}
          <h2 className={compact ? "text-base font-medium text-white" : "text-lg font-medium text-slate-200"}>
            Scam Pattern Insights
          </h2>
        </div>
        <span className={compact ? "text-xs text-slate-500 capitalize" : "text-sm text-slate-500 capitalize"}>
          {periodLabel}
        </span>
      </div>
      <div className={`flex-1 flex flex-col ${compact ? "min-h-[220px]" : "min-h-[220px] xl:min-h-0"}`}>
        <p className={`${compact ? "text-sm" : "text-base"} font-medium text-slate-400 mb-2`}>Scam Frequency</p>
        <div
          className="relative flex-1 min-h-[180px] flex gap-2 items-stretch mt-2 overflow-visible"
          style={{ maxHeight: compact ? 220 : 260 }}
        >
          <div className="flex flex-col justify-between py-0.5 text-slate-400 text-xs font-medium shrink-0 w-8">
            {yTicks.map((tick, i) => (
              <span key={i}>{tick}</span>
            ))}
          </div>
          <div className="flex-1 min-w-0 relative overflow-visible">
            <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-full" preserveAspectRatio="none">
              {[0, 1, 2, 3].map((i) => (
                <line
                  key={i}
                  x1={0}
                  y1={CHART_H - (i / 3) * CHART_H}
                  x2={CHART_W}
                  y2={CHART_H - (i / 3) * CHART_H}
                  stroke="rgba(148,163,184,0.25)"
                  strokeWidth="0.8"
                />
              ))}
              <path fill="rgba(64,102,255,0.2)" d={chartData.areaPath} />
              <path fill="none" stroke="#4066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={chartData.path} />
              <line x1={highlightX} y1={highlightY} x2={highlightX} y2={CHART_H} stroke="#0026FF" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
            <div
              className="absolute z-10 w-4 h-4 rounded-full pointer-events-none bg-[#32BB1D]"
              style={{
                left: `${(highlightX / CHART_W) * 100}%`,
                top: `${(highlightY / CHART_H) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
            <div
              className="absolute z-10 pointer-events-none text-sm font-semibold whitespace-nowrap text-white"
              style={{
                left: `${(highlightX / CHART_W) * 100}%`,
                top: `${(highlightY / CHART_H) * 100}%`,
                transform: "translate(-50%, -100%) translateY(-8px)",
              }}
            >
              {highlightValue}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-2 items-center">
          <div className="w-8 shrink-0" aria-hidden />
          <div className={`flex justify-between text-slate-500 w-[92%] min-w-0 tracking-tight ${compact ? "text-xs" : "text-sm"}`}>
            {chartData.dayLabels.length ? (
              chartData.dayLabels.map((d, i) => (
                <button
                  key={`${d}-${i}`}
                  type="button"
                  onClick={() => setHighlightDayIndex(i)}
                  className={`shrink-0 transition ${highlightDayIndex === i ? "text-[#0026FF] font-semibold" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {d}
                </button>
              ))
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

type LiveScamSignalsPanelProps = {
  mounted: boolean;
  loading: boolean;
  signals: LiveScamSignalSummary[];
  pagedSignals: LiveScamSignalSummary[];
  page: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  onViewDetails: (signal: LiveScamSignalSummary) => void;
  compact?: boolean;
  variant?: "default" | "mobile";
};

function LiveScamSignalsPanel({
  mounted,
  loading,
  signals,
  pagedSignals,
  page,
  totalPages,
  setPage,
  onViewDetails,
  compact = false,
  variant = "default",
}: LiveScamSignalsPanelProps) {
  const isMobile = variant === "mobile";
  const visibleSignals = isMobile ? signals.slice(0, MOBILE_LIVE_SIGNALS_PREVIEW) : pagedSignals;

  return (
    <div className={compact && !isMobile ? "mt-5 pt-5 border-t border-slate-700/40" : isMobile ? "" : "mt-6 pt-4"}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={isMobile || compact ? "text-base font-medium text-white" : "text-base font-medium text-slate-200"}>
          Live Scam Signals
        </h3>
        <button
          type="button"
          className={`font-medium hover:underline ${isMobile || compact ? "text-xs text-slate-500" : "text-sm text-white"}`}
        >
          View all
        </button>
      </div>
      <ul className="space-y-3">
        {!mounted ? (
          <li className="rounded-xl p-4 bg-[#25283D] border border-slate-700/50 text-slate-500 text-sm">Loading…</li>
        ) : loading ? (
          <li className="rounded-xl p-4 bg-[#25283D] border border-slate-700/50 text-slate-500 text-sm">Loading live scam signals…</li>
        ) : !signals.length ? (
          <li className="rounded-xl p-4 bg-[#25283D] border border-slate-700/50 text-slate-500 text-sm">No live scam signals.</li>
        ) : (
          visibleSignals.map((signal, i) => (
            <li key={extractLiveSignalId(signal) || `${signal.address}-${i}`}>
              {isMobile ? (
                <button
                  type="button"
                  onClick={() => onViewDetails(signal)}
                  className="w-full rounded-xl p-4 bg-[#25283D] border border-slate-700/50 text-left transition hover:border-slate-600/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        {truncateAddress(signal.address)}
                      </p>
                      <p className="text-xs text-slate-400">{signal.threat_type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-slate-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        {formatSignalTime(signal.detected_at)}
                      </span>
                      <span className="text-xs font-bold text-[#F00500]">{signal.risk_level}</span>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="rounded-xl p-4 bg-[#25283D] border border-slate-700/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-base font-semibold text-white truncate" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        {signal.address}
                      </p>
                      <p className="text-sm text-slate-400">{signal.threat_type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className="text-sm text-slate-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        {signal.detected_at}
                      </span>
                      <span className="text-sm font-bold text-[#F00500]">{signal.risk_level}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => onViewDetails(signal)}
                      className="rounded-lg px-3 py-2 text-xs font-medium text-white border border-slate-600/60 bg-[#1f243c] hover:bg-[#29314f] transition"
                    >
                      View details
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
      {!isMobile && !loading && signals.length > LIVE_SIGNALS_PER_PAGE && (
        <div className="flex items-center justify-between gap-3 mt-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-[#25283D] border border-slate-600/50 hover:border-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-[#25283D] border border-slate-600/50 hover:border-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

type CommunityReportedThreatsPanelProps = {
  mounted: boolean;
  loading: boolean;
  rows: CommunityThreatRow[];
};

function CommunityReportedThreatsPanel({ mounted, loading, rows }: CommunityReportedThreatsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded ? rows : rows.slice(0, MOBILE_COMMUNITY_PREVIEW);
  const canExpand = rows.length > MOBILE_COMMUNITY_PREVIEW;

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          {SHIELD_CHECK_ICON}
          <h3 className="text-sm font-semibold text-white truncate">Community-Reported Threats</h3>
        </div>
        {canExpand && !expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-xs font-medium text-[#4066FF] hover:underline shrink-0"
          >
            See More
          </button>
        ) : null}
      </div>
      <ul>
        {!mounted ? (
          <li className="py-4 text-slate-500 text-sm">Loading…</li>
        ) : loading ? (
          <li className="py-4 text-slate-500 text-sm">Loading community reports…</li>
        ) : !rows.length ? (
          <li className="py-4 text-slate-500 text-sm">No community-reported threats.</li>
        ) : (
          visibleRows.map((row, i) => (
            <li
              key={`${row.domain}-${i}`}
              className={`flex items-start justify-between gap-4 py-4 ${i < visibleRows.length - 1 ? "border-b border-slate-700/50" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{communityThreatTitle(row.domain)}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{communityThreatDescription(row)}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-xs font-semibold ${communityRiskClass(row.siteSafety)}`}>
                  {communityRiskLabel(row.siteSafety)}
                </span>
                <span className="text-xs text-slate-400">{formatRelativeTime(row.updatedAt)}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </>
  );
}

type ThreatCampaignsPanelProps = {
  mounted: boolean;
  loading: boolean;
  campaigns: ThreatCampaign[];
};

function ThreatCampaignsPanel({ mounted, loading, campaigns }: ThreatCampaignsPanelProps) {
  return (
    <div className="mt-6 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-slate-200">Threat campaigns</h3>
        <span className="text-xs text-slate-500">Correlated activity clusters</span>
      </div>
      <ul className="space-y-3">
        {!mounted ? (
          <li className="rounded-xl p-4 bg-[#25283D] border border-slate-700/50 text-slate-500 text-sm">Loading…</li>
        ) : loading ? (
          <li className="rounded-xl p-4 bg-[#25283D] border border-slate-700/50 text-slate-500 text-sm">Loading threat campaigns…</li>
        ) : !campaigns.length ? (
          <li className="rounded-xl p-4 bg-[#25283D] border border-slate-700/50 text-slate-500 text-sm">No correlated campaigns detected.</li>
        ) : (
          campaigns.slice(0, 5).map((campaign) => (
            <li key={campaign.id} className="rounded-xl p-4 bg-[#25283D] border border-slate-700/50 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{formatCampaignType(campaign.campaign_type)}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{campaign.status}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#F00500]">Risk {campaign.risk_score}</p>
                  <p className="text-xs text-slate-400">{campaign.confidence_score}% confidence</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{campaign.narrative}</p>
              {campaign.signal_categories?.length ? (
                <p className="text-xs text-slate-400">Signals: {campaign.signal_categories.join(", ")}</p>
              ) : null}
              <p className="text-xs text-slate-500">
                {campaign.evidence_count} evidence item{campaign.evidence_count !== 1 ? "s" : ""} · Last seen{" "}
                {formatUpdatedAt(campaign.last_seen_at)}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function detailValueToText(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return "—";
  }
}

export default function ThreatIntelligencePage() {
  const { activeAddress: address } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [securityOverview, setSecurityOverview] = useState<SecurityOverviewData | null>(null);
  const [securityOverviewLoading, setSecurityOverviewLoading] = useState(false);
  const [domainThreatFeed, setDomainThreatFeed] = useState<DomainThreatFeedData | null>(null);
  const [domainThreatFeedLoading, setDomainThreatFeedLoading] = useState(false);
  const { query, setQuery } = useGuardSearch();
  const [riskFilter, setRiskFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [liveSignalsPage, setLiveSignalsPage] = useState(1);
  const [highlightDayIndex, setHighlightDayIndex] = useState(0);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [liveSignalDetailsOpen, setLiveSignalDetailsOpen] = useState(false);
  const [liveSignalDetailsLoading, setLiveSignalDetailsLoading] = useState(false);
  const [liveSignalDetailsError, setLiveSignalDetailsError] = useState("");
  const [selectedLiveSignal, setSelectedLiveSignal] = useState<LiveScamSignalSummary | null>(null);
  const [selectedLiveSignalDetails, setSelectedLiveSignalDetails] = useState<LiveScamSignalDetailsData | null>(null);
  const [liveScamSignals, setLiveScamSignals] = useState<LiveScamSignalSummary[]>([]);
  const [liveScamSignalsLoading, setLiveScamSignalsLoading] = useState(false);
  const [threatCampaigns, setThreatCampaigns] = useState<ThreatCampaign[]>([]);
  const [threatCampaignsLoading, setThreatCampaignsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !address?.trim()) {
      setSecurityOverview(null);
      return;
    }
    setSecurityOverviewLoading(true);
    getSecurityOverview(address)
      .then(setSecurityOverview)
      .finally(() => setSecurityOverviewLoading(false));
  }, [mounted, address]);

  useEffect(() => {
    if (!mounted) return;
    setDomainThreatFeedLoading(true);
    getDomainThreatFeed()
      .then(setDomainThreatFeed)
      .finally(() => setDomainThreatFeedLoading(false));
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    setLiveScamSignalsLoading(true);
    getLiveScamSignalsSummary(address?.trim() || undefined, 50)
      .then(setLiveScamSignals)
      .finally(() => setLiveScamSignalsLoading(false));
  }, [mounted, address]);

  useEffect(() => {
    if (!mounted) return;
    setThreatCampaignsLoading(true);
    getThreatCampaigns(address?.trim() || undefined)
      .then(setThreatCampaigns)
      .finally(() => setThreatCampaignsLoading(false));
  }, [mounted, address]);

  const communityThreatRows = useMemo<CommunityThreatRow[]>(() => {
    if (!domainThreatFeed) return [];
    const maliciousSourceMetadata = `activity:${domainThreatFeed.sources?.from_activity_feed ?? 0}, env:${domainThreatFeed.sources?.from_env_blocklist ?? 0}`;
    const trustedSourceMetadata = `static_trusted:${domainThreatFeed.sources?.static_trusted ?? 0}`;
    const maliciousRows: CommunityThreatRow[] = (domainThreatFeed.malicious_domains || []).map((domain) => ({
      domain,
      listType: "malicious_domains",
      siteSafety: "Dangerous",
      sourceMetadata: maliciousSourceMetadata,
      updatedAt: formatUpdatedAt(domainThreatFeed.updated_at),
    }));
    const trustedRows: CommunityThreatRow[] = (domainThreatFeed.trusted_domains || []).map((domain) => ({
      domain,
      listType: "trusted_domains",
      siteSafety: "Safe",
      sourceMetadata: trustedSourceMetadata,
      updatedAt: formatUpdatedAt(domainThreatFeed.updated_at),
    }));
    return [...maliciousRows, ...trustedRows];
  }, [domainThreatFeed]);

  const filteredCommunityRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return communityThreatRows.filter((row) => {
      const matchesSearch =
        !q ||
        row.domain.toLowerCase().includes(q) ||
        row.listType.toLowerCase().includes(q) ||
        row.siteSafety.toLowerCase().includes(q);
      const matchesRisk = riskFilter === "All" || row.siteSafety === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [communityThreatRows, riskFilter, query]);

  useEffect(() => {
    setPage(1);
  }, [query, riskFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCommunityRows.length / COMMUNITY_ROWS_PER_PAGE));
  const pagedCommunityRows = filteredCommunityRows.slice(
    (page - 1) * COMMUNITY_ROWS_PER_PAGE,
    page * COMMUNITY_ROWS_PER_PAGE
  );
  const liveSignalsTotalPages = Math.max(1, Math.ceil(liveScamSignals.length / LIVE_SIGNALS_PER_PAGE));
  const pagedLiveScamSignals = liveScamSignals.slice(
    (liveSignalsPage - 1) * LIVE_SIGNALS_PER_PAGE,
    liveSignalsPage * LIVE_SIGNALS_PER_PAGE
  );

  const daily = securityOverview?.scam_pattern_insights?.daily ?? [];
  const chartData = chartPathFromDaily(daily);
  const safeHighlightIndex = Math.min(highlightDayIndex, Math.max(0, chartData.values.length - 1));
  const highlightX = chartData.values.length > 1 ? (safeHighlightIndex / (chartData.values.length - 1)) * CHART_W : 0;
  const highlightY = chartData.values.length ? CHART_H - (chartData.values[safeHighlightIndex] / Math.max(1, ...chartData.values)) * CHART_H : CHART_H;
  const highlightValue = chartData.values.length ? String(chartData.values[safeHighlightIndex]) : "0";

  useEffect(() => {
    setLiveSignalsPage(1);
  }, [address, liveScamSignals.length]);

  useEffect(() => {
    if (liveSignalsPage > liveSignalsTotalPages) {
      setLiveSignalsPage(liveSignalsTotalPages);
    }
  }, [liveSignalsPage, liveSignalsTotalPages]);

  const openLiveSignalDetails = async (signal: LiveScamSignalSummary) => {
    const signalId = extractLiveSignalId(signal);
    console.log('[Threat Intelligence] Live scam signal clicked:', {
      signalId: signalId || null,
      walletAddress: address?.trim() || null,
      signal,
      signalKeys: Object.keys(signal as object),
    });
    setSelectedLiveSignal(signal);
    setSelectedLiveSignalDetails(null);
    setLiveSignalDetailsError("");
    setLiveSignalDetailsOpen(true);

    if (!signalId) {
      console.warn(
        '[Threat Intelligence] No signal id on live scam signals summary row — cannot call GET /dashboard/live-scam-signals/{id}. Backend should include id, signal_id, or threat_id on each item.',
        signal
      );
      setLiveSignalDetailsError(
        "This signal has no id in the summary response, so the detail API cannot be called. Showing summary data only — ask backend to include signal id on GET /live-scam-signals/summary items."
      );
      setSelectedLiveSignalDetails(liveSignalSummaryToDetails(signal));
      return;
    }

    setLiveSignalDetailsLoading(true);
    try {
      const details = await getLiveScamSignalDetails(signalId, address?.trim() || undefined);
      console.log('[Threat Intelligence] Live scam signal details result:', details);
      if (!details) {
        setLiveSignalDetailsError("Could not load signal details. Check console for API response.");
        setSelectedLiveSignalDetails(liveSignalSummaryToDetails(signal));
      } else {
        setSelectedLiveSignalDetails(details);
      }
    } finally {
      setLiveSignalDetailsLoading(false);
    }
  };

  const chartPeriodLabel = securityOverview?.scam_pattern_insights?.period?.replace(/_/g, " ") ?? "Last 7 days";
  const aiThreatDescription = securityOverview?.ai_threat_explanation?.description;
  const aiThreatRiskLevel =
    securityOverview?.ai_threat_explanation?.risk_level ?? securityOverview?.overall_risk?.risk_level;
  const aiThreatPanelProps = {
    loading: securityOverviewLoading,
    description: aiThreatDescription,
    riskLevel: aiThreatRiskLevel,
    onViewSummary: () => setSummaryModalOpen(true),
  };
  const chartPanelProps = {
    periodLabel: chartPeriodLabel,
    chartData,
    highlightDayIndex,
    setHighlightDayIndex,
    highlightX,
    highlightY,
    highlightValue,
  };
  const liveSignalsPanelProps = {
    mounted,
    loading: liveScamSignalsLoading,
    signals: liveScamSignals,
    pagedSignals: pagedLiveScamSignals,
    page: liveSignalsPage,
    totalPages: liveSignalsTotalPages,
    setPage: setLiveSignalsPage,
    onViewDetails: openLiveSignalDetails,
  };

  return (
    <div className="rounded-2xl p-4 xl:p-6 space-y-4 xl:space-y-6 xl:bg-blue-950/25 xl:border xl:border-blue-900/40">
      {/* Mobile: full vertical stack for redesign */}
      <div className={`xl:hidden flex flex-col gap-4 ${MOBILE_BLEED}`}>
        <div className="grid grid-cols-2 gap-3">
          <div className={`${MOBILE_CARD} min-h-[160px]`} style={MOBILE_CARD_BG}>
              <div className="flex items-center gap-2 mb-2">
                {MOBILE_CARD_ICON}
                <h2 className="text-sm font-medium text-white whitespace-nowrap">Overall Risk</h2>
              </div>
              <span className="rounded-lg px-2.5 py-1 text-xs font-medium text-orange-400 shrink-0 w-fit bg-slate-700/70 border border-slate-600/50 mb-auto">{securityOverviewLoading ? "—" : (securityOverview?.overall_risk?.risk_level ?? "—")}</span>
              <div className="flex items-end justify-between gap-2 mt-2">
                <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                  <span className="text-2xl font-normal text-white">{securityOverviewLoading ? "—" : `${securityOverview?.overall_risk?.risk_score ?? "—"}/`}<span className="text-lg">100</span></span>
                  <p className="text-xs text-slate-500 self-end pb-0.5">Risk Score</p>
                </div>
                <div className="w-[26%] min-w-[56px] h-9 shrink-0 self-center">
                  {MINI_CHART}
                </div>
              </div>
            </div>
          <div className={`${MOBILE_CARD} min-h-[160px]`} style={MOBILE_CARD_BG}>
              <div className="flex items-center gap-2 mb-2">
                {MOBILE_CARD_ICON}
                <h2 className="text-sm font-medium text-white whitespace-nowrap">Active Threats</h2>
              </div>
              <span className="text-xs text-slate-400 shrink-0 mb-auto">Networks Affected: {securityOverviewLoading ? "—" : (securityOverview?.active_threats?.networks_affected ?? "—")}</span>
              <div className="flex items-end justify-between gap-2 mt-2">
                <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                  <span className="text-2xl font-normal text-white">{securityOverviewLoading ? "—" : (securityOverview?.active_threats?.count ?? "—")}</span>
                  <p className="text-xs text-slate-500 self-end pb-0.5">Currently Detected</p>
                </div>
                <div className="w-[26%] min-w-[56px] h-9 shrink-0 self-center">
                  {MINI_CHART}
                </div>
              </div>
            </div>
            <div className={`${MOBILE_CARD} min-h-[160px]`} style={MOBILE_CARD_BG}>
              <div className="flex items-center gap-2 mb-2">
                {MOBILE_CARD_ICON}
                <h2 className="text-sm font-medium text-white whitespace-nowrap">Scam Patterns</h2>
              </div>
              <span className="rounded-lg px-2.5 py-1 text-xs font-medium shrink-0 w-fit bg-slate-700/70 border border-slate-600/50 mb-auto" style={{ color: "#32BB1D" }}>{securityOverviewLoading ? "—" : (securityOverview?.scam_patterns?.status ?? "—")}</span>
              <div className="flex items-end justify-between gap-2 mt-2">
                <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                  <span className="text-2xl font-normal text-white">{securityOverviewLoading ? "—" : (securityOverview?.scam_patterns?.detected_count ?? "—")}</span>
                  <p className="text-xs text-slate-500 self-end pb-0.5">Detected Patterns</p>
                </div>
                <div className="w-[26%] min-w-[56px] h-9 shrink-0 self-center">
                  {MINI_CHART}
                </div>
              </div>
            </div>
            <div className={`${MOBILE_CARD} min-h-[160px]`} style={MOBILE_CARD_BG}>
              <div className="flex items-center gap-2 mb-2">
                {MOBILE_CARD_ICON}
                <h2 className="text-xs font-medium text-white whitespace-nowrap">Reported Threats</h2>
              </div>
              <span className="text-xs text-slate-400 shrink-0 mb-auto">{securityOverviewLoading ? "—" : `${securityOverview?.reported_threats?.verified ?? "—"} Verified`}</span>
              <div className="flex items-end justify-between gap-2 mt-2">
                <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                  <span className="text-2xl font-normal text-white">{securityOverviewLoading ? "—" : ((securityOverview?.reported_threats?.verified ?? 0) + (securityOverview?.reported_threats?.detected ?? 0))}</span>
                  <p className="text-xs text-slate-500 self-end pb-0.5">Currently Detected</p>
                </div>
                <div className="w-[26%] min-w-[56px] h-9 shrink-0 self-center">
                  {MINI_CHART}
                </div>
              </div>
            </div>
        </div>

        <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
          <AiThreatExplanationPanel compact {...aiThreatPanelProps} />
        </div>

        <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
          <ScamFrequencyChartPanel compact {...chartPanelProps} />
        </div>

        <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
          <LiveScamSignalsPanel variant="mobile" {...liveSignalsPanelProps} />
        </div>

        <div className={MOBILE_CARD} style={MOBILE_CARD_BG}>
          <CommunityReportedThreatsPanel
            mounted={mounted}
            loading={domainThreatFeedLoading}
            rows={filteredCommunityRows.filter((row) => row.siteSafety === "Dangerous")}
          />
        </div>
      </div>

      {/* Desktop: metrics + AI | scam insights sidebar */}
      <div className="hidden xl:grid xl:grid-cols-[1.2fr_0.8fr] gap-4 items-stretch">
        <div className="flex flex-col gap-4 min-w-0">
          <div className="grid grid-cols-2 gap-4">
          <div className={`${CARD_STYLE} min-h-[200px] flex flex-col`} style={CARD_BG}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                {RISK_ICON}
                <h2 className="text-lg font-medium text-slate-200 whitespace-nowrap">Overall Risk</h2>
              </div>
              <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-orange-400 shrink-0 whitespace-nowrap bg-slate-700/70 border border-slate-600/50">{securityOverviewLoading ? "—" : (securityOverview?.overall_risk?.risk_level ?? "—")}</span>
            </div>
            <div className="mt-auto">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-4xl font-normal text-slate-200">{securityOverviewLoading ? "—" : `${securityOverview?.overall_risk?.risk_score ?? "—"}/`}<span className="text-2xl">100</span></span>
                  <p className="text-sm text-slate-500 self-end pb-1">Risk Score</p>
                </div>
                <div className="w-[28%] min-w-[70px] h-11 shrink-0 self-center">
                  {MINI_CHART}
                </div>
              </div>
            </div>
          </div>

          <div className={`${CARD_STYLE} min-h-[200px] flex flex-col`} style={CARD_BG}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                {ALERT_ICON}
                <h2 className="text-lg font-medium text-slate-200 whitespace-nowrap">Active Threats</h2>
              </div>
              <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700/70 border border-slate-600/50 shrink-0 whitespace-nowrap">Networks Affected: {securityOverviewLoading ? "—" : (securityOverview?.active_threats?.networks_affected ?? "—")}</span>
            </div>
            <div className="mt-auto">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-4xl font-normal text-slate-200">{securityOverviewLoading ? "—" : (securityOverview?.active_threats?.count ?? "—")}</span>
                  <p className="text-sm text-slate-500 self-end pb-1">Currently Detected</p>
                </div>
                <div className="w-[28%] min-w-[70px] h-11 shrink-0 self-center">
                  {MINI_CHART}
                </div>
              </div>
            </div>
          </div>

          <div className={`${CARD_STYLE} min-h-[200px] flex flex-col`} style={CARD_BG}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                {SCAM_PATTERN_ICON}
                <h2 className="text-lg font-medium text-slate-200 whitespace-nowrap">Scam Patterns</h2>
              </div>
              <span className="rounded-lg px-3 py-1.5 text-sm font-medium shrink-0 whitespace-nowrap bg-slate-700/70 border border-slate-600/50" style={{ color: "#32BB1D" }}>{securityOverviewLoading ? "—" : (securityOverview?.scam_patterns?.status ?? "—")}</span>
            </div>
            <div className="mt-auto">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-4xl font-normal text-slate-200">{securityOverviewLoading ? "—" : (securityOverview?.scam_patterns?.detected_count ?? "—")}</span>
                  <p className="text-sm text-slate-500 self-end pb-1">Detected Patterns</p>
                </div>
                <div className="w-[28%] min-w-[70px] h-11 shrink-0 self-center">
                  {MINI_CHART}
                </div>
              </div>
            </div>
          </div>

          <div className={`${CARD_STYLE} min-h-[200px] flex flex-col`} style={CARD_BG}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                {REPORTED_ICON}
                <h2 className="text-lg font-medium text-slate-200 whitespace-nowrap">Reported Threats</h2>
              </div>
              <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700/70 border border-slate-600/50 shrink-0 whitespace-nowrap">{securityOverviewLoading ? "—" : `${securityOverview?.reported_threats?.verified ?? "—"} Verified`}</span>
            </div>
            <div className="mt-auto">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-4xl font-normal text-slate-200">{securityOverviewLoading ? "—" : ((securityOverview?.reported_threats?.verified ?? 0) + (securityOverview?.reported_threats?.detected ?? 0))}</span>
                  <p className="text-sm text-slate-500 self-end pb-1">Currently Detected</p>
                </div>
                <div className="w-[28%] min-w-[70px] h-11 shrink-0 self-center">
                  {MINI_CHART}
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* AI Threat Explanation */}
          <div className={`${CARD_STYLE} flex flex-col max-w-4xl w-full`} style={CARD_BG}>
            <AiThreatExplanationPanel {...aiThreatPanelProps} />
          </div>
        </div>

        <div className={`${CARD_STYLE} flex flex-col min-h-[320px] xl:h-full xl:min-h-0`} style={CARD_BG}>
          <ScamFrequencyChartPanel {...chartPanelProps} />
          <LiveScamSignalsPanel {...liveSignalsPanelProps} />
          <ThreatCampaignsPanel mounted={mounted} loading={threatCampaignsLoading} campaigns={threatCampaigns} />
        </div>
      </div>

      {/* Domain threat feed — desktop only during mobile redesign */}
      <div className={`hidden xl:flex ${CARD_STYLE} flex-col`} style={CARD_BG}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {ENVELOPE_ICON}
            <h2 className="text-lg font-medium text-slate-200">Domain threat feed</h2>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <div className="relative w-full max-w-[200px] min-w-[120px]">
              <input
                type="search"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
                <option value="Dangerous">Dangerous</option>
                <option value="Safe">Safe</option>
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

        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-sm border-separate" style={{ borderSpacing: "0 8px" }}>
            <thead style={{ backgroundColor: "#25283D" }} className="sticky top-0 z-10">
              <tr className="text-slate-300">
                <th className="text-left py-3 px-4 font-medium rounded-tl-lg rounded-bl-lg whitespace-nowrap">Domain</th>
                <th className="text-left py-3 px-4 font-medium whitespace-nowrap">List Type</th>
                <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Site Safety</th>
                <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Source Metadata</th>
                <th className="text-left py-3 px-4 font-medium rounded-tr-lg rounded-br-lg whitespace-nowrap">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {domainThreatFeedLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 px-4 text-slate-400">Loading domain threat feed…</td>
                </tr>
              ) : !pagedCommunityRows.length ? (
                <tr>
                  <td colSpan={5} className="py-6 px-4 text-slate-400">No domain threat feed entries found for current filters.</td>
                </tr>
              ) : (
                pagedCommunityRows.map((row, i) => (
                  <tr key={`${row.domain}-${i}`} className="text-slate-300 hover:bg-slate-700/20 transition-colors bg-[#25283D]/50 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
                    <td className="py-3 px-4 font-medium text-white whitespace-nowrap">{row.domain}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">{row.listType}</td>
                    <td className="py-3 px-4 whitespace-nowrap"><span className={`font-medium ${RISK_CLASS[row.siteSafety]}`}>{row.siteSafety}</span></td>
                    <td className="py-3 px-4 text-slate-300 max-w-[260px] truncate">{row.sourceMetadata}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>{row.updatedAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-700/50">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white bg-[#25283D] border border-slate-600/50 hover:border-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
            ← Prev 10
          </button>
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          </div>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white bg-[#25283D] border border-slate-600/50 hover:border-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
            Next 10 →
          </button>
        </div>
      </div>

      {liveSignalDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden onClick={() => setLiveSignalDetailsOpen(false)} />
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5" style={{ backgroundColor: "#1B1B1B" }}>
              <h3 className="text-lg font-normal text-white">Live scam signal details</h3>
              <button
                type="button"
                onClick={() => setLiveSignalDetailsOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 transition"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4" style={{ backgroundColor: "#191b28" }}>
              {liveSignalDetailsLoading ? (
                <p className="text-sm text-slate-400">Loading details…</p>
              ) : liveSignalDetailsError ? (
                <p className="text-sm text-red-300">{liveSignalDetailsError}</p>
              ) : selectedLiveSignalDetails ? (
                <>
                  <div className="rounded-lg border border-slate-700/60 p-4 bg-[#25283D]">
                    <p className="text-sm text-slate-300">
                      <span className="text-slate-400">Signal:</span>{" "}
                      {selectedLiveSignalDetails.title || selectedLiveSignal?.threat_type || "Unknown"}
                    </p>
                    <p className="text-sm text-slate-300 mt-1">
                      <span className="text-slate-400">Address:</span>{" "}
                      {selectedLiveSignal?.address || detailValueToText(selectedLiveSignalDetails.address)}
                    </p>
                    <p className="text-sm text-slate-300 mt-1">
                      <span className="text-slate-400">Risk Level:</span>{" "}
                      {selectedLiveSignalDetails.risk_level || selectedLiveSignal?.risk_level || "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-700/60 p-4 bg-[#25283D] space-y-2">
                    {Object.entries(selectedLiveSignalDetails).map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between gap-4 text-sm">
                        <span className="text-slate-400">{key.replace(/_/g, " ")}</span>
                        <span className="text-slate-200 text-right break-all max-w-[65%]">{detailValueToText(value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">No details available.</p>
              )}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setLiveSignalDetailsOpen(false)}
                  className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition"
                  style={{ background: "linear-gradient(to bottom, #5B7CFF 0%, #4066FF 50%, #0026FF 100%)", boxShadow: "0 4px 15px rgba(0,38,255,0.6)" }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI threat explanation modal - matches wallet security modal styling */}
      {summaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden onClick={() => setSummaryModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header - same as wallet modal */}
            <div className="flex items-center justify-between p-5" style={{ backgroundColor: "#1B1B1B" }}>
              <h3 className="text-lg font-normal text-white">AI threat explanation</h3>
              <button
                type="button"
                onClick={() => setSummaryModalOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 transition"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {/* Body - reasons from api ai_threat_explanation */}
            <div className="p-5" style={{ backgroundColor: "#191b28" }}>
              <p className="text-base font-medium text-white mb-3">AI-Detected Scam-Like Behavior Summary</p>
              {securityOverview?.ai_threat_explanation?.description && (
                <p className="text-sm text-slate-400 mb-4">{securityOverview.ai_threat_explanation.description}</p>
              )}
              <div className="rounded-lg p-4 pl-5 mb-6 text-sm text-slate-400 font-normal leading-relaxed text-left border border-slate-700/60 border-l-4" style={{ backgroundColor: "#25283D", borderLeftColor: "#0026FF" }}>
                {securityOverview?.ai_threat_explanation?.reasons?.length ? (
                  <ul className="space-y-2 list-disc list-inside">
                    {securityOverview.ai_threat_explanation.reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No reasons available. Review your wallet activity and approvals.</p>
                )}
              </div>
              <div className="flex gap-4 justify-center w-full">
                <button
                  type="button"
                  onClick={() => setSummaryModalOpen(false)}
                  className="rounded-lg py-2.5 text-sm font-semibold text-white transition min-w-[160px] flex-1"
                  style={{ background: "linear-gradient(to bottom, #505050 0%, #333333 100%)", boxShadow: "0 2px 5px rgba(0,0,0,0.4)" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setSummaryModalOpen(false)}
                  className="rounded-lg py-2.5 text-sm font-semibold text-white transition min-w-[160px] flex-1"
                  style={{ background: "linear-gradient(to bottom, #5B7CFF 0%, #4066FF 50%, #0026FF 100%)", boxShadow: "0 4px 15px rgba(0,38,255,0.6)" }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
