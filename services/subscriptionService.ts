const SUBSCRIPTIONS_API_BASE_URL = (
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_API_URL ||
  process.env.NEXT_PUBLIC_WALLET_API_URL ||
  "https://senseifi-backend.onrender.com/api"
).replace(/\/$/, "");

export type SubscriptionPlanKey = "pro" | "pro_plus" | "premium";
export type BillingPlanKey = "basic" | "pro" | "premium";
export type BillingCycle = "monthly" | "annual";

export interface SubscriptionPlansResponse {
  success?: boolean;
  data?: unknown;
  plans?: unknown;
}

export type PlanPricing = Record<SubscriptionPlanKey, { monthly: number; annual: number }>;

const DEFAULT_PLAN_PRICING: PlanPricing = {
  pro: { monthly: 30, annual: 300 },
  pro_plus: { monthly: 50, annual: 500 },
  premium: { monthly: 200, annual: 2000 },
};

const BILLING_PLAN_KEY_BY_FRONTEND: Record<SubscriptionPlanKey, BillingPlanKey> = {
  pro: "basic",
  pro_plus: "pro",
  premium: "premium",
};

export function toBillingPlanKey(plan: SubscriptionPlanKey): BillingPlanKey {
  return BILLING_PLAN_KEY_BY_FRONTEND[plan];
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function toAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return null;
}

function readCycleAmount(value: unknown): number | null {
  if (typeof value === "number" || typeof value === "string") return toAmount(value);
  if (!isRecord(value)) return null;
  return (
    toAmount(value.amount) ??
    toAmount(value.price) ??
    toAmount(value.unit_amount) ??
    toAmount(value.value)
  );
}

export function parsePlanPricingPayload(payload: unknown): PlanPricing | null {
  if (!isRecord(payload)) return null;
  const source = (isRecord(payload.data) ? payload.data : payload.plans) as unknown;
  const plans = isRecord(source) ? source : payload;

  const nextPricing: PlanPricing = { ...DEFAULT_PLAN_PRICING };
  const planKeys: SubscriptionPlanKey[] = ["pro", "pro_plus", "premium"];
  let foundAtLeastOne = false;

  planKeys.forEach((planKey) => {
    const apiKey = BILLING_PLAN_KEY_BY_FRONTEND[planKey];
    const rawPlan = plans[apiKey] ?? plans[planKey];
    if (!isRecord(rawPlan)) return;

    const monthly = readCycleAmount(rawPlan.monthly);
    const annual = readCycleAmount(rawPlan.annual);
    if (monthly && annual) {
      nextPricing[planKey] = { monthly, annual };
      foundAtLeastOne = true;
    }
  });

  return foundAtLeastOne ? nextPricing : null;
}

function extractErrorMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const data = isRecord(payload.data) ? payload.data : null;
  const candidates = [payload.message, payload.error, data?.message, data?.error];
  const message = candidates.find((item) => typeof item === "string" && item.trim().length > 0);
  return typeof message === "string" ? message : null;
}

function readUrlFromPayload(payload: unknown, keys: string[]): string | null {
  const roots: unknown[] = [payload];
  if (isRecord(payload) && isRecord(payload.data)) roots.push(payload.data);

  for (const root of roots) {
    if (!isRecord(root)) continue;
    for (const key of keys) {
      const value = root[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return null;
}

export interface SubscriptionCheckoutPayload {
  user_id: string;
  plan: BillingPlanKey;
  billing_cycle: BillingCycle;
  success_url?: string;
  cancel_url?: string;
}

export interface SubscriptionStatus {
  plan?: string;
  status?: string;
  billing_cycle?: string;
  current_period_end?: string;
  [key: string]: unknown;
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

export async function getSubscriptionStatus(
  userId: string
): Promise<{ success: true; data: SubscriptionStatus } | { success: false; error: string }> {
  const trimmedUserId = userId.trim();
  if (!trimmedUserId) {
    return { success: false, error: "Missing user id." };
  }

  const params = new URLSearchParams({ user_id: trimmedUserId });
  const { ok, data } = await subscriptionFetch<unknown>(`/subscriptions/status?${params.toString()}`);
  if (!ok) {
    return { success: false, error: extractErrorMessage(data) ?? "Failed to load subscription status." };
  }

  const status = (isRecord(data) && isRecord(data.data) ? data.data : data) as SubscriptionStatus;
  return { success: true, data: status ?? {} };
}

export async function startSubscriptionCheckout(
  payload: SubscriptionCheckoutPayload
): Promise<{ success: true; checkoutUrl: string } | { success: false; error: string }> {
  const { ok, data } = await subscriptionFetch<unknown>("/subscriptions/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!ok) {
    return { success: false, error: extractErrorMessage(data) ?? "Failed to start checkout." };
  }

  const checkoutUrl = readUrlFromPayload(data, ["checkout_url", "checkoutUrl", "url"]);
  if (!checkoutUrl) {
    return { success: false, error: "Checkout URL was not returned by the billing API." };
  }
  return { success: true, checkoutUrl };
}

export async function openSubscriptionPortal(
  userId: string
): Promise<{ success: true; portalUrl: string } | { success: false; error: string }> {
  const trimmedUserId = userId.trim();
  if (!trimmedUserId) {
    return { success: false, error: "Missing user id." };
  }

  const { ok, data } = await subscriptionFetch<unknown>("/subscriptions/portal", {
    method: "POST",
    body: JSON.stringify({ user_id: trimmedUserId }),
  });
  if (!ok) {
    return { success: false, error: extractErrorMessage(data) ?? "Failed to open billing portal." };
  }

  const portalUrl = readUrlFromPayload(data, ["portal_url", "portalUrl", "url"]);
  if (!portalUrl) {
    return { success: false, error: "Portal URL was not returned by the billing API." };
  }
  return { success: true, portalUrl };
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

