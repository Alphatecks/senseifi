"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";

import { useWallet } from "@/hooks/useWallet";
import { getDomainThreatFeed, getSecurityOverview } from "@/services/dashboardService";
import type { DomainThreatFeedData, SecurityOverviewData } from "@/services/dashboardService";

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

export default function ThreatIntelligencePage() {
  const { activeAddress: address } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [securityOverview, setSecurityOverview] = useState<SecurityOverviewData | null>(null);
  const [securityOverviewLoading, setSecurityOverviewLoading] = useState(false);
  const [domainThreatFeed, setDomainThreatFeed] = useState<DomainThreatFeedData | null>(null);
  const [domainThreatFeedLoading, setDomainThreatFeedLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [highlightDayIndex, setHighlightDayIndex] = useState(0);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

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
    const query = search.trim().toLowerCase();
    return communityThreatRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.domain.toLowerCase().includes(query) ||
        row.listType.toLowerCase().includes(query) ||
        row.siteSafety.toLowerCase().includes(query);
      const matchesRisk = riskFilter === "All" || row.siteSafety === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [communityThreatRows, riskFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [search, riskFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCommunityRows.length / COMMUNITY_ROWS_PER_PAGE));
  const pagedCommunityRows = filteredCommunityRows.slice(
    (page - 1) * COMMUNITY_ROWS_PER_PAGE,
    page * COMMUNITY_ROWS_PER_PAGE
  );

  const daily = securityOverview?.scam_pattern_insights?.daily ?? [];
  const chartData = chartPathFromDaily(daily);
  const safeHighlightIndex = Math.min(highlightDayIndex, Math.max(0, chartData.values.length - 1));
  const highlightX = chartData.values.length > 1 ? (safeHighlightIndex / (chartData.values.length - 1)) * CHART_W : 0;
  const highlightY = chartData.values.length ? CHART_H - (chartData.values[safeHighlightIndex] / Math.max(1, ...chartData.values)) * CHART_H : CHART_H;
  const highlightValue = chartData.values.length ? String(chartData.values[safeHighlightIndex]) : "0";

  return (
    <div className="rounded-2xl p-6 space-y-6 xl:bg-blue-950/25 xl:border xl:border-blue-900/40">
      {/* Top: 2x2 stat grid + AI (left) | Scam Pattern Insights stretches (right) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4 items-stretch">
        <div className="flex flex-col gap-4 min-w-0">
        {/* Mobile: 2x2 metric cards + AI Threat Explanation (envelope icon on all cards) */}
        <div className="xl:hidden flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-4 flex flex-col min-h-[180px]" style={CARD_BG}>
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
            <div className="rounded-xl border p-4 flex flex-col min-h-[180px]" style={CARD_BG}>
              <div className="flex items-center gap-2 mb-2">
                {MOBILE_CARD_ICON}
                <h2 className="text-sm font-medium text-white whitespace-nowrap">Active Threats</h2>
              </div>
              <span className="text-xs text-slate-400 shrink-0 mb-auto">Networks Affected: {securityOverviewLoading ? "—" : (securityOverview?.active_threats?.networks_affected ?? "—")}</span>
              <div className="flex items-end justify-between gap-2 mt-2">
                <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                  <span className="text-2xl font-normal text-white">{securityOverviewLoading ? "—" : (securityOverview?.active_threats?.count ?? "—")}</span>
                  <p className="text-xs text-slate-500 self-end pb-0.5">Currently Detected:</p>
                </div>
                <div className="w-[26%] min-w-[56px] h-9 shrink-0 self-center">
                  {MINI_CHART}
                </div>
              </div>
            </div>
            <div className="rounded-xl border p-4 flex flex-col min-h-[180px]" style={CARD_BG}>
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
            <div className="rounded-xl border p-4 flex flex-col min-h-[180px]" style={CARD_BG}>
              <div className="flex items-center gap-2 mb-2">
                {MOBILE_CARD_ICON}
                <h2 className="text-sm font-medium text-white whitespace-nowrap">Reported Threats</h2>
              </div>
              <span className="text-xs text-slate-400 shrink-0 mb-auto">{securityOverviewLoading ? "—" : `${securityOverview?.reported_threats?.verified ?? "—"} Verified`}</span>
              <div className="flex items-end justify-between gap-2 mt-2">
                <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                  <span className="text-2xl font-normal text-white">{securityOverviewLoading ? "—" : ((securityOverview?.reported_threats?.verified ?? 0) + (securityOverview?.reported_threats?.detected ?? 0))}</span>
                  <p className="text-xs text-slate-500 self-end pb-0.5">Currently Detected:</p>
                </div>
                <div className="w-[26%] min-w-[56px] h-9 shrink-0 self-center">
                  {MINI_CHART}
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border p-4 flex flex-col" style={CARD_BG}>
            <div className="flex items-center gap-2 mb-3">
              {MOBILE_CARD_ICON}
              <h2 className="text-base font-medium text-white">AI Threat Explanation</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {securityOverviewLoading ? "—" : (securityOverview?.ai_threat_explanation?.description ?? "SenseiGuard's AI detected behavior patterns that closely match known scam activities. These signals are based on repeated transaction behavior and interactions with flagged wallets, not a single event.")}
            </p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <div
                className="rounded-lg px-4 py-2.5 w-fit font-medium text-sm"
                style={{
                  backgroundColor: "#25283D",
                  color: "#F00500",
                  boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.06), 0 2px 4px rgba(0,0,0,0.2)",
                  border: "1px solid rgba(0,0,0,0.15)",
                }}
              >
                Risk Level: {securityOverviewLoading ? "—" : (securityOverview?.ai_threat_explanation?.risk_level ?? securityOverview?.overall_risk?.risk_level ?? "—")}
              </div>
              <button
                type="button"
                onClick={() => setSummaryModalOpen(true)}
                className="rounded-lg font-medium text-white py-3 px-5 transition text-center shrink-0"
                style={{ background: "linear-gradient(to bottom, #5b7cff 0%, #4066FF 35%, #0026FF 70%, #001a99 100%)", boxShadow: "0 2px 10px rgba(0,38,255,0.4)" }}
              >
                View Summary
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: 2x2 stat grid + AI Threat Explanation */}
        <div className="hidden xl:flex flex-col gap-4">
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
            <div className="flex items-center gap-2 mb-3">
              {ENVELOPE_ICON}
              <h2 className="text-lg font-medium text-slate-200">AI Threat Explanation</h2>
            </div>
            <p className="text-base text-slate-400 leading-relaxed flex-1">
              {securityOverviewLoading ? "—" : (securityOverview?.ai_threat_explanation?.description ?? "SenseiGuard uses AI to analyze transaction patterns, contract behavior, and community reports to identify potential threats. Risk levels are updated in real time based on verified reports and on-chain activity.")}
            </p>
            <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
              <div
                className="rounded-lg px-4 py-2.5 w-fit font-medium text-base"
                style={{
                  backgroundColor: "#25283D",
                  color: "#F00500",
                  boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.06), 0 2px 4px rgba(0,0,0,0.2)",
                  border: "1px solid rgba(0,0,0,0.15)",
                }}
              >
                Risk Level: {securityOverviewLoading ? "—" : (securityOverview?.ai_threat_explanation?.risk_level ?? securityOverview?.overall_risk?.risk_level ?? "—")}
              </div>
              <button
                type="button"
                onClick={() => setSummaryModalOpen(true)}
                className="rounded-lg font-medium text-white py-3 px-6 transition text-center shrink-0"
                style={{ background: "linear-gradient(to bottom, #5b7cff 0%, #4066FF 35%, #0026FF 70%, #001a99 100%)", boxShadow: "0 2px 10px rgba(0,38,255,0.4)" }}
              >
                View Summary
              </button>
            </div>
          </div>
        </div>

        </div>

        <div className={`${CARD_STYLE} flex flex-col min-h-[320px] xl:h-full xl:min-h-0`} style={CARD_BG}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {SCAN_ICON}
              <h2 className="text-lg font-medium text-slate-200">Scam Pattern Insights</h2>
            </div>
            <span className="text-sm text-slate-500">{securityOverview?.scam_pattern_insights?.period?.replace(/_/g, " ") ?? "Last 7 days"}</span>
          </div>
          <div className="flex-1 min-h-[220px] flex flex-col xl:min-h-0">
            <p className="text-base font-medium text-slate-400 mb-2">Scam Frequency</p>
            <div className="relative flex-1 min-h-[180px] flex gap-2 items-stretch mt-6 overflow-visible" style={{ maxHeight: 260 }}>
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between py-0.5 text-slate-400 text-xs font-medium shrink-0 w-8">
                <span>{chartData.values.length ? Math.max(1, ...chartData.values) : 1}</span>
                <span>0</span>
              </div>
              <div className="flex-1 min-w-0 relative overflow-visible">
              <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-full" preserveAspectRatio="none">
                {/* Horizontal grid lines at 0, 100, 200, 300 */}
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
                {/* Dynamic highlight: vertical line + dot (tooltip is HTML overlay below) */}
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
              {/* Tooltip overlay: positioned above the point so it’s never clipped */}
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
              <div className="flex justify-between text-sm text-slate-500 w-[92%] min-w-0 tracking-tight">
                {chartData.dayLabels.length ? chartData.dayLabels.map((d, i) => (
                  <button key={`${d}-${i}`} type="button" onClick={() => setHighlightDayIndex(i)} className={`shrink-0 transition ${highlightDayIndex === i ? "text-[#0026FF] font-semibold" : "text-slate-500 hover:text-slate-300"}`}>
                    {d}
                  </button>
                )) : <span>—</span>}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-slate-200">Live Scam Signals</h3>
              <button type="button" className="text-sm font-medium text-white hover:underline">View all</button>
            </div>
            <ul className="space-y-3">
              {!mounted || !address ? (
                <li className="rounded-xl p-4 bg-[#25283D] border border-slate-700/50 text-slate-500 text-sm">Connect your wallet to see live scam signals.</li>
              ) : securityOverviewLoading || securityOverview === null ? (
                <li className="rounded-xl p-4 bg-[#25283D] border border-slate-700/50 text-slate-500 text-sm">Loading…</li>
              ) : !securityOverview.live_scam_signals?.length ? (
                <li className="rounded-xl p-4 bg-[#25283D] border border-slate-700/50 text-slate-500 text-sm">No live scam signals.</li>
              ) : (
                securityOverview.live_scam_signals.map((signal, i) => (
                  <li key={`${signal.address}-${i}`} className="rounded-xl p-4 bg-[#25283D] border border-slate-700/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <p className="text-base font-semibold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>{signal.address}</p>
                        <p className="text-sm text-slate-400">{signal.threat_type}</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-sm text-slate-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>{signal.detected_at}</span>
                        <span className="text-sm font-bold text-[#F00500]">{signal.risk_level}</span>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Community-Reported Threats table */}
      <div className={`${CARD_STYLE} flex flex-col`} style={CARD_BG}>
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
