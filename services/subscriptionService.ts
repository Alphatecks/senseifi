const SUBSCRIPTIONS_API_BASE_URL = (
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://senseifi-backend.onrender.com/api"
).replace(/\/$/, "");

export type SubscriptionPlanKey = "pro" | "pro_plus" | "premium";

export interface SubscriptionPlansResponse {
  success?: boolean;
  data?: unknown;
  plans?: unknown;
}

async function subscriptionFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const res = await fetch(`${SUBSCRIPTIONS_API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
    ...options,
  });

  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlansResponse | null> {
  const { ok, data } = await subscriptionFetch<SubscriptionPlansResponse>("/subscriptions/plans");
  if (!ok || !data) return null;
  return data;
}

export interface BillingHistoryFilters {
  user_id: string;
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}

export interface BillingHistoryItem {
  id?: string;
  payment_id?: string;
  plan_name?: string;
  amount?: string | number;
  currency?: string;
  purchase_date?: string;
  end_date?: string;
  status?: string;
  invoice_url?: string;
  tx_hash?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface BillingHistoryPagination {
  page: number;
  per_page: number;
  total?: number;
}

type BillingHistoryResponse =
  | BillingHistoryItem[]
  | {
      success?: boolean;
      data?: BillingHistoryItem[] | { items?: BillingHistoryItem[]; rows?: BillingHistoryItem[]; results?: BillingHistoryItem[] };
      items?: BillingHistoryItem[];
      rows?: BillingHistoryItem[];
      results?: BillingHistoryItem[];
      pagination?: Partial<BillingHistoryPagination>;
      meta?: Partial<BillingHistoryPagination>;
    };

function pickBillingHistoryItems(payload: BillingHistoryResponse | null): BillingHistoryItem[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  const wrappedData = payload.data;
  if (Array.isArray(wrappedData)) return wrappedData;
  if (wrappedData && typeof wrappedData === "object") {
    if (Array.isArray(wrappedData.items)) return wrappedData.items;
    if (Array.isArray(wrappedData.rows)) return wrappedData.rows;
    if (Array.isArray(wrappedData.results)) return wrappedData.results;
  }
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

function pickBillingHistoryPagination(
  payload: BillingHistoryResponse | null,
  fallback: BillingHistoryPagination
): BillingHistoryPagination {
  if (!payload || Array.isArray(payload)) return fallback;
  const source = payload.pagination || payload.meta || {};
  const page = Number(source.page);
  const perPage = Number(source.per_page);
  const total = Number(source.total);
  return {
    page: Number.isFinite(page) && page > 0 ? page : fallback.page,
    per_page: Number.isFinite(perPage) && perPage > 0 ? perPage : fallback.per_page,
    total: Number.isFinite(total) && total >= 0 ? total : fallback.total,
  };
}

export async function getBillingHistory(
  filters: BillingHistoryFilters
): Promise<{ items: BillingHistoryItem[]; pagination: BillingHistoryPagination } | null> {
  if (!filters.user_id?.trim()) return null;
  const page = Math.max(1, Number(filters.page) || 1);
  const perPage = Math.max(1, Number(filters.per_page) || 10);
  const params = new URLSearchParams({
    user_id: filters.user_id.trim(),
    page: String(page),
    per_page: String(perPage),
  });
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status?.trim()) params.set("status", filters.status.trim());

  const { ok, data } = await subscriptionFetch<BillingHistoryResponse>(
    `/payments/billing-history?${params.toString()}`
  );
  if (!ok || !data) return null;

  const items = pickBillingHistoryItems(data);
  const pagination = pickBillingHistoryPagination(data, { page, per_page: perPage });
  return { items, pagination };
}

