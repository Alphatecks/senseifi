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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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

export default function SettingsPage() {
  const { address } = useWallet();
  const { dashboardUser } = useDashboardUser();
  const connectNetworksModal = useConnectNetworksModal();
  const [section, setSection] = useState<SettingsSection>("profile");
  const [username, setUsername] = useState("Zeeno");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectedWallets, setConnectedWallets] = useState<WalletListItem[]>([]);
  const [connectedWalletsLoading, setConnectedWalletsLoading] = useState(false);
  const [connectedDapps, setConnectedDapps] = useState<ActivityMonitorDappItem[]>([]);
  const [connectedDappsLoading, setConnectedDappsLoading] = useState(false);

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
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center gap-2">
              {SHIELD_ICON(true)}
              <h2 className="text-xl font-semibold text-white">Security Preferences</h2>
            </div>
            <div className="rounded-xl border border-slate-700/60 p-6" style={{ backgroundColor: CARD_BG }}>
              <p className="text-slate-400">Security settings and 2FA options will appear here.</p>
            </div>
          </div>
        )}

        {section === "subscription" && (
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center gap-2">
              {CARD_ICON(true)}
              <h2 className="text-xl font-semibold text-white">Subscription & Billing</h2>
            </div>
            <div className="rounded-xl border border-slate-700/60 p-6" style={{ backgroundColor: CARD_BG }}>
              <p className="text-slate-400">Subscription and billing management will appear here.</p>
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
