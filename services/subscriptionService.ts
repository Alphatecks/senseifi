const SUBSCRIPTIONS_API_BASE_URL = (
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://senseifi-backend.onrender.com/api"
).replace(/\/$/, "");

export type SubscriptionPlanKey = "pro" | "pro_plus" | "premium";
export type BillingCycle = "monthly" | "annual";

export interface SubscriptionCheckoutPayload {
  user_id: string;
  plan: SubscriptionPlanKey;
  billing_cycle: BillingCycle;
}

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

function extractCheckoutUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const direct = payload as Record<string, unknown>;
  const data = (direct.data ?? null) as Record<string, unknown> | null;
  const nestedSession = (data?.session ?? null) as Record<string, unknown> | null;
  const nestedCheckoutSession = (data?.checkout_session ?? null) as Record<string, unknown> | null;

  const candidates = [
    direct.checkout_url,
    direct.checkoutUrl,
    direct.url,
    direct.session_url,
    direct.sessionUrl,
    data?.checkout_url,
    data?.checkoutUrl,
    data?.url,
    data?.session_url,
    data?.sessionUrl,
    nestedSession?.url,
    nestedCheckoutSession?.url,
  ];

  const found = candidates.find((item) => typeof item === "string" && item.length > 0);
  return typeof found === "string" ? found : null;
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlansResponse | null> {
  const { ok, data } = await subscriptionFetch<SubscriptionPlansResponse>("/subscriptions/plans");
  if (!ok || !data) return null;
  return data;
}

function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as Record<string, unknown>;
  const data = (body.data ?? null) as Record<string, unknown> | null;
  const candidates = [body.message, body.error, data?.message, data?.error];
  const message = candidates.find((item) => typeof item === "string" && item.trim().length > 0);
  return typeof message === "string" ? message : null;
}

export async function createSubscriptionCheckout(
  payload: SubscriptionCheckoutPayload
): Promise<{ checkoutUrl: string } | { error: string }> {
  const { ok, data } = await subscriptionFetch<unknown>("/subscriptions/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!ok) {
    const backendMessage = extractErrorMessage(data);
    return {
      error: backendMessage ?? "Checkout request failed on backend.",
    };
  }
  if (!data) return { error: "Empty checkout response from backend." };

  const checkoutUrl = extractCheckoutUrl(data);
  if (!checkoutUrl) {
    return { error: "Checkout URL not found in backend response." };
  }

  return { checkoutUrl };
}

export async function createBillingPortal(userId: string): Promise<{ portalUrl: string } | null> {
  const { ok, data } = await subscriptionFetch<unknown>("/subscriptions/portal", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
  if (!ok || !data || typeof data !== "object") return null;

  const body = data as Record<string, unknown>;
  const nested = (body.data ?? null) as Record<string, unknown> | null;
  const urlCandidate = body.url ?? body.portal_url ?? nested?.url ?? nested?.portal_url;

  return typeof urlCandidate === "string" && urlCandidate
    ? { portalUrl: urlCandidate }
    : null;
}

