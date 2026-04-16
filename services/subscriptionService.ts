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

