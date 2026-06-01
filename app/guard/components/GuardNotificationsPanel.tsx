"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import senseiCardLogo from "@/assets/icons/Mono.png";
import {
  formatNotificationTime,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  resolveNotificationActionHref,
  type AppNotification,
} from "@/services/notificationService";

const NOTIFICATION_PREVIEW_COUNT = 5;

type GuardNotificationsPanelProps = {
  variant: "mobile" | "desktop";
  open: boolean;
  walletAddress: string | null;
  onUnreadCountChange: (count: number) => void;
  onClose?: () => void;
};

/** Same shape as the original hardcoded NOTIFICATIONS array in layout.tsx */
type ViewNotification = {
  id: string;
  source_type: string;
  source_id: string;
  unread: boolean;
  icon: "logo" | "dot";
  title: string;
  desc: string;
  time: string;
  button: string | null;
  titleIcon?: "lock" | "warning" | "lightning";
};

function stripNotificationEmojis(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function mapNotificationToView(n: AppNotification): ViewNotification {
  const icon = n.icon === "community" ? "logo" : "dot";
  let titleIcon: ViewNotification["titleIcon"];
  if (n.icon === "security" || n.category === "account") titleIcon = "lock";
  else if (n.icon === "warning" || n.category === "token_risk") titleIcon = "warning";
  else if (n.category === "security" && n.action?.type?.includes("contract")) titleIcon = "lightning";

  return {
    id: n.id,
    source_type: n.source_type,
    source_id: n.source_id,
    unread: !n.read,
    icon,
    title: stripNotificationEmojis(n.title),
    desc: stripNotificationEmojis(n.description ?? ""),
    time: formatNotificationTime(n.created_at),
    button: n.action?.label ?? null,
    titleIcon,
  };
}

export default function GuardNotificationsPanel({
  variant,
  open,
  walletAddress,
  onUnreadCountChange,
  onClose,
}: GuardNotificationsPanelProps) {
  const router = useRouter();
  const [items, setItems] = useState<ViewNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [rawItems, setRawItems] = useState<AppNotification[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  const loadNotifications = useCallback(async () => {
    if (!open || !walletAddress?.trim()) return;
    const res = await getNotifications(walletAddress);
    if (!res) return;
    const mapped = (res.data ?? []).map(mapNotificationToView);
    setRawItems(res.data ?? []);
    setItems(mapped);
    const count = res.unread_count ?? 0;
    setUnreadCount(count);
    onUnreadCountChange(count);
  }, [open, walletAddress, onUnreadCountChange]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    if (!walletAddress?.trim()) return;
    const ok = await markAllNotificationsRead(walletAddress);
    if (ok) {
      setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
      setRawItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      onUnreadCountChange(0);
    }
  };

  const handleAction = async (view: ViewNotification) => {
    if (!walletAddress?.trim()) return;
    const raw = rawItems.find((r) => r.id === view.id);
    if (view.unread && raw) {
      const ok = await markNotificationRead(walletAddress, raw.source_type, raw.source_id);
      if (ok) {
        setItems((prev) => prev.map((n) => (n.id === view.id ? { ...n, unread: false } : n)));
        setRawItems((prev) => prev.map((n) => (n.id === view.id ? { ...n, read: true } : n)));
        setUnreadCount((c) => {
          const next = Math.max(0, c - 1);
          onUnreadCountChange(next);
          return next;
        });
      }
    }
    const href = resolveNotificationActionHref(raw?.action?.url);
    if (href) {
      onClose?.();
      router.push(href);
    }
  };

  const badgeCount = unreadCount > 99 ? "99+" : String(unreadCount);
  const hasMore = items.length > NOTIFICATION_PREVIEW_COUNT;
  const visibleItems = expanded ? items : items.slice(0, NOTIFICATION_PREVIEW_COUNT);

  const seeMoreButton =
    hasMore && !expanded ? (
      <div className={variant === "mobile" ? "pt-2" : "p-4 border-t border-slate-700/60 shrink-0"}>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={`font-semibold transition hover:underline ${
            variant === "mobile"
              ? "text-sm text-[#4066FF] hover:text-[#5b7cff]"
              : "w-full text-sm text-[#60a5fa] hover:text-[#93c5fd]"
          }`}
        >
          See more
        </button>
      </div>
    ) : null;

  if (variant === "mobile") {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[#0026FF] text-white text-xs font-semibold">
                {badgeCount}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => void handleMarkAllRead()} className="text-[#0026FF] text-sm font-medium">
                Mark all as read
              </button>
              <button type="button" className="p-1 text-white/70 hover:text-white" aria-label="More options">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </div>
          </div>
          <ul className="space-y-4">
            {visibleItems.map((n) => (
              <li key={n.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[#0026FF]/20 flex items-center justify-center overflow-hidden">
                    {n.icon === "logo" ? (
                      <Image src={senseiCardLogo} alt="" width={24} height={24} className="object-contain" />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-white/20" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm leading-snug">{n.title}</p>
                    {n.desc ? <p className="text-white/70 text-xs mt-1 leading-relaxed">{n.desc}</p> : null}
                    <p className="text-white/50 text-xs mt-2">{n.time}</p>
                    {n.button ? (
                      <button
                        type="button"
                        onClick={() => void handleAction(n)}
                        className="mt-3 px-4 py-2 rounded-lg bg-[#0026FF] text-white text-sm font-medium hover:opacity-90 transition"
                      >
                        {n.button}
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {seeMoreButton}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-[min(380px,calc(100vw-2rem))] max-h-[85vh] flex flex-col rounded-xl bg-[#1a1d24] border border-slate-700/60 shadow-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold text-base">Notifications</h3>
          <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[#2563EB] text-white text-xs font-semibold">
            {badgeCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void handleMarkAllRead()} className="text-[#60a5fa] hover:text-[#93c5fd] text-sm font-medium transition">
            Mark all as read
          </button>
          <button type="button" className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition" aria-label="More options">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="overflow-y-auto flex-1 min-h-0">
        {visibleItems.map((n) => (
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
                  {n.titleIcon === "lock" && (
                    <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2a4 4 0 00-4 4v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zm0 2a2 2 0 012 2v2h-4V6a2 2 0 012-2z" clipRule="evenodd" />
                    </svg>
                  )}
                  {n.titleIcon === "warning" && (
                    <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" />
                    </svg>
                  )}
                  {n.titleIcon === "lightning" && (
                    <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M13 3v8h5l-6 10v-8H6l7-10z" clipRule="evenodd" />
                    </svg>
                  )}
                  {n.title}
                </p>
                <p className="text-slate-300 text-sm mt-1 leading-snug">{n.desc}</p>
                {n.button ? (
                  <button
                    type="button"
                    onClick={() => void handleAction(n)}
                    className="mt-3 rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium px-4 py-2 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)]"
                  >
                    {n.button}
                  </button>
                ) : null}
                <p className="text-slate-500 text-xs mt-2">{n.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {seeMoreButton}
    </div>
  );
}
