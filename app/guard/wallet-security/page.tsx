"use client";

import React, { useState } from "react";
import Image from "next/image";

import alertIcon from "@/assets/icons/alert.png";
import scanIcon from "@/assets/icons/scan.png";
import vectorIcon from "@/assets/icons/Vector.png";

const CHECK_ICON = (
  <svg className="w-5 h-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

const APPROVALS = [
  { contract: "0xA3F...91C2", type: "Unlimited", risk: "Medium", date: "2days" },
  { contract: "0xA3F...91C2", type: "Unlimited", risk: "Medium", date: "2days" },
  { contract: "0xA3F...91C2", type: "Unlimited", risk: "Medium", date: "2days" },
  { contract: "0xA3F...91C2", type: "Unlimited", risk: "Medium", date: "2days" },
];

const WALLETS = [
  { name: "MetaMask", chain: "Ethereum", address: "1A1zPleP5QGefi2DMPTFTL5SLmv7DiviNa", icon: "/images/icons/ethereum.png" },
  { name: "Coinbase", chain: "Bitcoin", address: "3J98t1WpEZ73CNmQviecnyiWnqRhWNLy", icon: "/images/icons/bitcoin-ellipse.png" },
  { name: "Binance", chain: "BNB", address: "bnb1g4cxt9vr3tm3v0m315k63h2e", icon: "/images/icons/bitcoin-ellipse.png" },
  { name: "Kraken", chain: "Litecoin", address: "LZ83C6A5z2x3E8kBnz1FfTlEwly8M8W7bt", icon: "/images/icons/litecoin.png" },
  { name: "Bitstamp", chain: "Ripple", address: "r9cZA1y8pFZ6yZk5p1f1j2L2B1dZ2G6QBw", icon: "/images/icons/ethereum.png" },
  { name: "Bitstamp", chain: "Ripple", address: "r9cZA1y8pFZ6yZk5p1f1j2L2B1dZ2G6QBw", icon: "/images/icons/ethereum.png" },
];

const TRANSACTIONS = [
  { label: "Swap ETH → USDC", risk: "Low" },
  { label: "Contract Call", risk: "High" },
  { label: "Payment Processing", risk: "Medium" },
  { label: "User Authentication", risk: "Low" },
  { label: "Data Encryption", risk: "Medium" },
  { label: "API Integration", risk: "High" },
  { label: "API Integration", risk: "High" },
];

export default function WalletSecurityPage() {
  const [approvalPage, setApprovalPage] = useState(1);
  const [walletPage, setWalletPage] = useState(1);
  const [txPage, setTxPage] = useState(1);

  return (
    <div className="rounded-2xl bg-blue-950/25 border border-blue-900/40 p-6 space-y-6">
      {/* Top row: Security Status + 4 metric cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
        {/* Security Status */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-slate-700/80 p-5 flex flex-col shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.06)] lg:max-w-lg">
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
                    strokeDasharray="78, 100"
                    strokeLinecap="round"
                    filter="url(#wsBlueGlow)"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-semibold text-slate-300">
                  <span className="inline-flex items-baseline justify-center gap-0.5">
                    <span className="text-4xl sm:text-5xl tracking-tight">78</span>
                    <span className="text-2xl sm:text-3xl">%</span>
                  </span>
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col sm:mt-12">
              <p className="text-sm text-slate-300">
                Status: <span className="inline-flex items-center justify-center min-w-[5rem] px-4 py-1 rounded-lg bg-[#0026FF] text-white font-medium ml-2">Strong</span>
              </p>
              <p className="text-base text-slate-400 mt-2">Wallet security is strong at 82% safe and protected, with a few areas you can further strengthen.</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
            <p className="text-base text-slate-400">Last Scan: 2 hrs ago</p>
            <button
              type="button"
              className="rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-base font-medium px-6 py-3 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90 shrink-0"
            >
              Rescan
            </button>
          </div>
        </div>

        {/* Four metric cards */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard icon={<Image src={alertIcon} alt="" width={28} height={28} className="w-7 h-7 shrink-0 object-contain" />} title="Malicious Transaction" value="0" change="+2.3%" titleClassName="text-lg font-semibold" />
          <MetricCard icon={<Image src={scanIcon} alt="" width={28} height={28} className="w-7 h-7 shrink-0 object-contain" />} title="Phishing Indicators" value="0" change="+2.3%" titleClassName="text-lg font-semibold" />
          <MetricCard icon={WARN_ICON} title="Risky Tokens" value="0" change="+2.3%" titleClassName="text-lg font-semibold" />
          <MetricCard icon={SHIELD_ICON} title="Active Threat level" value="Low" change="+2.3%" titleClassName="text-lg font-semibold" />
        </div>
      </div>

      {/* Bottom row: Approval & Permission, Connected Wallet, Transaction monitoring */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr_1fr] gap-4">
        {/* Approval & Permission */}
        <div className="rounded-2xl border p-5 flex flex-col min-h-[320px] shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {APPROVAL_HEADER_ICON}
              <h2 className="text-lg font-normal text-white">Approval & Permission</h2>
            </div>
            <div className="relative flex items-center">
              <select className="rounded-lg border text-white text-sm font-medium pl-3 pr-8 py-2.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-500 min-w-[10rem]" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
                <option>This month</option>
              </select>
              <svg className="absolute right-2.5 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="overflow-x-auto flex-1 overflow-hidden rounded-lg">
            <table className="w-full text-sm border-collapse" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead style={{ backgroundColor: "#25283D" }}>
                <tr className="text-slate-300">
                  <th className="text-left py-3 px-3 font-medium rounded-tl-lg rounded-bl-lg">Contract Address</th>
                  <th className="text-left py-3 px-3 font-medium">Approval type</th>
                  <th className="text-left py-3 px-3 font-medium">Risk level</th>
                  <th className="text-left py-3 px-3 font-medium">Date</th>
                  <th className="w-8 py-3 px-3 rounded-tr-lg rounded-br-lg" />
                </tr>
              </thead>
              <tbody>
                {APPROVALS.map((row, i) => (
                  <tr key={i} className="text-slate-300 hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 font-mono text-slate-200 border-b border-white/20" style={{ borderBottomColor: "rgba(255,255,255,0.12)" }}>{row.contract}</td>
                    <td className="py-4 border-b border-white/20" style={{ borderBottomColor: "rgba(255,255,255,0.12)" }}>{row.type}</td>
                    <td className="py-4 border-b border-white/20" style={{ borderBottomColor: "rgba(255,255,255,0.12)" }}>
                      <span className="text-amber-500 font-medium">{row.risk}</span>
                    </td>
                    <td className="py-4 border-b border-white/20" style={{ borderBottomColor: "rgba(255,255,255,0.12)" }}>{row.date}</td>
                    <td className="py-4 border-b border-white/20" style={{ borderBottomColor: "rgba(255,255,255,0.12)" }}>
                      <svg className="w-4 h-4 text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-1 mt-3 justify-center">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setApprovalPage(n)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${approvalPage === n ? "bg-[#4066FF] text-white" : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Connected Wallet */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-slate-700/80 p-5 flex flex-col min-h-[320px]">
          <div className="flex items-center gap-2 mb-4">
            {CHECK_ICON}
            <h2 className="text-lg font-semibold text-white">Connected Wallet</h2>
          </div>
          <ul className="space-y-3 flex-1 overflow-y-auto">
            {WALLETS.map((w, i) => (
              <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30">
                <Image src={w.icon} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{w.name} • {w.chain}</p>
                  <p className="text-xs text-slate-400 font-mono truncate">{w.address}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex gap-1 mt-3 justify-center">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setWalletPage(n)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${walletPage === n ? "bg-[#4066FF] text-white" : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction monitoring */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-slate-700/80 p-5 flex flex-col min-h-[320px]">
          <div className="flex items-center gap-2 mb-4">
            {CHECK_ICON}
            <h2 className="text-lg font-semibold text-white">Transaction monitoring</h2>
          </div>
          <ul className="space-y-2 flex-1 overflow-y-auto">
            {TRANSACTIONS.map((t, i) => (
              <li key={i} className="flex items-center justify-between gap-2 py-2">
                <span className="text-sm text-slate-300">{t.label}</span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    t.risk === "Low" ? "bg-slate-600/60 text-slate-300" : t.risk === "Medium" ? "bg-slate-700 text-slate-200" : "bg-slate-800 text-slate-100"
                  }`}
                >
                  Risk: {t.risk}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex gap-1 mt-3 justify-center">
            {[1, 2, 3].map((n) => (
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
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  change,
  titleClassName,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  titleClassName?: string;
}) {
  return (
    <div className="rounded-xl p-5 flex flex-col min-h-[160px] bg-gradient-to-br from-blue-950 to-slate-900 border border-slate-700/80 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-2">
        {icon}
        <p className={titleClassName ? `text-white ${titleClassName}` : "text-white font-medium text-sm"}>{title}</p>
      </div>
      <div className="flex items-baseline gap-2 mt-3">
        <span className="text-white font-normal text-3xl">{value}</span>
        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium bg-[#2F4F2F] text-[#A0E0A0]">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 14l5-5 5 5z" />
          </svg>
          {change}
        </span>
      </div>
      <p className="text-base text-slate-400 mt-auto pt-3">This month</p>
    </div>
  );
}
