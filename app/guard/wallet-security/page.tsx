"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

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

const APPROVALS = [
  { contract: "0xA3F...91C2", type: "Unlimited", risk: "Medium", date: "2 days ago" },
  { contract: "0x7a2...4B1E", type: "Limited", risk: "Low", date: "3 days ago" },
  { contract: "0x9B4...8F3D", type: "Unlimited", risk: "High", date: "5 days ago" },
  { contract: "0xC5d...2A9C", type: "Limited", risk: "Low", date: "1 week ago" },
  { contract: "0x2E1...9D4F", type: "Limited", risk: "Medium", date: "2 weeks ago" },
  { contract: "0x4F8...1B2C", type: "Unlimited", risk: "Low", date: "3 weeks ago" },
];

const APPROVAL_DETAILS: Array<{
  dappName: string;
  contractAddress: string;
  permissionGranted: string;
  tokensAffected: string;
  dateGranted: string;
  riskLevel: "Low" | "Medium" | "High";
  riskReasons: string[];
}> = [
  { dappName: "RandomMint.xyz", contractAddress: "0xAA91c...FOD3", permissionGranted: "Unlimited token spending", tokensAffected: "USDT, USDC", dateGranted: "May 22, 2025", riskLevel: "Low", riskReasons: ["Unlimited approval", "Contract not verified", "Similar structure to flagged drain contracts"] },
  { dappName: "Swap.xyz", contractAddress: "0x7a2...4B1E", permissionGranted: "Limited token spending", tokensAffected: "USDC", dateGranted: "May 20, 2025", riskLevel: "Low", riskReasons: ["Contract not verified"] },
  { dappName: "Unknown DApp", contractAddress: "0x9B4...8F3D", permissionGranted: "Unlimited token spending", tokensAffected: "USDT, USDC, DAI", dateGranted: "May 18, 2025", riskLevel: "High", riskReasons: ["Unlimited approval", "Contract not verified", "Similar structure to flagged drain contracts"] },
  { dappName: "StakingPool.io", contractAddress: "0xC5d...2A9C", permissionGranted: "Limited token spending", tokensAffected: "ETH", dateGranted: "May 15, 2025", riskLevel: "Low", riskReasons: ["Contract verified"] },
  { dappName: "Bridge.xyz", contractAddress: "0x2E1...9D4F", permissionGranted: "Limited token spending", tokensAffected: "USDT", dateGranted: "May 10, 2025", riskLevel: "Medium", riskReasons: ["Contract not verified", "Unlimited approval"] },
  { dappName: "LendProtocol.xyz", contractAddress: "0x4F8...1B2C", permissionGranted: "Unlimited token spending", tokensAffected: "USDC, DAI", dateGranted: "Apr 28, 2025", riskLevel: "Low", riskReasons: ["Contract verified"] },
];

const WALLETS = [
  { name: "MetaMask", chain: "Ethereum", address: "1A1zPleP5QGefi2DMPTFTL5SLmv7DiviNa", icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" },
  { name: "Coinbase", chain: "Bitcoin", address: "3J98t1WpEZ73CNmQviecnyiWnqRhWNLy", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMTEqHVL3ayDk8d7A3ocOPuegNGWkJOrQV9BZtntRm-IO2sAlpROwbuC7k9MkvOFjkUN96oTydqRJocPFhThiE&s&ec=121528429" },
  { name: "Binance", chain: "BNB", address: "bnb1g4cxt9vr3tm3v0m315k63h2e", icon: "https://cdn.pixabay.com/photo/2021/04/30/16/47/bnb-6219388_1280.png" },
  { name: "Kraken", chain: "Litecoin", address: "LZ83C6A5z2x3E8kBnz1FfTlEwly8M8W7bt", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJPJqZSndMZgYhUG4Xr3aHdKxzOANOtfxVfFpa-jOVZUHkAXmedUxcs09r26I1sowX8hbraGgYdqmHwwS4wD2sAuf9tUE6&s&ec=121528429" },
  { name: "Bitstamp", chain: "Ripple", address: "r9cZA1y8pFZ6yZk5p1f1j2L2B1dZ2G6QBw", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcwmeuCEtlESgsBtqAxXwHTYXwvGKmsIt5FQ&s" },
  { name: "Bitstamp", chain: "Ripple", address: "r9cZA1y8pFZ6yZk5p1f1j2L2B1dZ2G6QBw", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcwmeuCEtlESgsBtqAxXwHTYXwvGKmsIt5FQ&s" },
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

const PROTECTION_CONTROLS = [
  { id: "auto-scan", label: "Auto Security Scan", on: true },
  { id: "high-risk", label: "High-Risk Tx Warnings", on: true },
  { id: "approval", label: "New Approval Alerts", on: true },
  { id: "dapp", label: "New dApp Connection Alerts", on: true },
];

const ADDRESS_SAFETY = [
  { address: "0xA1b2...C9D3", score: 78, risk: "Medium" },
  { address: "0xB2c3...D0E4", score: 85, risk: "Low" },
  { address: "0xC3d4...E1F5", score: 62, risk: "High" },
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

export default function WalletSecurityPage() {
  const [walletPage, setWalletPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [controls, setControls] = useState(PROTECTION_CONTROLS);
  const [selectedWallet, setSelectedWallet] = useState<typeof WALLETS[0] | null>(null);
  const [walletModalTab, setWalletModalTab] = useState<"details" | "balance" | "security" | "activity" | "contract">("details");
  const [selectedApprovalIndex, setSelectedApprovalIndex] = useState<number | null>(null);
  const [rescanModalOpen, setRescanModalOpen] = useState(false);
  const [rescanProgress, setRescanProgress] = useState(0);

  useEffect(() => {
    if (!rescanModalOpen) return;
    setRescanProgress(0);
    const interval = setInterval(() => {
      setRescanProgress((p) => (p >= 100 ? 100 : p + 2));
    }, 120);
    return () => clearInterval(interval);
  }, [rescanModalOpen]);

  const toggleControl = (id: string) => {
    setControls((prev) => prev.map((c) => (c.id === id ? { ...c, on: !c.on } : c)));
  };

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
              onClick={() => setRescanModalOpen(true)}
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
                {APPROVALS.map((row, i) => (
                  <tr
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedApprovalIndex(i)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedApprovalIndex(i)}
                    className="text-slate-300 hover:bg-slate-700/30 transition-colors bg-[#25283D]/50 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg cursor-pointer"
                  >
                    <td className="py-4 px-5 font-mono text-slate-200 whitespace-nowrap min-w-[7rem]">{row.contract}</td>
                    <td className="py-4 px-5 whitespace-nowrap">{row.type}</td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`font-medium ${row.risk === "Low" ? "text-[#32BB1D]" : row.risk === "Medium" ? "text-amber-500" : "text-[#F00500]"}`}>{row.risk}</span>
                    </td>
                    <td className="py-4 px-5 text-slate-400 whitespace-nowrap">{row.date}</td>
                    <td className="py-4 px-5">
                      <svg className="w-4 h-4 text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Connected Wallet */}
        <div className="rounded-2xl border p-5 flex flex-col min-h-[320px] shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center gap-2 mb-4">
            {APPROVAL_HEADER_ICON}
            <h2 className="text-lg font-normal text-white">Connected Wallet</h2>
          </div>
          <ul className="space-y-3 flex-1 overflow-y-auto">
            {WALLETS.map((w, i) => (
              <li
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedWallet(w)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedWallet(w)}
                className="emboss-inset-3d-input flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer hover:opacity-90" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}
              >
                <span className="w-8 h-8 rounded-md bg-white flex items-center justify-center p-1 shrink-0">
                  <Image src={w.icon} alt="" width={28} height={28} className="w-7 h-7 rounded object-contain" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{w.name} • {w.chain}</p>
                  <p className="text-xs text-slate-400 font-mono truncate">{w.address}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex gap-1 mt-3 justify-start">
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
        <div className="rounded-2xl border p-5 flex flex-col min-h-[320px] shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center gap-2 mb-4">
            {APPROVAL_HEADER_ICON}
            <h2 className="text-lg font-normal text-white">Transaction monitoring</h2>
          </div>
          <ul className="space-y-3 flex-1 overflow-y-auto">
            {TRANSACTIONS.map((t, i) => (
              <li key={i} className="emboss-inset-3d-input flex items-center justify-between gap-2 p-3 rounded-lg border transition" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
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
          <div className="flex gap-1 mt-3 justify-start">
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

      {/* New section: Smart Wallet Scanner, Protection Control, Security Alerts + Address Safety */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr_1fr] gap-4">
        {/* Smart Wallet Scanner */}
        <div className="rounded-2xl border p-5 flex flex-col min-h-[320px] shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center gap-2 mb-4">
            {SECURITY_STATUS_ICON}
            <h2 className="text-lg font-normal text-white">Smart Wallet Scanner</h2>
          </div>
          <div className="emboss-inset-3d-input flex gap-2 rounded-lg border mb-4" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
            <input
              type="text"
              placeholder="Enter Smart Contract Link"
              className="flex-1 min-w-0 bg-transparent text-white text-sm pl-3 py-3 focus:outline-none placeholder:text-slate-500"
            />
            <button
              type="button"
              className="rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium px-5 py-3 transition shrink-0"
            >
              Scan
            </button>
          </div>
          <ul className="space-y-3 flex-1">
            {[
              { label: "Trust Score", value: "85%", trend: true },
              { label: "Critical Risk Flags", value: "2" },
              { label: "Token Controlled", value: "ETH, USDC" },
              { label: "OWNER / ADMIN", value: "1" },
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
            ))}
          </ul>
          <button
            type="button"
            className="emboss-inset-3d-input mt-4 w-full rounded-lg border py-3 text-sm font-medium text-slate-300 hover:text-white transition"
            style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}
          >
            View Details
          </button>
        </div>

        {/* Protection Control */}
        <div className="rounded-2xl border p-5 flex flex-col min-h-[320px] shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center gap-2 mb-4">
            {SECURITY_STATUS_ICON}
            <h2 className="text-lg font-normal text-white">Protection Control</h2>
          </div>
          <ul className="space-y-3 flex-1">
            {controls.map((c) => (
              <li key={c.id} className="emboss-inset-3d-input flex items-center justify-between gap-2 p-3 rounded-lg border" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
                <span className="text-sm text-slate-300">{c.label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={c.on}
                  onClick={() => toggleControl(c.id)}
                  className={`relative w-11 h-6 rounded-full transition shrink-0 ${c.on ? "bg-[#4066FF]" : "bg-slate-600"}`}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition"
                    style={{ left: c.on ? "calc(100% - 20px)" : "4px" }}
                  />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="emboss-inset-3d-input mt-4 w-full rounded-lg border py-3 text-sm font-medium text-slate-300 hover:text-white transition"
            style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}
          >
            Add new control
          </button>
        </div>

        {/* Security Alerts + Address Safety */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border p-5 flex flex-col shadow-sm flex-1" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
            <div className="flex items-center gap-2 mb-4">
              {SECURITY_STATUS_ICON}
              <h2 className="text-lg font-normal text-white">Security Alerts</h2>
            </div>
            <div className="emboss-inset-3d-input p-4 rounded-lg border mb-4" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
              <p className="text-sm font-medium text-white mb-1">High-Risk Approval Detected</p>
              <p className="text-xs text-slate-400 font-mono">Contract: 0xC41...88D9</p>
            </div>
            <button
              type="button"
              className="emboss-inset-3d-input w-full rounded-lg border py-3 text-sm font-medium text-slate-300 hover:text-white transition mt-auto"
              style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}
            >
              View Details
            </button>
          </div>
          <div className="rounded-2xl border p-5 flex flex-col shadow-sm flex-1" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
            <div className="flex items-center gap-2 mb-4">
              {SECURITY_STATUS_ICON}
              <h2 className="text-lg font-normal text-white">Address Safety</h2>
            </div>
            <ul className="space-y-3 flex-1">
              {ADDRESS_SAFETY.map((a, i) => (
                <li key={i} className="emboss-inset-3d-input flex items-center justify-between gap-2 p-3 rounded-lg border" style={{ backgroundColor: "#25283D", borderColor: "#25283D" }}>
                  <div className="min-w-0">
                    <p className="text-sm font-mono text-white truncate">{a.address}</p>
                    <p className="text-xs text-slate-400">Safety Score: {a.score}/100</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      a.risk === "Low" ? "bg-[#32BB1D]/20 text-[#32BB1D]" : a.risk === "Medium" ? "bg-amber-500/20 text-amber-400" : "bg-[#F00500]/20 text-[#F00500]"
                    }`}
                  >
                    {a.risk} Risk
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Security Tip + Emergency Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5 flex flex-col shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
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
        <div className="rounded-2xl border p-5 flex flex-col min-h-[140px] shadow-sm" style={{ backgroundColor: "#191D35", borderColor: "#191D35" }}>
          <div className="flex items-center gap-2">
            {SECURITY_STATUS_ICON}
            <h2 className="text-lg font-normal text-white">Emergency Actions</h2>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-slate-500">No actions required</p>
          </div>
        </div>
      </div>

      {/* Rescan modal - portaled to body */}
      {rescanModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={() => setRescanModalOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden bg-[#1a1d24]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Rescan</h2>
                <button
                  type="button"
                  onClick={() => setRescanModalOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 transition"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="h-2 rounded-full bg-slate-600/60 overflow-hidden mb-6">
                <div
                  className="h-full rounded-full bg-[#0026FF] transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, rescanProgress)}%` }}
                />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Scanning Your Wallet</h3>
              <p className="text-sm text-slate-400 text-center mb-8">Analyzing permissions, activity, and hidden risks in real time.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRescanModalOpen(false)}
                  className="flex-1 rounded-xl font-bold text-white py-3 px-4 transition border border-[#222222] shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] hover:opacity-90"
                  style={{ background: "linear-gradient(to bottom, #4a4a4a 0%, #414141 50%, #383838 100%)" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setRescanModalOpen(false)}
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
            {/* Header - MetaMask wallet region */}
            <div className="flex items-center justify-between p-5" style={{ backgroundColor: "#1B1B1B" }}>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0">
                  <Image src={selectedWallet.icon} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                </span>
                <h2 className="text-lg font-normal text-white">{selectedWallet.name} Wallet</h2>
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

            {/* Tab content */}
            <div className="p-5">
              {walletModalTab === "details" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Wallet Name</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                      {selectedWallet.name} Wallet
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Wallet Address</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white font-mono truncate">
                        {selectedWallet.address}
                      </div>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(selectedWallet.address)}
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
                      {CHAIN_TO_NETWORK[selectedWallet.chain] ?? selectedWallet.chain}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Wallet Type</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                      Non-Custodial
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Connected Via</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                      Browser Extension
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Security Status</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                      Secured
                    </div>
                  </div>
                </div>
              )}
              {walletModalTab === "balance" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Total Balance:</label>
                    <span className="text-4xl font-normal text-white">$12,480.75</span>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">ETH:</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                      3.12 ETH ($9,840.00)
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">USDT</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                      1,500 ($1,500.00)
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">USDC</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                      820 USDC ($820.00)
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">XYZ Token</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm text-white">
                      4,000 XYZ ($320.75)
                    </div>
                  </div>
                </div>
              )}
              {walletModalTab === "security" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">2FA</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-normal text-white">
                      Enabled
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Active Approval</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-normal text-white">
                      3
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Last Scan</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-normal text-white">
                      2mins ago
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Threat Level</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-normal text-white">
                      Low
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Risk Exposure</label>
                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 text-sm font-normal text-white">
                      8%
                    </div>
                  </div>
                </div>
              )}
              {walletModalTab === "activity" && (
                <div className="space-y-4">
                  <h3 className="text-base font-normal text-white">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { primary: "Sent: 0.45 ETH → 0x91C...3F2A", secondary: "A new wallet has been successfully linked to your account.", time: "10m ago" },
                      { primary: "Received: 200 USDT ← Binance Hot Wallet", secondary: "A new wallet has been successfully linked to your account.", time: "10m ago" },
                      { primary: "Contract Interaction: Token Swap on Uniswap", secondary: "A new wallet has been successfully linked to your account.", time: "10m ago" },
                    ].map((item, i) => (
                      <div key={i} className="rounded-lg bg-slate-800/80 border border-slate-700/60 flex overflow-hidden">
                        <div className="w-1 shrink-0 bg-[#0026FF]" aria-hidden />
                        <div className="flex-1 flex items-start justify-between gap-3 p-4">
                          <div className="min-w-0">
                            <p className="text-sm font-normal text-white">{item.primary}</p>
                            <p className="text-xs font-normal text-slate-400 mt-1">{item.secondary}</p>
                          </div>
                          <span className="text-xs font-normal text-slate-400 shrink-0">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
        const d = APPROVAL_DETAILS[selectedApprovalIndex] ?? APPROVAL_DETAILS[0];
        const riskColor = d.riskLevel === "Low" ? "text-[#32BB1D]" : d.riskLevel === "Medium" ? "text-amber-500" : "text-[#F00500]";
        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }} onClick={() => setSelectedApprovalIndex(null)}>
            <div className="w-full max-w-lg rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-5" style={{ backgroundColor: "#1B1B1B" }}>
                <h2 className="text-lg font-bold text-white">Approval Details</h2>
                <button
                  type="button"
                  onClick={() => setSelectedApprovalIndex(null)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 transition"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4" style={{ backgroundColor: "#191b28" }}>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-400 shrink-0">DApp Name</span>
                    <span className="text-slate-200 text-right">{d.dappName}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-400 shrink-0">Contract Address</span>
                    <span className="text-slate-200 font-mono text-right">{d.contractAddress}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-400 shrink-0">Permission Granted</span>
                    <span className="text-slate-200 text-right">{d.permissionGranted}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-400 shrink-0">Tokens Affected</span>
                    <span className="text-slate-200 text-right">{d.tokensAffected}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-400 shrink-0">Date Granted</span>
                    <span className="text-slate-200 text-right">{d.dateGranted}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-400 shrink-0">Risk level</span>
                    <span className={`font-medium ${riskColor}`}>{d.riskLevel}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs text-slate-400 mb-1.5">Risk Reason</h3>
                  <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                      {d.riskReasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg flex overflow-hidden border border-slate-700/60" style={{ backgroundColor: "rgba(0,38,255,0.08)" }}>
                  <div className="w-1 shrink-0 bg-[#0026FF]" aria-hidden />
                  <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <p className="text-sm font-normal text-white">SenseiGuard Warning</p>
                      <p className="text-xs text-slate-400 mt-1">This approval allows the contract to transfer all approved tokens without further confirmation.</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">10m ago</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-5" style={{ backgroundColor: "#191b28" }}>
                <button
                  type="button"
                  onClick={() => setSelectedApprovalIndex(null)}
                  className="flex-1 rounded-lg bg-gradient-to-b from-[#475569] to-[#1e293b] hover:from-[#64748b] hover:to-[#334155] text-white text-sm font-medium py-3 transition shadow-[0_4px_12px_rgba(30,41,59,0.4)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApprovalIndex(null)}
                  className="flex-1 rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-3 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)]"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        );
      })(), document.body)}
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
