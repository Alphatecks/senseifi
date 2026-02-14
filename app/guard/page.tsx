"use client";

import React from "react";
import Image from "next/image";
import localFont from "next/font/local";

import frameCheckIcon from "@/assets/icons/Frame 2147237641.png";
import frameWarnIcon from "@/assets/icons/Frame 2147237641 (1).png";
import frameBlockIcon from "@/assets/icons/Frame 2147237641 (2).png";
import liveActivityTitleIcon from "@/assets/icons/Frame 2147237579.png";
import walletHealthIcon from "@/assets/icons/Frame 2147237579 (1).png";
import shieldIcon from "@/assets/icons/Shield.png";
import senseiCardIcon from "@/assets/icons/wallets.png";
import senseiCardLogo from "@/assets/icons/Mono.png";
import senseiCardPattern from "@/assets/icons/SVG.svg";
const beVietnamPro = localFont({
  src: [
    { path: "../../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Bold.ttf", weight: "700", style: "normal" },
  ],
});

export default function GuardDashboardPage() {
  return (
    <div className="rounded-2xl bg-blue-950/25 border border-blue-900/40 p-6 space-y-6">
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
                        strokeDasharray="78, 100"
                        strokeLinecap="round"
                        filter="url(#arcGlow)"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white">78%</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:mt-16">
                  <p className="text-sm text-slate-300">Status: <span className="inline-flex items-center justify-center min-w-[5rem] px-4 py-1 rounded-lg bg-[#0026FF] text-white font-medium">Strong</span></p>
                  <p className="text-base text-slate-400 mt-2">Wallet security is strong at 82% safe and protected, with a few areas you can further strengthen.</p>
                </div>
              </div>
              <div className="flex items-center w-full mt-4 gap-4">
                <div className="w-44 sm:w-52 shrink-0 flex items-center">
                  <p className="text-base text-slate-400">Last Scan: 2 hrs ago</p>
                </div>
                <div className="flex-1 min-w-4" />
                <button
                  type="button"
                  className="rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-base font-medium px-6 py-3 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90 shrink-0"
                >
                  Run Full Scan
                </button>
              </div>
            </div>

            {/* Four cards in 2x2 */}
            <div className="grid grid-cols-2 gap-4">
              <ThreatIntelligenceCard />
              <RecentScansCard />
              <TotalAssetCard />
              <UnreadAlertsCard />
            </div>
          </div>

          {/* Connected Wallet */}
          <section className="rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-slate-700/80 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Image src="/images/icons/wallets.png" alt="" width={24} height={24} className="w-6 h-6 opacity-90" />
                <h2 className="text-lg font-semibold text-white">Connected Wallet</h2>
              </div>
              <button
                type="button"
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: "#27283B" }}
              >
                View wallets
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {[
                { symbol: "BTC", name: "Bitcoin", balance: "$2,483.45", change: "+2.3%", icon: "/images/icons/bitcoin-ellipse.png" },
                { symbol: "ETH", name: "Ethereum", balance: "$1,345.45", change: "+2.3%", icon: "/images/icons/ethereum.png" },
                { symbol: "LTC", name: "Litecoin", balance: "$883.45", change: "+2.3%", icon: "/images/icons/litecoin.png" },
                { symbol: "BTC", name: "Bitcoin", balance: "$2,483.45", change: "+2.3%", icon: "/images/icons/bitcoin-ellipse.png" },
                { symbol: "ETH", name: "Ethereum", balance: "$1,345.45", change: "+2.3%", icon: "/images/icons/ethereum.png" },
                { symbol: "LTC", name: "Litecoin", balance: "$883.45", change: "+2.3%", icon: "/images/icons/litecoin.png" },
                { symbol: "BTC", name: "Bitcoin", balance: "$2,483.45", change: "+2.3%", icon: "/images/icons/bitcoin-ellipse.png" },
                { symbol: "ETH", name: "Ethereum", balance: "$1,345.45", change: "+2.3%", icon: "/images/icons/ethereum.png" },
                { symbol: "LTC", name: "Litecoin", balance: "$883.45", change: "+2.3%", icon: "/images/icons/litecoin.png" },
              ].map((w, i) => (
                <div
                  key={`${w.symbol}-${i}`}
                  className="shrink-0 w-[240px] rounded-2xl p-4 relative overflow-hidden bg-cover bg-center border border-slate-700/60 shadow-lg"
                  style={{ backgroundImage: 'url(/images/icons/rectangle-card.png)' }}
                >
                  {/* Wavy chart graphic - right side */}
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
                        <Image src={w.icon} alt={w.name} width={24} height={24} className="w-6 h-6 object-contain" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-base leading-tight">{w.symbol}</p>
                        <p className="text-white/90 text-xs">{w.name}</p>
                      </div>
                    </div>
                    <p className="text-white font-bold text-xl mt-3">{w.balance}</p>
                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 mt-2 text-xs font-medium bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
                      {w.change}
                    </span>
                  </div>
                </div>
              ))}
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
              <ul className="flex-1 flex flex-col justify-between min-h-0 overflow-auto">
                {[
                  { icon: "check", color: "text-emerald-500", title: "Outgoing Transaction Detected", desc: "0.42 ETH sent to 0x9f3...a21" },
                  { icon: "warn", color: "text-amber-500", title: "Suspicious Approval Request", desc: "Unlimited token approval requested by unknown contract", descIcon: true },
                  { icon: "block", color: "text-red-500", title: "High-Risk Contract Interaction Blocked", desc: "Interaction prevented with flagged contract" },
                ].map((a) => (
                  <li key={a.title} className="emboss-raised-dark-inset flex items-center gap-3 p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/40 hover:border-slate-600 transition">
                    {a.icon === "check" && (
                      <span className="shrink-0 w-8 h-8 flex items-center justify-center overflow-hidden rounded">
                        <Image src={frameCheckIcon} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                      </span>
                    )}
                    {a.icon === "warn" && (
                      <span className="shrink-0 w-8 h-8 flex items-center justify-center overflow-hidden rounded">
                        <Image src={frameWarnIcon} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                      </span>
                    )}
                    {a.icon === "block" && (
                      <span className="shrink-0 w-8 h-8 flex items-center justify-center overflow-hidden rounded">
                        <Image src={frameBlockIcon} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white leading-snug">{a.title}</p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 leading-snug">
                        {a.desc}
                        {a.descIcon && (
                          <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" /></svg>
                        )}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </li>
                ))}
              </ul>
            </div>

            {/* Wallet health */}
            <div className="flex-1 min-w-0 rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 h-[320px] flex flex-col">
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
                      {/* Bright blue filled segment (78%) - animates from 0 to 78% */}
                      <path d="M 10 50 A 40 40 0 0 1 90 50" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" fill="none" className="animate-gauge-arc-fill" />
                      {/* Grey needle - sweeps from left to 78% position */}
                      <g filter="url(#walletGaugeNeedleGlow)" className="animate-gauge-needle-sweep" style={{ transformOrigin: "50px 50px" }}>
                        <path d="M 50 50 L 47 44 L 50 14 L 53 44 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="0.5" />
                      </g>
                      {/* Center pivot - dark circle */}
                      <circle cx="50" cy="50" r="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-white mt-1">78%</p>
                  <p className="mt-auto pt-2 text-base text-slate-400 shrink-0">Issues This Month: <span className="text-white font-medium">4</span></p>
                </div>
              </div>
              </div>

              {/* Security Tip - under Live Activity & Wallet health */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <Image src={liveActivityTitleIcon} alt="" width={28} height={28} className="w-7 h-7 object-contain opacity-90" />
                  <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Security Tip</h2>
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
  );
}

function ThreatIntelligenceCard() {
  return (
    <div className="rounded-xl p-5 flex flex-col min-h-[180px] bg-gradient-to-br from-blue-950 to-slate-900">
      <div className="flex items-center gap-2">
        <Image src="/images/icons/alert.png" alt="" width={20} height={20} className="w-5 h-5 shrink-0" />
        <p className="text-white font-medium text-base">Threat Intelligence</p>
      </div>
      <div className="flex items-baseline gap-2 mt-3">
        <span className="text-white font-normal text-4xl">2</span>
        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium bg-[#2F4F2F] text-[#A0E0A0]">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
          +2.3%
        </span>
      </div>
      <div className="flex items-center justify-between mt-auto pt-4">
        <p className="text-sm text-slate-400">This month</p>
        <button
          type="button"
          className="rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium px-4 py-2.5 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90"
        >
          View Threat
        </button>
      </div>
    </div>
  );
}

function TotalAssetCard() {
  return (
    <div className="rounded-xl p-5 flex flex-col min-h-[180px] bg-gradient-to-br from-blue-950 to-slate-900">
      <div className="flex items-center gap-2">
        <Image src="/images/icons/wallets.png" alt="" width={20} height={20} className="w-5 h-5 shrink-0" />
        <p className="text-white font-medium text-base">Total Asset</p>
      </div>
      <div className="flex items-baseline gap-2 mt-3">
        <span className="text-white font-normal text-4xl">$12,450</span>
        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium bg-[#2F4F2F] text-[#A0E0A0]">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
          +2.3%
        </span>
      </div>
      <div className="flex items-center justify-between mt-auto pt-4">
        <p className="text-sm text-slate-400">This month</p>
        <button
          type="button"
          className="rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium px-4 py-2.5 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90"
        >
          View wallets
        </button>
      </div>
    </div>
  );
}

function UnreadAlertsCard() {
  return (
    <div className="rounded-xl p-5 flex flex-col min-h-[180px] bg-gradient-to-br from-blue-950 to-slate-900">
      <div className="flex items-center gap-2">
        <Image src="/images/icons/alert-02.png" alt="" width={20} height={20} className="w-5 h-5 shrink-0" />
        <p className="text-white font-medium text-base">Unread Alerts</p>
      </div>
      <div className="flex items-baseline gap-2 mt-3">
        <span className="text-white font-normal text-4xl">6</span>
        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium bg-red-900/50 text-red-400">
          <svg className="w-3 h-3 rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
          -2.3%
        </span>
      </div>
      <div className="flex items-center justify-between mt-auto pt-4">
        <div className="flex items-center gap-1.5">
          <Image src="/images/icons/alert-01.png" alt="" width={16} height={16} className="w-4 h-4 shrink-0" />
          <p className="text-sm text-slate-400">1 high risk</p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium px-4 py-2.5 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90"
        >
          View Alerts
        </button>
      </div>
    </div>
  );
}

function RecentScansCard() {
  return (
    <div className="rounded-xl p-5 flex flex-col min-h-[180px] bg-gradient-to-br from-blue-950 to-slate-900">
      <div className="flex items-center gap-2">
        <Image src="/images/icons/scan.png" alt="" width={20} height={20} className="w-5 h-5 shrink-0" />
        <p className="text-white font-medium text-base">Recent Scans</p>
      </div>
      <div className="flex items-baseline gap-2 mt-3">
        <span className="text-white font-normal text-4xl">12</span>
        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium bg-[#2F4F2F] text-[#A0E0A0]">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
          +2.3%
        </span>
      </div>
      <div className="flex items-center justify-between mt-auto pt-4">
        <p className="text-sm text-slate-400">This month</p>
        <button
          type="button"
          className="rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium px-4 py-2.5 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90"
        >
          Scan New Contract
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
        <p className={`text-sm mt-0.5 ${positive ? "text-emerald-400" : "text-red-400"}`}>{change}</p>
      )}
      <p className="text-xs text-slate-500 mt-1">{label}</p>
      <button type="button" className="mt-auto pt-3 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-medium py-2 w-full transition">
        {buttonLabel}
      </button>
    </div>
  );
}
