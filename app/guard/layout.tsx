"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import chromeIcon from "@/assets/icons/chrome.png";
import needHelpBackground from "@/assets/icons/Background.png";
import senseiCardLogo from "@/assets/icons/Mono.png";

const navItems = [
  { label: "Dashboard", href: "/guard", icon: "grid" },
  { label: "Wallet Security", href: "/guard/wallet-security", icon: "key" },
  { label: "Activity Monitor", href: "#", icon: "chart" },
  { label: "Threat Intelligence", href: "#", icon: "shield-check" },
  { label: "Contract Scanner", href: "#", icon: "document" },
  { label: "SenseiCard", href: "#", icon: "card" },
  { label: "Chrome extension", href: "#", icon: "ext" },
  { label: "Settings", href: "#", icon: "settings" },
];

const NOTIFICATIONS = [
  { id: "1", type: "charity", unread: false, icon: "logo", title: "We've just reached out 30k goal raised for charity!", desc: "We're so proud of the team!", time: "8 min ago", button: null },
  { id: "2", type: "suspicious", unread: true, icon: "dot", title: "Suspicious Transaction Detected", desc: "A transfer of 0.75 ETH to an unknown wallet was flagged.", time: "17 min ago", button: "Review Transaction" },
  { id: "3", type: "security", unread: true, icon: "dot", title: "Strengthen Your Wallet Security", desc: "Enable 2FA on your Ethereum wallet.", time: "45 min ago", button: null, titleIcon: "lock" },
  { id: "4", type: "token", unread: true, icon: "dot", title: "Token Risk Alert", desc: "$XYZ token has been flagged.", time: "1 day ago", button: null, titleIcon: "warning" },
  { id: "5", type: "scam", unread: true, icon: "dot", title: "Potential Scam Contract Detected", desc: "Exercise caution before further interaction.", time: "2 day ago", button: "Review Analysis", titleIcon: "lightning" },
];

function NavIcon({ name, active }: { name: string; active?: boolean }) {
  const cls = "w-7 h-7 shrink-0";
  const iconCls = active ? "text-[#2563EB]" : "text-slate-400";
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
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    );
  if (name === "chart")
    return (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
  if (name === "shield-check")
    return (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  if (name === "document")
    return (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  if (name === "card")
    return (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  return <span className={cls} />;
}

export default function GuardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  const title = pathname === "/guard/wallet-security" ? "Wallet Security" : "Dashboard";

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a1a] text-white relative">
      <div className="dashboard-hack-bg fixed inset-0 pointer-events-none z-0" aria-hidden />
      <aside className="relative z-10 w-64 shrink-0 bg-[#080a12] border-r border-slate-800/60 flex flex-col">
        <div className="pt-10 pb-4 px-4 flex items-center gap-2">
          <Image src="/images/scaled_logo.png" alt="SenseiFi" width={32} height={32} className="h-8 w-auto" />
          <span className="font-semibold text-white text-3xl">SenseiFi</span>
        </div>
        <nav className="pt-6 pb-0 px-3 space-y-3 shrink-0">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-4 text-lg font-medium transition ${
                  active
                    ? "bg-slate-800/90 text-white border border-blue-500/40 shadow-[0_0_20px_rgba(37,99,235,0.18),inset_0_-4px_12px_rgba(67,56,202,0.4)] rounded-lg"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/40 rounded-lg"
                }`}
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
      <main className="relative z-10 flex-1 flex flex-col min-w-0 min-h-0">
        <header className="h-20 shrink-0 border-b border-slate-800/60 flex items-center px-4 sm:px-6 gap-4 bg-[#0f1115]">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="emboss-raised flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#1a1d24]">
              <Image src="/images/icons/dashboard-icon.png" alt="" width={20} height={20} className="w-5 h-5 sm:w-6 sm:h-6 opacity-90" />
            </div>
            <Image src="/images/icons/sign.png" alt="" width={12} height={12} className="hidden sm:block w-3 h-3 opacity-70" />
            <span className="text-white font-semibold text-sm sm:text-base">{title}</span>
          </div>
          <div className="hidden md:flex flex-1 min-w-0 mx-4" style={{ minWidth: "320px" }}>
            <div className="emboss-inset-3d-input w-full flex items-center rounded-lg bg-[#1a1d24] overflow-hidden min-w-0 border border-slate-800/50">
              <input
                type="search"
                placeholder="Search"
                className="flex-1 min-w-0 w-0 bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none border-none"
                aria-label="Search"
              />
              <button type="button" className="emboss-raised flex items-center justify-center w-11 h-12 rounded-r-lg bg-[#23262e] text-slate-400 hover:text-white transition shrink-0" aria-label="Search">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button type="button" className="emboss-inset-3d-input flex items-center gap-2 rounded-lg bg-[#1a1d24] px-3 py-3 sm:px-4 sm:py-3.5 text-white text-sm font-medium hover:bg-[#1e2128] transition border border-slate-800/50">
              <Image src="/images/icons/wallet-header.png" alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 opacity-80" />
              <span className="hidden min-[400px]:inline">$450,000.43</span>
            </button>
            <button type="button" className="emboss-raised flex items-center justify-center w-10 h-11 sm:w-11 sm:h-12 rounded-lg bg-[#1a1d24] hover:bg-[#1e2128] transition shrink-0" aria-label="Network">
              <Image src="/images/icons/wifi-icon.png" alt="" width={22} height={22} className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="relative shrink-0" ref={notificationRef}>
              <button type="button" onClick={() => setNotificationsOpen((v) => !v)} className="emboss-raised relative flex items-center justify-center w-10 h-11 sm:w-11 sm:h-12 rounded-lg bg-[#1a1d24] text-slate-400 hover:text-white hover:bg-[#1e2128] transition shrink-0" aria-label="Notifications" aria-expanded={notificationsOpen}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB]" aria-hidden />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-[380px] max-h-[85vh] flex flex-col rounded-xl bg-[#1a1d24] border border-slate-700/60 shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-700/60 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold text-base">Notifications</h3>
                      <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[#2563EB] text-white text-xs font-semibold">2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="text-[#60a5fa] hover:text-[#93c5fd] text-sm font-medium transition">Mark all as read</button>
                      <button type="button" className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition" aria-label="More options"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg></button>
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1 min-h-0">
                    {NOTIFICATIONS.map((n) => (
                      <div key={n.id} className="p-4 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-800/30 transition">
                        <div className="flex gap-3">
                          <div className="shrink-0 pt-0.5">
                            {n.icon === "logo" ? (
                              <div className="w-9 h-9 rounded-full bg-[#2563EB]/80 flex items-center justify-center overflow-hidden p-1.5">
                                <Image src={senseiCardLogo} alt="SenseiFi" width={28} height={28} className="w-6 h-6 object-contain object-center mt-0.5" />
                              </div>
                            ) : (
                              <span className={`block w-2.5 h-2.5 rounded-full ${n.unread ? "bg-white" : "bg-transparent"}`} aria-hidden />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm leading-tight flex items-center gap-1.5">
                              {n.titleIcon === "lock" && <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2a4 4 0 00-4 4v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zm0 2a2 2 0 012 2v2h-4V6a2 2 0 012-2z" clipRule="evenodd" /></svg>}
                              {n.titleIcon === "warning" && <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" /></svg>}
                              {n.titleIcon === "lightning" && <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M13 3v8h5l-6 10v-8H6l7-10z" clipRule="evenodd" /></svg>}
                              {n.title}
                            </p>
                            <p className="text-slate-300 text-sm mt-1 leading-snug">{n.desc}</p>
                            {n.button && (
                              <button type="button" className="mt-3 rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium px-4 py-2 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)]">{n.button}</button>
                            )}
                            <p className="text-slate-500 text-xs mt-2">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button type="button" className="emboss-inset-3d-input flex items-center gap-2 sm:gap-3 rounded-lg bg-[#1a1d24] pl-1.5 pr-2 sm:pl-2 sm:pr-3 py-3 sm:py-3.5 hover:bg-[#1e2128] transition shrink-0 border border-slate-800/50">
              <Image src="/images/icons/avatar-boy.png" alt="" width={36} height={36} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0" />
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-medium text-white truncate">User 2314</p>
                <p className="text-xs text-slate-500 truncate max-w-[100px]">fetrtwgebejhssnskey</p>
              </div>
              <svg className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </header>
        <div className="flex-1 min-h-0 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
