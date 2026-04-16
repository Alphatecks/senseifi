"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useWallet } from "@/hooks/useWallet";
import { useDashboardUser } from "@/context/DashboardUserContext";
import { useConnectNetworksModal } from "@/context/ConnectWalletsModalContext";
import { getWalletsForAddress, getActivityMonitorDapps } from "@/services/dashboardService";
import type { WalletListItem, ActivityMonitorDappItem } from "@/services/dashboardService";

import userCircleIcon from "@/assets/icons/user-circle (1).png";

const WALLET_ICON_FALLBACK = "/images/icons/wallet-header.png";
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
  return PROVIDER_LOGOS[key] ?? WALLET_ICON_FALLBACK;
}

function formatWalletDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

const SETTINGS_BG = "#0c1129";
const CARD_BG = "#242636";
const ACCENT = "#5E60CE";
const ACTIVE_ICON_COLOR = "#0026ff";
const INACTIVE_COLOR = "#515461";

type SettingsSection = "profile" | "security" | "subscription" | "support" | "terms";
type BillingHistoryRow = {
  id: string;
  planName: string;
  amount: string;
  purchaseDate: string;
  endDate: string;
  status: string;
};

const SETTINGS_ICON = (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

/** CSS filter to approximate #515461 for image icons when inactive */
const INACTIVE_ICON_FILTER = "brightness(0) saturate(100%) invert(48%) sepia(13%) saturate(800%) hue-rotate(200deg)";
/** CSS filter to approximate #0026ff for image icons when active */
const ACTIVE_ICON_FILTER = "brightness(0) saturate(100%) invert(11%) sepia(100%) saturate(5000%) hue-rotate(230deg)";

const PROFILE_ICON = (active: boolean) => (
  <span className="inline-flex shrink-0 w-6 h-6">
    <Image
      src={userCircleIcon}
      alt=""
      width={24}
      height={24}
      className="w-6 h-6 object-contain"
      style={active ? { filter: ACTIVE_ICON_FILTER } : { filter: INACTIVE_ICON_FILTER }}
    />
  </span>
);

const SHIELD_ICON = (active: boolean) => (
  <svg className="w-6 h-6" style={{ color: active ? ACTIVE_ICON_COLOR : INACTIVE_COLOR }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CARD_ICON = (active: boolean) => (
  <svg className="w-6 h-6" style={{ color: active ? ACTIVE_ICON_COLOR : INACTIVE_COLOR }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.5 20a6.5 6.5 0 0113 0M12 12a4 4 0 100-8 4 4 0 000 8z" />
    <circle cx="12" cy="12" r="10" strokeWidth={1.8} />
  </svg>
);

const SUPPORT_ICON = (active: boolean) => (
  <svg className="w-6 h-6" style={{ color: active ? ACTIVE_ICON_COLOR : INACTIVE_COLOR }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const DOCUMENT_ICON = (active: boolean) => (
  <svg className="w-6 h-6" style={{ color: active ? ACTIVE_ICON_COLOR : INACTIVE_COLOR }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SIGNOUT_ICON = (
  <svg className="w-6 h-6" style={{ color: INACTIVE_COLOR }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const navItems: Array<{ id: SettingsSection; label: string; icon: (active: boolean) => React.ReactNode }> = [
  { id: "profile", label: "Profile Settings", icon: PROFILE_ICON },
  { id: "security", label: "Security Preferences", icon: SHIELD_ICON },
  { id: "subscription", label: "Subscription & Billing", icon: CARD_ICON },
  { id: "support", label: "Support & Feedback", icon: SUPPORT_ICON },
  { id: "terms", label: "Terms & Privacy Policy", icon: DOCUMENT_ICON },
];

const BILLING_HISTORY: BillingHistoryRow[] = [
  { id: "h1", planName: "Pro + plan", amount: "$50 USDC", purchaseDate: "2025-12-23", endDate: "2026-12-23", status: "Completed" },
  { id: "h2", planName: "Pro + plan", amount: "$50 USDC", purchaseDate: "2025-12-23", endDate: "2026-12-23", status: "Completed" },
  { id: "h3", planName: "Pro + plan", amount: "$50 USDC", purchaseDate: "2025-12-23", endDate: "2026-12-23", status: "Completed" },
  { id: "h4", planName: "Pro + plan", amount: "$50 USDC", purchaseDate: "2025-12-23", endDate: "2026-12-23", status: "Completed" },
  { id: "h5", planName: "Pro + plan", amount: "$50 USDC", purchaseDate: "2025-12-23", endDate: "2026-12-23", status: "Completed" },
];

export default function SettingsPage() {
  const { activeAddress: address } = useWallet();
  const { dashboardUser } = useDashboardUser();
  const connectNetworksModal = useConnectNetworksModal();
  const [section, setSection] = useState<SettingsSection>("profile");
  const [username, setUsername] = useState("Zeeno");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectedWallets, setConnectedWallets] = useState<WalletListItem[]>([]);
  const [connectedWalletsLoading, setConnectedWalletsLoading] = useState(false);
  const [connectedDapps, setConnectedDapps] = useState<ActivityMonitorDappItem[]>([]);
  const [connectedDappsLoading, setConnectedDappsLoading] = useState(false);
  const [securityExtensionEnabled, setSecurityExtensionEnabled] = useState(true);
  const [threatMode, setThreatMode] = useState("Balanced");
  const [autoBlockHighRisk, setAutoBlockHighRisk] = useState(true);
  const [blindSignatureProtection, setBlindSignatureProtection] = useState(true);
  const [unlimitedApprovalGuard, setUnlimitedApprovalGuard] = useState(true);
  const [billingSearch, setBillingSearch] = useState("");

  useEffect(() => {
    if (!address) {
      setConnectedWallets([]);
      return;
    }
    setConnectedWalletsLoading(true);
    getWalletsForAddress(address)
      .then((res) => setConnectedWallets(res?.data ?? []))
      .finally(() => setConnectedWalletsLoading(false));
  }, [address]);

  useEffect(() => {
    if (!address && !dashboardUser?.user_id) {
      setConnectedDapps([]);
      return;
    }
    setConnectedDappsLoading(true);
    getActivityMonitorDapps({ wallet_address: address ?? undefined, user_id: dashboardUser?.user_id ?? undefined })
      .then((data) => setConnectedDapps(data ?? []))
      .finally(() => setConnectedDappsLoading(false));
  }, [address, dashboardUser?.user_id]);

  return (
    <div className="flex flex-col lg:flex-row min-h-0 flex-1 min-h-full rounded-2xl overflow-hidden border border-slate-800/50 shadow-xl" style={{ backgroundColor: SETTINGS_BG }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      {/* Left sidebar - fixed drawer on mobile, inline on desktop */}
      <aside
        className={`flex flex-col w-[32rem] shrink-0 border-b lg:border-b-0 border-slate-700/50 lg:relative p-4 lg:min-h-full ${
          sidebarOpen ? "fixed left-0 top-0 bottom-0 z-50 lg:relative" : "hidden lg:flex"
        }`}
        style={{ backgroundColor: SETTINGS_BG }}
      >
        <div className="rounded-xl border border-slate-700/60 overflow-hidden flex flex-col flex-1 min-h-0 opacity-90" style={{ backgroundColor: CARD_BG }}>
          <div className="flex items-center justify-between lg:justify-start px-5 pt-6 pb-4 shrink-0">
            <div className="flex items-center gap-2">
              {SETTINGS_ICON}
              <h1 className="text-lg font-semibold text-white">Settings</h1>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 min-h-0">
            {navItems.map((item) => {
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition ${
                    active
                      ? "border border-slate-600/60"
                      : "hover:bg-slate-800/40"
                  }`}
                  style={
                    active
                      ? {
                          backgroundColor: "rgba(30, 32, 50, 0.8)",
                          color: "#fff",
                          boxShadow: "inset 2px 2px 8px rgba(0, 38, 255, 0.35), inset 1px 0 5px rgba(0, 38, 255, 0.2), inset 0 1px 5px rgba(0, 38, 255, 0.2)",
                        }
                      : { color: INACTIVE_COLOR }
                  }
                >
                  {item.icon(active)}
                  <span style={active ? { color: "#fff" } : { color: INACTIVE_COLOR }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium hover:bg-slate-800/40 transition"
              style={{ color: INACTIVE_COLOR }}
            >
              {SIGNOUT_ICON}
              <span>Sign Out</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Mobile: open sidebar button when sidebar closed */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 shrink-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 text-white font-medium"
          aria-label="Open settings menu"
        >
          {SETTINGS_ICON}
          <span>Settings</span>
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      {/* Right content */}
      <div className="flex-1 min-w-0 min-h-full overflow-auto p-6 flex flex-col" style={{ backgroundColor: SETTINGS_BG }}>
        {section === "profile" && (
          <div className="max-w-5xl rounded-xl border border-slate-700/60 overflow-hidden p-6" style={{ backgroundColor: CARD_BG }}>
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                {PROFILE_ICON(true)}
                <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar with edit overlay */}
                <div className="relative shrink-0">
                  <Image src="/images/icons/avatar-boy.png" alt="" width={112} height={112} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shrink-0" />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 border-[#242636] transition hover:opacity-90"
                    style={{ backgroundColor: "#1e293b" }}
                    aria-label="Edit avatar"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="#4066FF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
                {/* User name label + input */}
                <div className="flex-1 w-full min-w-0 space-y-2">
                  <label className="block text-sm font-medium text-slate-400">User name</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent focus:ring-[#5E60CE]/50 bg-slate-700/60 border border-slate-600/50"
                    style={{
                      boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.06), 2px 2px 4px rgba(0,0,0,0.2)",
                    }}
                    placeholder="Zeeno"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">Connected wallets</h3>
                  <button
                    type="button"
                    onClick={() => connectNetworksModal?.openConnectNetworksModal()}
                    className="rounded-lg border border-slate-600/60 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50 transition"
                  >
                    + Add networks
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {connectedWalletsLoading ? (
                    <p className="col-span-full text-slate-400 text-sm py-4">Loading connected wallets…</p>
                  ) : connectedWallets.length === 0 ? (
                    <p className="col-span-full text-slate-400 text-sm py-4">No connected wallets</p>
                  ) : (
                    connectedWallets.map((w) => (
                      <div
                        key={w.id}
                        className="rounded-xl border border-slate-700/60 p-4 flex flex-col"
                        style={{ backgroundColor: "#242638" }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="w-12 h-12 rounded-full bg-slate-600/60 shrink-0 flex items-center justify-center overflow-hidden p-1">
                              <img src={getWalletLogoUrl(w)} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                            </span>
                            <div>
                              <p className="font-medium text-white">{w.provider || "Wallet"}</p>
                              <p className="text-sm text-slate-500 font-mono truncate max-w-[120px]">{w.address.slice(0, 6)}…{w.address.slice(-4)}</p>
                            </div>
                          </div>
                          <span className="text-sm text-slate-500 shrink-0">{formatWalletDate(w.connected_at)}</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            type="button"
                            className="flex-1 rounded-lg border border-slate-600/60 py-3.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition"
                          >
                            Remove
                          </button>
                          <button
                            type="button"
                            className="flex-1 rounded-lg border border-slate-600/60 py-3.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition"
                          >
                            Pause
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">Connected Dapps</h3>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-600/60 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50 transition"
                  >
                    + Add Dapps
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {connectedDappsLoading ? (
                    <p className="col-span-full text-slate-400 text-sm py-4">Loading connected dApps…</p>
                  ) : connectedDapps.length === 0 ? (
                    <p className="col-span-full text-slate-400 text-sm py-4">No connected dApps</p>
                  ) : (
                    connectedDapps.map((d, i) => {
                      const whitelisted = (d.status || "").toLowerCase() === "trusted" || (d.status || "").toLowerCase() === "whitelisted";
                      return (
                        <div
                          key={`${d.dapp_name}-${d.connected_wallet_address}-${i}`}
                          className="rounded-xl border border-slate-700/60 p-4 flex flex-col"
                          style={{ backgroundColor: "#242638" }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="w-12 h-12 rounded-full bg-slate-600/60 shrink-0 flex items-center justify-center text-white font-semibold text-lg">
                                {d.dapp_name?.charAt(0) ?? "?"}
                              </span>
                              <div className="min-w-0">
                                <p className="font-medium text-white truncate">{d.dapp_name}</p>
                                <p className="text-sm text-slate-500 truncate">{d.description || `${d.connected_wallet_address.slice(0, 6)}…${d.connected_wallet_address.slice(-4)}`}</p>
                              </div>
                            </div>
                            <span className="text-sm text-slate-500 shrink-0">{d.last_activity || "—"}</span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              type="button"
                              className="flex-1 rounded-lg border border-slate-600/60 py-3.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition"
                            >
                              Blacklist
                            </button>
                            <button
                              type="button"
                              className={`flex-1 rounded-lg py-3.5 text-sm font-medium transition ${
                                whitelisted
                                  ? "text-white"
                                  : "border border-slate-600/60 text-slate-300 hover:bg-slate-700/50"
                              }`}
                              style={whitelisted ? { backgroundColor: ACCENT } : {}}
                            >
                              Whitelist
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {section === "security" && (
          <div className="w-full max-w-5xl">
            <div
              className="rounded-2xl border border-slate-700/60 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
              style={{ background: "linear-gradient(180deg, rgba(20,24,45,0.98) 0%, rgba(17,21,40,0.98) 100%)" }}
            >
              <div className="px-6 py-5 border-b border-slate-700/60" style={{ backgroundColor: "rgba(10,14,32,0.7)" }}>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-slate-600/70 bg-slate-900/70">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                  <h2 className="text-white text-[1.05rem] font-semibold">Security Preferences</h2>
                </div>
              </div>

              <div className="px-6 py-6 space-y-7">
                <div className="space-y-3">
                  <h3 className="text-white text-lg md:text-xl leading-tight font-semibold">Activate Senseiguard Extension</h3>
                  <div className="flex items-start gap-4 justify-between">
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                      Notify when wallets and security actions are needed across all platforms
                    </p>
                    <button
                      type="button"
                      onClick={() => setSecurityExtensionEnabled((v) => !v)}
                      className={`relative mt-1 inline-flex h-7 w-14 shrink-0 items-center rounded-full transition ${
                        securityExtensionEnabled ? "bg-[#0026FF]" : "bg-slate-600"
                      }`}
                      aria-pressed={securityExtensionEnabled}
                      aria-label="Toggle Senseiguard extension activation"
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                          securityExtensionEnabled ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="inline-block border-b-2 border-[#0026FF] pb-1">
                    <h4 className="text-white text-base md:text-lg leading-tight font-semibold">AI Threat Sensitivity</h4>
                  </div>
                  <p className="text-slate-200 text-sm md:text-base">Modes:</p>
                  <div className="relative">
                    <select
                      value={threatMode}
                      onChange={(e) => setThreatMode(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-700/80 bg-[#1d223a] px-4 pr-11 py-3 text-sm md:text-base text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#4066FF]"
                    >
                      <option value="Balanced">Balanced</option>
                      <option value="Strict">Strict</option>
                      <option value="Relaxed">Relaxed</option>
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="inline-block border-b-2 border-[#0026FF] pb-1">
                    <h4 className="text-white text-base md:text-lg leading-tight font-semibold">AI Threat Sensitivity</h4>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-slate-200 text-sm md:text-base leading-relaxed">
                      Automatically block approvals and signatures classified as high risk.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAutoBlockHighRisk((v) => !v)}
                      className={`relative mt-1 inline-flex h-7 w-14 shrink-0 items-center rounded-full transition ${
                        autoBlockHighRisk ? "bg-[#0026FF]" : "bg-slate-600"
                      }`}
                      aria-pressed={autoBlockHighRisk}
                      aria-label="Toggle AI threat sensitivity"
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                          autoBlockHighRisk ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="inline-block border-b-2 border-[#0026FF] pb-1">
                    <h4 className="text-white text-base md:text-lg leading-tight font-semibold">Blind Signature Protection</h4>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-slate-200 text-sm md:text-base leading-relaxed">
                      Detects and warns against unclear or hidden contract signatures.
                    </p>
                    <button
                      type="button"
                      onClick={() => setBlindSignatureProtection((v) => !v)}
                      className={`relative mt-1 inline-flex h-7 w-14 shrink-0 items-center rounded-full transition ${
                        blindSignatureProtection ? "bg-[#0026FF]" : "bg-slate-600"
                      }`}
                      aria-pressed={blindSignatureProtection}
                      aria-label="Toggle blind signature protection"
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                          blindSignatureProtection ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="inline-block border-b-2 border-[#0026FF] pb-1">
                    <h4 className="text-white text-base md:text-lg leading-tight font-semibold">Unlimited Approval Guard</h4>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-slate-200 text-sm md:text-base leading-relaxed">
                      Prevents unlimited token approvals unless explicitly approved.
                    </p>
                    <button
                      type="button"
                      onClick={() => setUnlimitedApprovalGuard((v) => !v)}
                      className={`relative mt-1 inline-flex h-7 w-14 shrink-0 items-center rounded-full transition ${
                        unlimitedApprovalGuard ? "bg-[#0026FF]" : "bg-slate-600"
                      }`}
                      aria-pressed={unlimitedApprovalGuard}
                      aria-label="Toggle unlimited approval guard"
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                          unlimitedApprovalGuard ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {section === "subscription" && (
          <div className="w-full max-w-6xl space-y-5">
            <div
              className="rounded-2xl border border-slate-700/60 p-3 md:p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
              style={{ background: "linear-gradient(180deg, rgba(20,24,45,0.98) 0%, rgba(17,21,40,0.98) 100%)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-slate-600/70 bg-slate-900/70">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.5 20a6.5 6.5 0 0113 0M12 12a4 4 0 100-8 4 4 0 000 8z" />
                      <circle cx="12" cy="12" r="10" strokeWidth={1.8} />
                  </svg>
                </span>
                <h2 className="text-white text-base md:text-lg font-semibold">Subscription & Billing</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
                <div className="bg-[#181C23] rounded-xl flex flex-col w-full min-h-[560px] shadow-lg">
                  <div className="flex items-center justify-between mb-0 p-8 pb-0">
                    <span className="text-lg font-semibold">PRO PLAN</span>
                    <img src="/images/icons/pro.png" alt="Pro" className="w-16 h-16" />
                  </div>
                  <hr className="border-t border-white/10 w-full mb-0 mt-4" />
                  <ul className="mb-8 space-y-3 text-white/80 text-sm px-6 mt-8">
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Full wallet security scan</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Real-time threat & scam alerts</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />AI trading signals (standard)</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Portfolio health score</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Basic spending analytics</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Access to SenseiCard (limited transactions)</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Full Chrome Extension features</li>
                  </ul>
                  <div className="mt-auto">
                    <div className="bg-[#11131A] rounded-t-xl w-full flex flex-col items-start pl-6">
                      <span className="text-2xl font-normal text-white mt-5 flex items-center gap-2">
                        <Image src="/images/icons/usdc.svg" alt="USDC" width={26} height={26} />
                        $30 USDC
                        <span className="text-sm font-normal text-white/70">/month</span>
                      </span>
                      <button
                        type="button"
                        className="w-11/12 py-3 mt-6 mb-6 text-white text-base font-normal rounded-full transition-colors duration-200 border-2 border-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-origin-border hover:from-blue-500 hover:to-indigo-600"
                        style={{ background: "linear-gradient(#181C23, #181C23) padding-box, linear-gradient(90deg, #7F5FFF, #01C8FF, #FFB86C) border-box", border: "2px solid transparent" }}
                      >
                        Go Pro
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#181C23] rounded-xl flex flex-col w-full min-h-[560px] shadow-lg border-2 border-blue-600">
                  <div className="flex items-center justify-between mb-0 p-8 pb-0">
                    <span className="text-lg font-semibold">PRO+ PLAN <span className="text-xs text-blue-400 ml-2">(Recommended)</span></span>
                    <img src="/images/icons/proplus.png" alt="Pro+" className="w-16 h-16" />
                  </div>
                  <hr className="border-t border-white/10 w-full mb-0 mt-4" />
                  <ul className="mb-8 space-y-3 text-white/80 text-sm px-6 mt-8">
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Everything in Pro</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Advanced AI trading predictions</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Trend, momentum & sentiment analysis</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Portfolio optimization engine</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Priority conversion rates on SenseiCard</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Subscription management tools</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Multi-chain asset monitoring</li>
                  </ul>
                  <div className="mt-auto">
                    <div
                      className="rounded-t-xl w-full flex flex-col items-start pl-6 relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg, #11131A 60%, #425EFF 100%)" }}
                    >
                      <span className="text-2xl font-normal text-white mt-5 flex items-center gap-2">
                        <Image src="/images/icons/usdc.svg" alt="USDC" width={26} height={26} />
                        $50 USDC
                        <span className="text-sm font-normal text-white/70">/month</span>
                      </span>
                      <button
                        type="button"
                        className="w-11/12 py-3 mt-6 mb-6 text-white text-base font-normal rounded-full shadow-lg transition-colors duration-200 border-none"
                        style={{ background: "linear-gradient(135deg, #425EFF 40%, #7F5FFF 100%)" }}
                      >
                        Go Pro+
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#181C23] rounded-xl flex flex-col w-full min-h-[560px] shadow-lg">
                  <div className="flex items-center justify-between mb-0 p-8 pb-0">
                    <span className="text-lg font-semibold">PREMIUM PLAN</span>
                    <img src="/images/icons/premium.png" alt="Premium" className="w-16 h-16" />
                  </div>
                  <hr className="border-t border-white/10 w-full mb-0 mt-4" />
                  <ul className="mb-8 space-y-3 text-white/80 text-sm px-6 mt-8">
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Everything in Pro+</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Unlimited spending with SenseiCard</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Smart budgeting & auto-analytics</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />High-frequency AI alerts</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Wallet risk logs + breach history</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Instant multi-chain insights</li>
                    <li className="flex items-center gap-2.5"><img src="/images/icons/check-circle.png" alt="check" className="w-4 h-4" />Priority customer support</li>
                  </ul>
                  <div className="mt-auto">
                    <div className="bg-[#11131A] rounded-t-xl w-full flex flex-col items-start pl-6">
                      <span className="text-2xl font-normal text-white mt-5 flex items-center gap-2">
                        <Image src="/images/icons/usdc.svg" alt="USDC" width={26} height={26} />
                        $200 USDC
                        <span className="text-sm font-normal text-white/70">/month</span>
                      </span>
                      <button
                        type="button"
                        className="w-11/12 py-3 mt-6 mb-6 text-white text-base font-normal rounded-full transition-colors duration-200 border-2 border-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-origin-border hover:from-blue-500 hover:to-indigo-600"
                        style={{ background: "linear-gradient(#181C23, #181C23) padding-box, linear-gradient(90deg, #7F5FFF, #01C8FF, #FFB86C) border-box", border: "2px solid transparent" }}
                      >
                        Get Premium
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl border border-slate-700/60 p-3 md:p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
              style={{ background: "linear-gradient(180deg, rgba(20,24,45,0.98) 0%, rgba(17,21,40,0.98) 100%)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-slate-600/70 bg-slate-900/70">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6m2 12H7a2 2 0 01-2-2V6a2 2 0 012-2h6l6 6v8a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <h3 className="text-white text-base md:text-lg font-semibold">Billing History</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      value={billingSearch}
                      onChange={(e) => setBillingSearch(e.target.value)}
                      placeholder="Search"
                      className="w-44 sm:w-56 rounded-lg border border-slate-700/70 bg-[#1d223a] py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#4066FF]"
                    />
                    <svg className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700/70 bg-[#1d223a] text-slate-300 hover:text-white transition"
                    aria-label="Filter transactions"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M6 12h12M10 19h4" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="text-left text-slate-300 bg-[#0F1426]">
                      <th className="py-3 px-4 rounded-l-lg font-medium">Plan name</th>
                      <th className="py-3 px-4 font-medium">Amount</th>
                      <th className="py-3 px-4 font-medium">Purchase date</th>
                      <th className="py-3 px-4 font-medium">End date</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 rounded-r-lg font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BILLING_HISTORY.filter((row) => {
                      const term = billingSearch.trim().toLowerCase();
                      if (!term) return true;
                      return (
                        row.planName.toLowerCase().includes(term) ||
                        row.amount.toLowerCase().includes(term) ||
                        row.status.toLowerCase().includes(term)
                      );
                    }).map((row) => (
                      <tr key={row.id} className="border-b border-slate-800/80 text-slate-400">
                        <td className="py-3.5 px-4">{row.planName}</td>
                        <td className="py-3.5 px-4">{row.amount}</td>
                        <td className="py-3.5 px-4">{row.purchaseDate}</td>
                        <td className="py-3.5 px-4">{row.endDate}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-[#32BB1D]">{row.status}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            className="mx-auto flex items-center justify-center w-8 h-8 rounded-md text-slate-200 hover:text-white hover:bg-slate-800/80 transition"
                            aria-label={`Download ${row.planName} invoice`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M8 12l4 4m0 0l4-4m-4 4V4" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {section === "support" && (
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center gap-2">
              {SUPPORT_ICON(true)}
              <h2 className="text-xl font-semibold text-white">Support & Feedback</h2>
            </div>
            <div className="rounded-xl border border-slate-700/60 p-6" style={{ backgroundColor: CARD_BG }}>
              <p className="text-slate-400">Support and feedback options will appear here.</p>
            </div>
          </div>
        )}

        {section === "terms" && (
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center gap-2">
              {DOCUMENT_ICON(true)}
              <h2 className="text-xl font-semibold text-white">Terms & Privacy Policy</h2>
            </div>
            <div className="rounded-xl border border-slate-700/60 p-6" style={{ backgroundColor: CARD_BG }}>
              <p className="text-slate-400">Terms of service and privacy policy will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
