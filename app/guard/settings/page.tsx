"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useDashboardUser } from "@/context/DashboardUserContext";
import { useConnectNetworksModal } from "@/context/ConnectWalletsModalContext";
import { getWalletsForAddress, getActivityMonitorDapps } from "@/services/dashboardService";
import type { WalletListItem, ActivityMonitorDappItem } from "@/services/dashboardService";
import { walletService } from "@/services/walletService";
import { getBillingHistory, type BillingHistoryItem } from "@/services/subscriptionService";
import RemoveWalletConfirmationModal from "@/app/guard/components/RemoveWalletConfirmationModal";
import GuardSettingsSubmenu, {
  SETTINGS_NAV_ITEMS,
  parseSettingsSection,
  type SettingsSectionId,
} from "@/app/guard/components/GuardSettingsSubmenu";
import SupportFeedbackSection from "@/app/guard/components/SupportFeedbackSection";
import TermsPrivacySection from "@/app/guard/components/TermsPrivacySection";

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

type BillingHistoryRow = {
  id: string;
  planName: string;
  amount: string;
  purchaseDate: string;
  endDate: string;
  status: string;
  invoiceUrl?: string;
};

const DAPPS_PER_PAGE = 3;
const BILLING_PER_PAGE = 10;

function normalizeBillingDate(value: unknown): string {
  const raw = typeof value === "string" ? value : "";
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

function normalizeBillingAmount(item: BillingHistoryItem): string {
  const amountRaw = item.amount;
  const currency = typeof item.currency === "string" && item.currency.trim() ? item.currency.trim().toUpperCase() : "USDC";
  if (typeof amountRaw === "number" && Number.isFinite(amountRaw)) return `$${amountRaw} ${currency}`;
  if (typeof amountRaw === "string" && amountRaw.trim()) {
    const value = amountRaw.trim();
    return value.startsWith("$") ? `${value} ${currency}` : `$${value} ${currency}`;
  }
  return `— ${currency}`;
}

function mapBillingItem(item: BillingHistoryItem, idx: number): BillingHistoryRow {
  const idCandidate = [item.id, item.payment_id, item.tx_hash, item.invoice_url, item.created_at]
    .find((v) => typeof v === "string" && v.trim().length > 0);
  const planName = typeof item.plan_name === "string" && item.plan_name.trim() ? item.plan_name : "Plan";
  const statusRaw = typeof item.status === "string" && item.status.trim() ? item.status : "pending";
  const status = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();
  return {
    id: idCandidate ? String(idCandidate) : `billing-${idx}`,
    planName,
    amount: normalizeBillingAmount(item),
    purchaseDate: normalizeBillingDate(item.purchase_date ?? item.created_at),
    endDate: normalizeBillingDate(item.end_date),
    status,
    invoiceUrl: typeof item.invoice_url === "string" ? item.invoice_url : undefined,
  };
}

function sectionIcon(id: SettingsSectionId) {
  return SETTINGS_NAV_ITEMS.find((item) => item.id === id)?.icon(true) ?? null;
}

function SecuritySectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-block border-b-2 border-[#0026FF] pb-1">
      <h3 className="text-white text-base lg:text-lg leading-tight font-semibold">{children}</h3>
    </div>
  );
}

function SecurityToggle({
  enabled,
  onToggle,
  ariaLabel,
}: {
  enabled: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition ${
        enabled ? "bg-[#0026FF]" : "bg-slate-600"
      }`}
      aria-pressed={enabled}
      aria-label={ariaLabel}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = parseSettingsSection(searchParams.get("section"));
  const { activeAddress: address, disconnectWallet } = useWallet();
  const { dashboardUser } = useDashboardUser();
  const connectNetworksModal = useConnectNetworksModal();
  const [username, setUsername] = useState("Zeeno");
  const [connectedWallets, setConnectedWallets] = useState<WalletListItem[]>([]);
  const [connectedWalletsLoading, setConnectedWalletsLoading] = useState(false);
  const [walletToRemove, setWalletToRemove] = useState<WalletListItem | null>(null);
  const [isRemovingWallet, setIsRemovingWallet] = useState(false);
  const [connectedDapps, setConnectedDapps] = useState<ActivityMonitorDappItem[]>([]);
  const [connectedDappsLoading, setConnectedDappsLoading] = useState(false);
  const [dappsPage, setDappsPage] = useState(1);
  const [securityExtensionEnabled, setSecurityExtensionEnabled] = useState(true);
  const [threatMode, setThreatMode] = useState("Balanced");
  const [autoBlockHighRisk, setAutoBlockHighRisk] = useState(true);
  const [blindSignatureProtection, setBlindSignatureProtection] = useState(true);
  const [unlimitedApprovalGuard, setUnlimitedApprovalGuard] = useState(true);
  const [billingSearch, setBillingSearch] = useState("");
  const [billingStatus, setBillingStatus] = useState("confirmed");
  const [billingPage, setBillingPage] = useState(1);
  const [billingRows, setBillingRows] = useState<BillingHistoryRow[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingTotal, setBillingTotal] = useState<number | null>(null);

  const setSection = (nextSection: SettingsSectionId) => {
    router.replace(`/guard/settings?section=${nextSection}`, { scroll: false });
  };

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

  const refreshConnectedWallets = useCallback(async () => {
    if (!address) {
      setConnectedWallets([]);
      return;
    }
    setConnectedWalletsLoading(true);
    try {
      const res = await getWalletsForAddress(address);
      setConnectedWallets(res?.data ?? []);
    } finally {
      setConnectedWalletsLoading(false);
    }
  }, [address]);

  const handleRemoveWalletClick = (wallet: WalletListItem) => {
    setWalletToRemove(wallet);
  };

  const handleCloseRemoveWalletModal = () => {
    if (isRemovingWallet) return;
    setWalletToRemove(null);
  };

  const handleConfirmRemoveWallet = async () => {
    if (!walletToRemove) return;
    setIsRemovingWallet(true);
    try {
      if (walletToRemove.address.toLowerCase() === address?.toLowerCase()) {
        await disconnectWallet();
      } else {
        await walletService.disconnectWallet(walletToRemove.address);
        await refreshConnectedWallets();
      }
      setWalletToRemove(null);
    } catch (error) {
      console.error("Failed to remove wallet:", error);
    } finally {
      setIsRemovingWallet(false);
    }
  };

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

  useEffect(() => {
    setDappsPage(1);
  }, [connectedDapps.length, address, dashboardUser?.user_id]);

  useEffect(() => {
    setBillingPage(1);
  }, [billingSearch, billingStatus, dashboardUser?.user_id]);

  useEffect(() => {
    if (section !== "subscription") return;
    const userId = dashboardUser?.user_id?.trim() || "user_123";
    if (!userId) {
      setBillingRows([]);
      setBillingError("Missing user id.");
      return;
    }
    let ignore = false;
    const timer = window.setTimeout(() => {
      setBillingLoading(true);
      setBillingError(null);
      getBillingHistory({
        user_id: userId,
        page: billingPage,
        per_page: BILLING_PER_PAGE,
        search: billingSearch.trim() || undefined,
        status: billingStatus.trim() || undefined,
      })
        .then((res) => {
          if (ignore) return;
          if (!res) {
            setBillingRows([]);
            setBillingTotal(null);
            setBillingError("Unable to load billing history.");
            return;
          }
          const mapped = res.items.map(mapBillingItem);
          setBillingRows(mapped);
          setBillingTotal(typeof res.pagination.total === "number" ? res.pagination.total : null);
        })
        .catch(() => {
          if (ignore) return;
          setBillingRows([]);
          setBillingTotal(null);
          setBillingError("Unable to load billing history.");
        })
        .finally(() => {
          if (!ignore) setBillingLoading(false);
        });
    }, 250);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [section, dashboardUser?.user_id, billingPage, billingSearch, billingStatus]);

  const dappsTotalPages = Math.max(1, Math.ceil(connectedDapps.length / DAPPS_PER_PAGE));
  const billingHasNextPage =
    typeof billingTotal === "number"
      ? billingPage * BILLING_PER_PAGE < billingTotal
      : billingRows.length >= BILLING_PER_PAGE;
  const paginatedDapps = connectedDapps.slice(
    (dappsPage - 1) * DAPPS_PER_PAGE,
    dappsPage * DAPPS_PER_PAGE
  );

  useEffect(() => {
    if (dappsPage > dappsTotalPages) setDappsPage(dappsTotalPages);
  }, [dappsPage, dappsTotalPages]);

  const profileContent = (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-center gap-2">
        {sectionIcon("profile")}
        <h2 className="text-lg lg:text-xl font-semibold text-white">Profile Settings</h2>
      </div>

      <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:gap-6">
        <div className="relative shrink-0">
          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-[#4a4d5c] flex items-center justify-center overflow-hidden">
            <Image src="/images/icons/avatar-boy.png" alt="" width={112} height={112} className="w-full h-full rounded-full object-cover" />
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 border-[#0c1129] lg:border-[#242636] transition hover:opacity-90"
            style={{ backgroundColor: "#1e293b" }}
            aria-label="Edit avatar"
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="#4066FF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
        <div className="flex-1 w-full min-w-0 space-y-2">
          <label className="block text-sm font-medium text-slate-400">User name</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5E60CE]/50 bg-[#1a1d2e] lg:bg-slate-700/60 border border-slate-700/40 lg:border-slate-600/50"
            style={{
              boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.04), 2px 2px 4px rgba(0,0,0,0.15)",
            }}
            placeholder="Zeeno"
          />
        </div>
      </div>

      <div className="space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-white">Connected wallets</h3>
          <button
            type="button"
            onClick={() => connectNetworksModal?.openConnectNetworksModal()}
            className="text-sm font-medium text-slate-500 hover:text-slate-300 transition shrink-0 lg:rounded-lg lg:border lg:border-slate-600/60 lg:px-3 lg:py-2 lg:text-slate-300 lg:hover:bg-slate-800/50"
          >
            <span className="lg:hidden">+ Add wallets</span>
            <span className="hidden lg:inline">+ Add networks</span>
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          {connectedWalletsLoading ? (
            <p className="col-span-full text-slate-400 text-sm py-4">Loading connected wallets…</p>
          ) : connectedWallets.length === 0 ? (
            <p className="col-span-full text-slate-400 text-sm py-4">No connected wallets</p>
          ) : (
            connectedWallets.map((w) => (
              <div
                key={w.id}
                className="rounded-xl p-4 flex flex-col lg:border lg:border-slate-700/60"
                style={{ backgroundColor: CARD_BG }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-[#4a4d5c] lg:bg-slate-600/60 shrink-0 flex items-center justify-center overflow-hidden p-1.5 lg:p-1">
                      <img src={getWalletLogoUrl(w)} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold lg:font-medium text-white capitalize">{w.provider || "Wallet"}</p>
                      <p className="text-sm text-slate-500 capitalize lg:normal-case lg:font-mono lg:truncate lg:max-w-[120px]">
                        <span className="lg:hidden">{w.provider || "Wallet"}</span>
                        <span className="hidden lg:inline">{w.address.slice(0, 6)}…{w.address.slice(-4)}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 shrink-0">{formatWalletDate(w.connected_at)}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveWalletClick(w)}
                    className="flex-1 rounded-xl lg:rounded-lg py-3 lg:py-3.5 text-sm font-medium text-white lg:text-slate-300 bg-[#1a1d2e] lg:bg-transparent transition hover:opacity-90 lg:hover:bg-slate-700/50 lg:border lg:border-slate-600/60"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl lg:rounded-lg py-3 lg:py-3.5 text-sm font-medium text-white lg:text-slate-300 bg-[#1a1d2e] lg:bg-transparent transition hover:opacity-90 lg:hover:bg-slate-700/50 lg:border lg:border-slate-600/60"
                  >
                    Pause
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-white">Connected Dapps</h3>
          <button
            type="button"
            className="text-sm font-medium text-slate-500 hover:text-slate-300 transition shrink-0 lg:rounded-lg lg:border lg:border-slate-600/60 lg:px-3 lg:py-2 lg:text-slate-300 lg:hover:bg-slate-800/50"
          >
            + Add Dapps
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          {connectedDappsLoading ? (
            <p className="col-span-full text-slate-400 text-sm py-4">Loading connected dApps…</p>
          ) : connectedDapps.length === 0 ? (
            <p className="col-span-full text-slate-400 text-sm py-4">No connected dApps</p>
          ) : (
            paginatedDapps.map((d, i) => (
                <div
                  key={`${d.dapp_name}-${d.connected_wallet_address}-${(dappsPage - 1) * DAPPS_PER_PAGE + i}`}
                  className="rounded-xl p-4 flex flex-col lg:border lg:border-slate-700/60"
                  style={{ backgroundColor: CARD_BG }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-[#4a4d5c] lg:bg-slate-600/60 shrink-0 flex items-center justify-center text-white font-semibold text-lg">
                        {d.dapp_name?.charAt(0) ?? "?"}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold lg:font-medium text-white truncate">{d.dapp_name}</p>
                        <p className="text-sm text-slate-500 truncate">
                          <span className="lg:hidden">{d.description || d.dapp_name}</span>
                          <span className="hidden lg:inline">{d.description || `${d.connected_wallet_address.slice(0, 6)}…${d.connected_wallet_address.slice(-4)}`}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500 shrink-0">{d.last_activity || "—"}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      className="flex-1 rounded-xl lg:rounded-lg py-3 lg:py-3.5 text-sm font-medium text-white lg:text-slate-300 bg-[#1a1d2e] lg:bg-transparent transition hover:opacity-90 lg:hover:bg-slate-700/50 lg:border lg:border-slate-600/60"
                    >
                      Blacklist
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-xl lg:rounded-lg py-3 lg:py-3.5 text-sm font-medium text-white transition hover:opacity-90 bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90"
                    >
                      Whitelist
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
        {!connectedDappsLoading && connectedDapps.length > DAPPS_PER_PAGE && (
          <div className="flex items-center justify-center gap-2 pt-1">
            {Array.from({ length: dappsTotalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDappsPage(n)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                  dappsPage === n ? "bg-[#4066FF] text-white" : "bg-slate-700/60 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
                }`}
                aria-label={`Go to dApps page ${n}`}
                aria-current={dappsPage === n ? "page" : undefined}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const securitySections = (
    <div className="space-y-8 lg:space-y-7">
      <div className="space-y-3">
        <SecuritySectionHeading>Activate Senseiguard Extension</SecuritySectionHeading>
        <div className="flex items-start justify-between gap-4">
          <p className="text-slate-400 lg:text-slate-300 text-sm lg:text-base leading-relaxed pr-2">
            Notify when wallets and security actions are needed across all platforms
          </p>
          <SecurityToggle
            enabled={securityExtensionEnabled}
            onToggle={() => setSecurityExtensionEnabled((v) => !v)}
            ariaLabel="Toggle Senseiguard extension activation"
          />
        </div>
      </div>

      <div className="space-y-3">
        <SecuritySectionHeading>AI Threat Sensitivity</SecuritySectionHeading>
        <p className="text-slate-400 lg:text-slate-200 text-sm lg:text-base">Modes:</p>
        <div className="relative">
          <select
            value={threatMode}
            onChange={(e) => setThreatMode(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-700/60 lg:border-slate-700/80 bg-[#1a1d2e] lg:bg-[#1d223a] px-4 pr-11 py-3.5 lg:py-3 text-sm lg:text-base text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#4066FF]"
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
        <SecuritySectionHeading>AI Threat Sensitivity</SecuritySectionHeading>
        <div className="flex items-start justify-between gap-4">
          <p className="text-slate-400 lg:text-slate-200 text-sm lg:text-base leading-relaxed pr-2">
            Automatically block approvals and signatures classified as high risk.
          </p>
          <SecurityToggle
            enabled={autoBlockHighRisk}
            onToggle={() => setAutoBlockHighRisk((v) => !v)}
            ariaLabel="Toggle AI threat sensitivity"
          />
        </div>
      </div>

      <div className="space-y-3">
        <SecuritySectionHeading>Blind Signature Protection</SecuritySectionHeading>
        <div className="flex items-start justify-between gap-4">
          <p className="text-slate-400 lg:text-slate-200 text-sm lg:text-base leading-relaxed pr-2">
            Detects and warns against unclear or hidden contract signatures.
          </p>
          <SecurityToggle
            enabled={blindSignatureProtection}
            onToggle={() => setBlindSignatureProtection((v) => !v)}
            ariaLabel="Toggle blind signature protection"
          />
        </div>
      </div>

      <div className="space-y-3">
        <SecuritySectionHeading>Unlimited Approval Guard</SecuritySectionHeading>
        <div className="flex items-start justify-between gap-4">
          <p className="text-slate-400 lg:text-slate-200 text-sm lg:text-base leading-relaxed pr-2">
            Prevents unlimited token approvals unless explicitly approved.
          </p>
          <SecurityToggle
            enabled={unlimitedApprovalGuard}
            onToggle={() => setUnlimitedApprovalGuard((v) => !v)}
            ariaLabel="Toggle unlimited approval guard"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-0 flex-1 min-h-full lg:rounded-2xl lg:overflow-hidden lg:border lg:border-slate-800/50 lg:shadow-xl -mx-6 -mt-6 lg:mx-0 lg:mt-0" style={{ backgroundColor: SETTINGS_BG }}>
      <aside className="hidden lg:flex flex-col w-[32rem] shrink-0 border-b lg:border-b-0 border-slate-700/50 lg:relative p-4 lg:min-h-full" style={{ backgroundColor: SETTINGS_BG }}>
        <GuardSettingsSubmenu
          variant="sidebar"
          activeSection={section}
          onSelectSection={setSection}
          onSignOut={() => void disconnectWallet()}
        />
      </aside>

      {/* Right content */}
      <div className="flex-1 min-w-0 min-h-full overflow-auto px-4 pb-6 pt-2 lg:p-6 flex flex-col" style={{ backgroundColor: SETTINGS_BG }}>
        {section === "profile" && (
          <div
            className="lg:max-w-5xl lg:rounded-xl lg:border lg:border-slate-700/60 lg:overflow-hidden lg:p-6 lg:bg-[#242636]"
            style={{ backgroundColor: SETTINGS_BG }}
          >
            {profileContent}
          </div>
        )}

        {section === "security" && (
          <>
            <div className="lg:hidden space-y-6" style={{ backgroundColor: SETTINGS_BG }}>
              <div className="flex items-center gap-2">
                {sectionIcon("security")}
                <h2 className="text-lg font-semibold text-white">Security Preferences</h2>
              </div>
              {securitySections}
            </div>

            <div className="hidden lg:block w-full max-w-5xl">
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
                <div className="px-6 py-6">{securitySections}</div>
              </div>
            </div>
          </>
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
                  <select
                    value={billingStatus}
                    onChange={(e) => setBillingStatus(e.target.value)}
                    className="rounded-lg border border-slate-700/70 bg-[#1d223a] py-2 px-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4066FF]"
                    aria-label="Filter billing status"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="">All status</option>
                  </select>
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
                    {billingLoading ? (
                      <tr className="border-b border-slate-800/80 text-slate-400">
                        <td className="py-4 px-4" colSpan={6}>Loading billing history…</td>
                      </tr>
                    ) : billingError ? (
                      <tr className="border-b border-slate-800/80 text-slate-400">
                        <td className="py-4 px-4 text-red-400" colSpan={6}>{billingError}</td>
                      </tr>
                    ) : billingRows.length === 0 ? (
                      <tr className="border-b border-slate-800/80 text-slate-400">
                        <td className="py-4 px-4" colSpan={6}>No billing history found.</td>
                      </tr>
                    ) : billingRows.map((row) => (
                      <tr key={row.id} className="border-b border-slate-800/80 text-slate-400">
                        <td className="py-3.5 px-4">{row.planName}</td>
                        <td className="py-3.5 px-4">{row.amount}</td>
                        <td className="py-3.5 px-4">{row.purchaseDate}</td>
                        <td className="py-3.5 px-4">{row.endDate}</td>
                        <td className="py-3.5 px-4">
                          <span className={row.status.toLowerCase() === "confirmed" || row.status.toLowerCase() === "completed" ? "text-[#32BB1D]" : row.status.toLowerCase() === "pending" ? "text-amber-500" : "text-[#F00500]"}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (row.invoiceUrl) window.open(row.invoiceUrl, "_blank", "noopener,noreferrer");
                            }}
                            disabled={!row.invoiceUrl}
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
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBillingPage((p) => Math.max(1, p - 1))}
                  disabled={billingLoading || billingPage <= 1}
                  className="px-3 py-1.5 text-xs rounded border border-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-400">Page {billingPage}</span>
                <button
                  type="button"
                  onClick={() => setBillingPage((p) => p + 1)}
                  disabled={billingLoading || !billingHasNextPage}
                  className="px-3 py-1.5 text-xs rounded border border-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {section === "support" && (
          <div className="flex w-full flex-1 flex-col min-h-0 -mx-4 -mt-2 -mb-6 lg:mx-0 lg:mt-0 lg:mb-0">
            <SupportFeedbackSection />
          </div>
        )}

        {section === "terms" && (
          <div className="flex w-full flex-1 flex-col min-h-0 -mx-4 -mt-2 -mb-6 lg:mx-0 lg:mt-0 lg:mb-0">
            <TermsPrivacySection />
          </div>
        )}
      </div>

      <RemoveWalletConfirmationModal
        open={walletToRemove !== null}
        onClose={handleCloseRemoveWalletModal}
        onConfirm={() => void handleConfirmRemoveWallet()}
        isRemoving={isRemovingWallet}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400 text-sm">Loading settings…</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
