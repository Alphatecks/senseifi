const API_BASE_URL = process.env.NEXT_PUBLIC_WALLET_API_URL || "https://senseifi-backend.onrender.com/api";

export type NotificationIcon = "community" | "security" | "warning";
export type NotificationCategory = "community" | "security" | "transaction" | "token_risk" | "account";

export interface NotificationAction {
  label: string;
  type: string;
  url: string;
}

export interface AppNotification {
  id: string;
  source_type: string;
  source_id: string;
  category: NotificationCategory;
  icon: NotificationIcon;
  title: string;
  description: string;
  read: boolean;
  created_at: string;
  action?: NotificationAction | null;
}

export interface NotificationsListResponse {
  success: boolean;
  unread_count: number;
  data: AppNotification[];
}

async function notificationFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ ok: boolean; data: T | null }> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options.headers as Record<string, string>) },
      ...options,
    });
    const data = (await res.json().catch(() => null)) as T | null;
    return { ok: res.ok, data };
  } catch (error) {
    console.error("[Notifications API]", error);
    return { ok: false, data: null };
  }
}

export async function getNotifications(walletAddress: string, limit = 50): Promise<NotificationsListResponse | null> {
  if (!walletAddress?.trim()) return null;
  const { ok, data } = await notificationFetch<NotificationsListResponse>(
    `/notifications?wallet_address=${encodeURIComponent(walletAddress.trim())}&limit=${limit}`
  );
  if (!ok || !data?.success) return null;
  return data;
}

export async function markNotificationRead(
  walletAddress: string,
  sourceType: string,
  sourceId: string
): Promise<boolean> {
  if (!walletAddress?.trim() || !sourceType || !sourceId) return false;
  const { ok, data } = await notificationFetch<{ success: boolean }>("/notifications/read", {
    method: "POST",
    body: JSON.stringify({
      wallet_address: walletAddress.trim(),
      source_type: sourceType,
      source_id: sourceId,
    }),
  });
  return ok && !!data?.success;
}

export async function markAllNotificationsRead(walletAddress: string): Promise<boolean> {
  if (!walletAddress?.trim()) return false;
  const { ok, data } = await notificationFetch<{ success: boolean }>("/notifications/read-all", {
    method: "POST",
    body: JSON.stringify({ wallet_address: walletAddress.trim() }),
  });
  return ok && !!data?.success;
}

export function formatNotificationTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const diffMs = Date.now() - d.getTime();
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } catch {
    return "—";
  }
}

export function resolveNotificationActionHref(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  const path = url.trim();
  if (path.startsWith("/guard")) return path;
  if (path.startsWith("/dashboard/")) {
    if (path.includes("approvals") || path.includes("wallet")) return "/guard/wallet-security";
    if (path.includes("contract") || path.includes("scan")) return "/guard/contract-scanner";
    if (path.includes("threat")) return "/guard/threat-intelligence";
    if (path.includes("activity")) return "/guard/activity-monitor";
    return "/guard";
  }
  return path.startsWith("/") ? path : null;
}
