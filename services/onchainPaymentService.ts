import { getOnchainBillingEnvironment } from "@/config/onchainBilling";

const ONCHAIN_PAYMENTS_API_BASE_URL = (
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_API_URL ||
  process.env.NEXT_PUBLIC_WALLET_API_URL ||
  "https://senseifi-backend.onrender.com/api"
).replace(/\/$/, "");

export type OnchainPlanKey = "pro" | "pro_plus" | "premium";
export type OnchainBillingCycle = "monthly" | "annual";

export interface OnchainSubscribePayload {
  user_id: string;
  plan: OnchainPlanKey;
  billing_cycle: OnchainBillingCycle;
  payer_address: string;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function extractErrorMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const data = isRecord(payload.data) ? payload.data : null;
  const candidates = [payload.message, payload.error, data?.message, data?.error];
  const message = candidates.find((item) => typeof item === "string" && item.trim().length > 0);
  return typeof message === "string" ? message : null;
}

async function onchainPaymentsFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const res = await fetch(`${ONCHAIN_PAYMENTS_API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    },
    ...options,
  });
  const raw = await res.text();
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {
      ok: false,
      status: res.status,
      data: {
        message:
          res.status === 404
            ? `Billing API not found at ${ONCHAIN_PAYMENTS_API_BASE_URL}${endpoint}. Check NEXT_PUBLIC_WALLET_API_URL.`
            : "Billing API returned an invalid response.",
      } as T,
    };
  }
  const data = raw ? (JSON.parse(raw) as T) : null;
  return { ok: res.ok, status: res.status, data };
}

export async function onchainSubscribe(
  payload: OnchainSubscribePayload
): Promise<{ success: true; data: unknown } | { success: false; error: string }> {
  const billingEnvironment = getOnchainBillingEnvironment();
  const { ok, data } = await onchainPaymentsFetch<unknown>("/payments/onchain-subscribe", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      billing_environment: billingEnvironment === "test" ? "testnet" : "production",
    }),
  });
  if (!ok) {
    return { success: false, error: extractErrorMessage(data) ?? "Failed to create onchain subscription." };
  }
  return { success: true, data };
}
