"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDashboardUser } from "@/context/DashboardUserContext";
import { useWaitlistXp } from "@/context/WaitlistXpContext";
import { RescanModalProvider } from "@/context/RescanModalContext";
import { ConnectNetworksModalProvider } from "@/context/ConnectWalletsModalContext";
import { GuardSearchProvider } from "@/context/GuardSearchContext";
import { useWallet } from "@/hooks/useWallet";
import { getDashboardSummary } from "@/services/dashboardService";
import { walletService } from "@/services/walletService";
import GuardHeaderSearch from "@/app/guard/components/GuardHeaderSearch";
import GuardChatbotFab from "@/app/guard/components/GuardChatbotFab";
import GuardSettingsSubmenu, { parseSettingsSection, type SettingsSectionId } from "@/app/guard/components/GuardSettingsSubmenu";
import ClaimXpModal from "@/views/components/ClaimXpModal";
import ClaimXpSuccessModal, { type ClaimXpSuccessData } from "@/views/components/ClaimXpSuccessModal";
import chromeIcon from "@/assets/icons/chrome.png";
import needHelpBackground from "@/assets/icons/Background.png";

const GuardNotificationsPanel = dynamic(() => import("@/app/guard/components/GuardNotificationsPanel"), {
  ssr: false,
  loading: () => null,
});

const navItems = [
  { label: "Dashboard", href: "/guard", icon: "grid" },
  { label: "Wallet Security", href: "/guard/wallet-security", icon: "key" },
  { label: "Activity Monitor", href: "/guard/activity-monitor", icon: "chart" },
  { label: "Threat Intelligence", href: "/guard/threat-intelligence", icon: "shield-check" },
  { label: "Contract Scanner", href: "/guard/contract-scanner", icon: "document" },
  { label: "Chrome extension", href: "/guard/chrome-extension", icon: "ext" },
  { label: "Settings", href: "/guard/settings", icon: "settings" },
];

const XP_LOCKED_ROUTES = new Set([
  "/guard/wallet-security",
  "/guard/threat-intelligence",
  "/guard/contract-scanner",
  "/guard/activity-monitor",
]);

function NavIcon({ name, active }: { name: string; active?: boolean }) {
  const cls = "w-7 h-7 shrink-0";
  const iconCls = active ? "text-[#4066FF]" : "text-slate-400";
  if (name === "grid")
    return (
      <svg className={`${cls} ${iconCls}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    );
  if (name === "key")
    return (
      <svg className={`${cls} ${iconCls}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    );
  if (name === "chart")
    return (
      <svg className={`${cls} ${iconCls}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
  if (name === "shield-check")
    return (
      <svg className={`${cls} ${iconCls}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  if (name === "document")
    return (
      <svg className={`${cls} ${iconCls}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  if (name === "card")
    return (
      <svg className={`${cls} ${iconCls}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    );
  if (name === "ext")
    return (
      <Image
        src={chromeIcon}
        alt="Chrome"
        className={`${cls} ${active ? "chrome-icon-active" : "chrome-icon-inactive"}`}
        width={28}
        height={28}
      />
    );
  if (name === "settings")
    return (
      <svg className={`${cls} ${iconCls}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  return <span className={cls} />;
}

function formatBalance(totalAssetUsd: string | null | undefined): string {
  if (totalAssetUsd == null || totalAssetUsd === "") return "—";
  return totalAssetUsd.startsWith("$") ? totalAssetUsd : `$${totalAssetUsd}`;
}

function NitroIcon({ className }: { className?: string }) {
  const gradientId = React.useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`nitro-${gradientId}`} x1="5" y1="3" x2="19" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5865F2" />
          <stop stopColor="#9B59FF" />
          <stop stopColor="#FF6AD5" />
        </linearGradient>
      </defs>
      <path d="M12 2.5 4.5 7v10L12 21.5 19.5 17V7L12 2.5Z" fill={`url(#nitro-${gradientId})`} />
      <path d="M12 2.5v19M4.5 7l7.5 4.25L19.5 7M4.5 17l7.5-4.25L19.5 17" stroke="white" strokeOpacity="0.28" strokeWidth="0.75" />
    </svg>
  );
}

function XpLabel({ xp, iconClassName = "w-4 h-4 shrink-0" }: { xp?: number | null; iconClassName?: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <NitroIcon className={iconClassName} />
      {xp != null && xp > 0 ? `${xp} XP` : "XP"}
    </span>
  );
}

export default function GuardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeAddress: address, isConnectedOrRemembered, isWalletSessionPending, hasHydratedWallet, disconnectWallet } = useWallet();
  const { dashboardUser } = useDashboardUser();
  const { xpBalance: waitlistXp } = useWaitlistXp();
  const [totalAssetUsd, setTotalAssetUsd] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileNavView, setMobileNavView] = useState<"main" | "settings">("main");
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSectionId>("profile");
  const [isNavigating, setIsNavigating] = useState(false);
  const [xpModalOpen, setXpModalOpen] = useState(false);
  const [xpSuccessOpen, setXpSuccessOpen] = useState(false);
  const [xpSuccessData, setXpSuccessData] = useState<ClaimXpSuccessData | null>(null);
  const [walletRestoreTimedOut, setWalletRestoreTimedOut] = useState(false);
  const isXpRouteLocked = waitlistXp != null && waitlistXp <= 1;

  useEffect(() => {
    const timer = window.setTimeout(() => setWalletRestoreTimedOut(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasHydratedWallet) return;
    if (isWalletSessionPending && !walletRestoreTimedOut) return;
    if (!isConnectedOrRemembered) {
      router.replace("/");
    }
  }, [hasHydratedWallet, isWalletSessionPending, walletRestoreTimedOut, isConnectedOrRemembered, router]);

  useEffect(() => {
    if (!isXpRouteLocked) return;
    if (XP_LOCKED_ROUTES.has(pathname)) {
      router.replace("/guard");
    }
  }, [isXpRouteLocked, pathname, router]);

  useEffect(() => {
    if (!address) {
      setTotalAssetUsd(null);
      setUnreadCount(0);
      return;
    }
    getDashboardSummary(address).then((s) => {
      setTotalAssetUsd(s?.total_asset_usd ?? null);
      setUnreadCount(s?.unread_alerts ?? 0);
    });
  }, [address]);

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const openXpFlow = useCallback(async () => {
    const walletAddress = address?.trim();
    const userId = dashboardUser?.user_id?.trim();
    if (walletAddress || userId) {
      try {
        const status = await walletService.getWaitlistStatus(walletAddress || undefined, userId || undefined);
        if (status.claimed && status.data) {
          setXpSuccessData({
            xp: status.data.xp,
            email: status.data.email,
            successfulReferrals: status.data.successfulCount ?? status.data.direct_referrals ?? 0,
            walletAddress: status.data.wallet_address,
            justClaimed: false,
          });
          setXpSuccessOpen(true);
          return;
        }
      } catch {
        // Fall through to claim form if status lookup fails.
      }
    }
    setXpModalOpen(true);
  }, [address, dashboardUser?.user_id]);

  const openBuyXpFlow = useCallback(() => {
    setXpModalOpen(false);
    setXpSuccessOpen(false);
    router.push("/guard/settings?section=subscription");
  }, [router]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);
  const mobileNotificationsPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/guard/settings") {
      setActiveSettingsSection(parseSettingsSection(new URLSearchParams(window.location.search).get("section")));
    }
  }, [pathname, isNavigating, mobileNavOpen]);

  useEffect(() => {
    if (mobileNavOpen && pathname === "/guard/settings") {
      setMobileNavView("settings");
    }
  }, [mobileNavOpen, pathname]);

  useEffect(() => {
    if (!mobileNavOpen) {
      setMobileNavView("main");
    }
  }, [mobileNavOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) return;
    e.preventDefault();
    setMobileNavOpen(false);
    setMobileNavView("main");
    setIsNavigating(true);
    router.push(href);
  };

  const handleSettingsNavClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileNavView("settings");
  };

  const handleSettingsSectionSelect = (section: SettingsSectionId) => {
    setMobileNavOpen(false);
    setMobileNavView("main");
    setIsNavigating(true);
    router.push(`/guard/settings?section=${section}`);
  };

  useEffect(() => {
    if (!notificationsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inDesktop = notificationRef.current?.contains(target);
      const inMobile = mobileNotificationRef.current?.contains(target);
      const inMobilePanel = mobileNotificationsPanelRef.current?.contains(target);
      if (!inDesktop && !inMobile && !inMobilePanel) setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  const title = pathname === "/guard/wallet-security" ? "Wallet Security" : pathname === "/guard/contract-scanner" ? "Contract Scanner" : pathname === "/guard/chrome-extension" ? "Chrome extension" : pathname === "/guard/activity-monitor" ? "Activity Monitor" : pathname === "/guard/threat-intelligence" ? "Threat Intelligence" : pathname === "/guard/settings" ? "Settings" : "Dashboard";

  const hasSignedInWallet = isConnectedOrRemembered;
  if (!hasHydratedWallet || !hasSignedInWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]" role="status" aria-label="Loading SenseiFi">
        <div className="flex items-center gap-3">
          <Image
            src="/images/scaled_logo.png"
            alt=""
            width={56}
            height={56}
            className="h-12 w-auto animate-senseifi-logo-zoom"
            priority
            aria-hidden
          />
          <span className="font-semibold text-white text-3xl tracking-tight animate-senseifi-text-zoom">
            SenseiFi
          </span>
        </div>
      </div>
    );
  }

  return (
    <RescanModalProvider>
    <ConnectNetworksModalProvider>
    <GuardSearchProvider>
    <div className="h-screen flex overflow-hidden bg-[#0a0a1a] text-white relative">
      <div className="dashboard-hack-bg fixed inset-0 pointer-events-none z-0" aria-hidden />
      {/* Mobile only: visible blockchain / crypto background animation */}
      <div className="xl:hidden fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        <svg className="absolute inset-0 w-full h-full blockchain-bg-svg" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="blockchain-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(37, 99, 235, 0)" />
              <stop offset="50%" stopColor="rgba(37, 99, 235, 0.45)" />
              <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
            </linearGradient>
            <filter id="blockchain-glow">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Connection lines (blockchain edges) */}
          <line x1="50" y1="100" x2="200" y2="180" stroke="url(#blockchain-line-grad)" strokeWidth="0.5" className="blockchain-line" />
          <line x1="200" y1="180" x2="350" y2="120" stroke="url(#blockchain-line-grad)" strokeWidth="0.5" className="blockchain-line" />
          <line x1="100" y1="320" x2="200" y2="280" stroke="url(#blockchain-line-grad)" strokeWidth="0.5" className="blockchain-line" />
          <line x1="200" y1="280" x2="300" y2="340" stroke="url(#blockchain-line-grad)" strokeWidth="0.5" className="blockchain-line" />
          <line x1="80" y1="500" x2="200" y2="460" stroke="url(#blockchain-line-grad)" strokeWidth="0.5" className="blockchain-line" />
          <line x1="200" y1="460" x2="320" y2="520" stroke="url(#blockchain-line-grad)" strokeWidth="0.5" className="blockchain-line" />
          <line x1="200" y1="180" x2="200" y2="280" stroke="url(#blockchain-line-grad)" strokeWidth="0.4" className="blockchain-line" />
          <line x1="200" y1="280" x2="200" y2="460" stroke="url(#blockchain-line-grad)" strokeWidth="0.4" className="blockchain-line" />
          {/* Nodes (blockchain blocks) */}
          <circle cx="50" cy="100" r="4" fill="rgba(37, 99, 235, 0.5)" filter="url(#blockchain-glow)" className="blockchain-node" />
          <circle cx="200" cy="180" r="5" fill="rgba(37, 99, 235, 0.6)" filter="url(#blockchain-glow)" className="blockchain-node" />
          <circle cx="350" cy="120" r="4" fill="rgba(37, 99, 235, 0.45)" filter="url(#blockchain-glow)" className="blockchain-node" />
          <circle cx="100" cy="320" r="3.5" fill="rgba(37, 99, 235, 0.4)" filter="url(#blockchain-glow)" className="blockchain-node" />
          <circle cx="200" cy="280" r="5" fill="rgba(37, 99, 235, 0.55)" filter="url(#blockchain-glow)" className="blockchain-node" />
          <circle cx="300" cy="340" r="4" fill="rgba(37, 99, 235, 0.45)" filter="url(#blockchain-glow)" className="blockchain-node" />
          <circle cx="80" cy="500" r="3.5" fill="rgba(37, 99, 235, 0.4)" filter="url(#blockchain-glow)" className="blockchain-node" />
          <circle cx="200" cy="460" r="5" fill="rgba(37, 99, 235, 0.5)" filter="url(#blockchain-glow)" className="blockchain-node" />
          <circle cx="320" cy="520" r="4" fill="rgba(37, 99, 235, 0.4)" filter="url(#blockchain-glow)" className="blockchain-node" />
        </svg>
      </div>
      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden xl:flex relative z-10 w-64 shrink-0 bg-[#080a12] border-r border-slate-800/60 flex-col">
        <div className="pt-10 pb-4 px-4 flex items-center gap-2">
          <Image src="/images/scaled_logo.png" alt="SenseiFi" width={32} height={32} className="h-8 w-auto" />
          <span className="font-semibold text-white text-3xl">SenseiFi</span>
        </div>
        <nav className="pt-6 pb-0 px-3 space-y-3 shrink-0">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const isHash = item.href.startsWith("#");
            const isLockedItem = isXpRouteLocked && XP_LOCKED_ROUTES.has(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (isLockedItem) {
                    e.preventDefault();
                    return;
                  }
                  if (!isHash) handleNavClick(e, item.href);
                }}
                className={`flex items-center gap-4 px-4 py-4 text-lg font-medium transition ${
                  active
                    ? "bg-slate-800/90 text-white border border-blue-500/40 shadow-[0_0_20px_rgba(37,99,235,0.18),inset_0_-4px_12px_rgba(67,56,202,0.4)] rounded-lg"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/40 rounded-lg"
                } ${isLockedItem ? "pointer-events-none opacity-45 grayscale cursor-not-allowed" : ""}`}
                aria-disabled={isLockedItem}
              >
                <NavIcon name={item.icon} active={active} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pt-3 pb-3">
          <div className="rounded-2xl border border-slate-800/60 p-5 relative overflow-hidden min-h-[180px] flex flex-col">
            <Image src={needHelpBackground} alt="" fill className="object-cover object-[50%_100%]" aria-hidden />
            <div className="relative z-10 shrink-0 w-10 h-10 rounded-xl bg-[#2c2c2c] flex items-center justify-center">
              <span className="text-[#60a5fa] font-bold text-xl leading-none">?</span>
            </div>
            <div className="relative z-10 flex-1 flex flex-col justify-center mt-3">
              <p className="text-white font-bold text-base">Need help?</p>
              <p className="text-white/80 text-sm mt-0.5">Please check our docs</p>
            </div>
            <button
              type="button"
              className="relative z-10 mt-4 w-full rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-2.5 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90"
            >
              Documentation
            </button>
          </div>
        </div>
      </aside>
      {/* Mobile nav drawer - visible only below lg */}
      <div className={`xl:hidden fixed inset-y-0 left-0 z-50 ${mobileNavView === "settings" ? "w-full" : "w-[280px]"} bg-[#080a12] border-r border-slate-800/60 flex flex-col transform transition-transform duration-150 ease-out will-change-transform ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {mobileNavView === "settings" ? (
          <div className="pt-10 pb-4 flex flex-col flex-1 min-h-0">
            <GuardSettingsSubmenu
              variant="drawer"
              activeSection={activeSettingsSection}
              onSelectSection={handleSettingsSectionSelect}
              onSignOut={() => void disconnectWallet()}
              onBack={() => setMobileNavView("main")}
              onClose={() => setMobileNavOpen(false)}
              showCloseButton
            />
          </div>
        ) : (
          <>
            <div className="pt-10 pb-4 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Image src="/images/scaled_logo.png" alt="SenseiFi" width={32} height={32} className="h-8 w-auto" />
                <span className="font-semibold text-white text-xl">SenseiFi</span>
              </div>
              <button type="button" onClick={() => setMobileNavOpen(false)} className="p-2 text-slate-400 hover:text-white" aria-label="Close menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="px-3 space-y-1 overflow-y-auto flex-1 min-h-0">
              {navItems.map((item) => {
                const active = pathname === item.href;
                const isSettings = item.href === "/guard/settings";
                const isHash = item.href.startsWith("#");
                const isLockedItem = isXpRouteLocked && XP_LOCKED_ROUTES.has(item.href);
                if (isSettings) {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={handleSettingsNavClick}
                      className={`w-full flex items-center gap-4 px-4 py-3 text-base font-medium transition rounded-lg ${active ? "bg-slate-800/90 text-white border border-blue-500/40" : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/40"}`}
                    >
                      <NavIcon name={item.icon} active={active} />
                      {item.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      if (isLockedItem) {
                        e.preventDefault();
                        return;
                      }
                      if (!isHash) handleNavClick(e, item.href);
                    }}
                    className={`flex items-center gap-4 px-4 py-3 text-base font-medium transition rounded-lg ${active ? "bg-slate-800/90 text-white border border-blue-500/40" : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/40"} ${isLockedItem ? "pointer-events-none opacity-45 grayscale cursor-not-allowed" : ""}`}
                    aria-disabled={isLockedItem}
                  >
                    <NavIcon name={item.icon} active={active} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </div>
      <div className={`xl:hidden fixed inset-0 z-40 bg-black/60 transition-opacity duration-150 ${mobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setMobileNavOpen(false)} aria-hidden={!mobileNavOpen} />
      {/* Route change loading bar - instant feedback so one tap feels responsive */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-slate-800/90 overflow-hidden" aria-hidden>
          <div className="h-full w-1/2 bg-[#4066FF] animate-pulse rounded-r" />
        </div>
      )}
      <main className="relative z-10 flex-1 flex flex-col min-w-0 min-h-0">
        {/* Mobile header - visible only below lg */}
        <header className="xl:hidden h-16 shrink-0 flex items-center justify-between px-4 bg-[#0a0a1a]">
          <div className="flex items-center gap-2">
            <Image src="/images/scaled_logo.png" alt="SenseiFi" width={28} height={28} className="h-7 w-auto" />
            <span className="font-semibold text-white text-xl">SenseiFi</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void openXpFlow()} className="flex items-center justify-center h-10 px-3 rounded-xl border-2 border-white/25 bg-[#0f1220] text-sm font-semibold text-[#4066FF] hover:bg-white/10 transition shrink-0" aria-label="Experience points">
              <XpLabel xp={waitlistXp} />
            </button>
            <div className="relative" ref={mobileNotificationRef}>
              <button type="button" onClick={() => setNotificationsOpen((v) => !v)} className="relative flex items-center justify-center w-10 h-10 rounded-xl border-2 border-white/25 bg-[#0f1220] text-slate-400 hover:text-white transition" aria-label="Notifications" aria-expanded={notificationsOpen}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB]" aria-hidden />
              </button>
            </div>
            <button type="button" onClick={() => setMobileNavOpen(true)} className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-white/25 bg-[#0f1220] text-slate-400 hover:text-white transition" aria-label="Menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </header>

        {/* Mobile full-screen notifications panel – when bell is tapped (always mounted to avoid open delay) */}
        <div
          ref={mobileNotificationsPanelRef}
          className={`xl:hidden fixed inset-0 z-[60] flex flex-col bg-[#0a0a1a] transition-opacity duration-150 ${notificationsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          aria-modal="true"
          role="dialog"
          aria-label="Notifications"
          aria-hidden={!notificationsOpen}
        >
          <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-white/10 bg-[#0a0a1a]">
            <div className="flex items-center gap-2">
              <Image src="/images/scaled_logo.png" alt="SenseiFi" width={28} height={28} className="h-7 w-auto" />
              <span className="font-semibold text-white text-xl">SenseiFi</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setNotificationsOpen(false)} className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-white/25 bg-[#0f1220] text-white hover:bg-white/10 transition" aria-label="Close notifications">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button type="button" onClick={() => setMobileNavOpen(true)} className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-white/25 bg-[#0f1220] text-slate-400 hover:text-white transition" aria-label="Menu">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
          {notificationsOpen ? (
            <GuardNotificationsPanel
              variant="mobile"
              open={notificationsOpen}
              walletAddress={address}
              onUnreadCountChange={handleUnreadCountChange}
              onClose={() => setNotificationsOpen(false)}
            />
          ) : null}
        </div>

        {/* Desktop header - hidden on mobile */}
        <header className="hidden xl:flex h-20 shrink-0 border-b border-slate-800/60 items-center px-4 sm:px-6 gap-2 xl:gap-4 bg-[#0f1115] w-full min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="emboss-raised flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#1a1d24]">
              <Image src="/images/icons/dashboard-icon.png" alt="" width={20} height={20} className="w-5 h-5 sm:w-6 sm:h-6 opacity-90" />
            </div>
            <Image src="/images/icons/sign.png" alt="" width={12} height={12} className="hidden sm:block w-3 h-3 opacity-70" />
            <span className="text-white font-semibold text-sm sm:text-base">{title}</span>
          </div>
          <div className="hidden lg:flex flex-1 min-w-0 max-w-md xl:max-w-none">
            <GuardHeaderSearch />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            <button type="button" className="emboss-inset-3d-input flex items-center gap-2 rounded-lg bg-[#1a1d24] px-3 py-3 sm:px-4 sm:py-3.5 text-white text-sm font-medium hover:bg-[#1e2128] transition border border-slate-800/50">
              <Image src="/images/icons/wallet-header.png" alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 opacity-80" />
              <span className="hidden min-[400px]:inline">{formatBalance(totalAssetUsd)}</span>
            </button>
            <button type="button" onClick={() => void openXpFlow()} className="emboss-inset-3d-input flex items-center rounded-lg bg-[#1a1d24] px-3 py-3 sm:px-4 sm:py-3.5 text-sm font-semibold text-[#4066FF] hover:bg-[#1e2128] transition border border-slate-800/50 shrink-0" aria-label="Experience points">
              <XpLabel xp={waitlistXp} iconClassName="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" />
            </button>
            <div className="relative shrink-0" ref={notificationRef}>
              <button type="button" onClick={() => setNotificationsOpen((v) => !v)} className="emboss-raised relative flex items-center justify-center w-10 h-11 sm:w-11 sm:h-12 rounded-lg bg-[#1a1d24] text-slate-400 hover:text-white hover:bg-[#1e2128] transition shrink-0" aria-label="Notifications" aria-expanded={notificationsOpen}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB]" aria-hidden />
              </button>
              {notificationsOpen ? (
                <GuardNotificationsPanel
                  variant="desktop"
                  open={notificationsOpen}
                  walletAddress={address}
                  onUnreadCountChange={handleUnreadCountChange}
                  onClose={() => setNotificationsOpen(false)}
                />
              ) : null}
            </div>
            <button type="button" className="emboss-inset-3d-input flex items-center gap-2 sm:gap-3 rounded-lg bg-[#1a1d24] pl-1.5 pr-2 sm:pl-2 sm:pr-3 py-3 sm:py-3.5 hover:bg-[#1e2128] transition shrink-0 border border-slate-800/50">
              <Image src="/images/icons/avatar-boy.png" alt="" width={36} height={36} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0" />
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-medium text-white truncate">{dashboardUser ? `User ${dashboardUser.user_number}` : "User"}</p>
                <p className="text-xs text-slate-500 truncate max-w-[100px]">{dashboardUser?.display_name ?? "—"}</p>
              </div>
              <svg className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </header>
        <div className={`flex-1 min-h-0 overflow-auto p-4 xl:p-6 ${["/guard", "/guard/wallet-security", "/guard/activity-monitor", "/guard/threat-intelligence", "/guard/contract-scanner", "/guard/settings"].includes(pathname) ? "hide-scrollbar" : ""}`}>{children}</div>
      </main>
      <ClaimXpModal open={xpModalOpen} onClose={() => setXpModalOpen(false)} />
      <ClaimXpSuccessModal
        open={xpSuccessOpen}
        onClose={() => setXpSuccessOpen(false)}
        data={xpSuccessData}
        onBuyXp={openBuyXpFlow}
      />
      <GuardChatbotFab />
    </div>
    </GuardSearchProvider>
    </ConnectNetworksModalProvider>
    </RescanModalProvider>
  );
}
