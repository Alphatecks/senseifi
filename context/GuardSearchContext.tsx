"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

type GuardSearchContextValue = {
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
};

const GuardSearchContext = createContext<GuardSearchContextValue | null>(null);

export function GuardSearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQueryState] = useState("");
  const setQuery = useCallback((value: string) => setQueryState(value), []);
  const clearQuery = useCallback(() => setQueryState(""), []);

  return (
    <GuardSearchContext.Provider value={{ query, setQuery, clearQuery }}>
      {children}
    </GuardSearchContext.Provider>
  );
}

export function useGuardSearch() {
  const ctx = useContext(GuardSearchContext);
  return ctx ?? { query: "", setQuery: () => {}, clearQuery: () => {} };
}

export const GUARD_SEARCH_DESTINATIONS = [
  { label: "Dashboard", href: "/guard", keywords: ["dashboard", "home", "overview", "summary", "assets", "activity", "alerts"] },
  {
    label: "Wallet Security",
    href: "/guard/wallet-security",
    keywords: ["wallet", "security", "approval", "approvals", "protection", "threat", "scan", "network"],
  },
  {
    label: "Activity Monitor",
    href: "/guard/activity-monitor",
    keywords: ["activity", "monitor", "feed", "transaction", "transactions", "wallet", "dapp", "dapps"],
  },
  {
    label: "Threat Intelligence",
    href: "/guard/threat-intelligence",
    keywords: ["threat", "intelligence", "scam", "domain", "phishing", "malicious", "signal"],
  },
  {
    label: "Contract Scanner",
    href: "/guard/contract-scanner",
    keywords: ["contract", "scanner", "scan", "audit", "address", "0x", "risk"],
  },
  {
    label: "Chrome extension",
    href: "/guard/chrome-extension",
    keywords: ["chrome", "extension", "browser", "trade", "insight", "senseiguard"],
  },
  {
    label: "Settings",
    href: "/guard/settings",
    keywords: ["settings", "billing", "preferences", "subscription", "profile", "security", "support", "terms", "privacy"],
  },
] as const;

export type SettingsSearchSection = "profile" | "security" | "subscription" | "support" | "terms";

export const SETTINGS_SEARCH_SECTIONS: Array<{ id: SettingsSearchSection; keywords: string[] }> = [
  { id: "profile", keywords: ["profile", "username", "avatar", "user", "wallet", "dapp"] },
  { id: "security", keywords: ["security", "extension", "protection", "block", "approval", "threat", "guard"] },
  { id: "subscription", keywords: ["subscription", "billing", "plan", "premium", "pro", "basic", "usdc", "payment"] },
  { id: "support", keywords: ["support", "feedback", "help", "contact"] },
  { id: "terms", keywords: ["terms", "privacy", "policy", "legal"] },
];

export function matchesGuardSearch(query: string, ...fields: (string | number | null | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = fields
    .filter((field) => field != null && field !== "")
    .map(String)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function filterGuardSearchList<T>(
  items: T[] | null | undefined,
  query: string,
  getFields: (item: T) => (string | number | null | undefined)[]
): T[] {
  if (!items?.length) return [];
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => matchesGuardSearch(query, ...getFields(item)));
}

export function filterGuardSearchDestinations(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return GUARD_SEARCH_DESTINATIONS.filter((item) => {
    const label = item.label.toLowerCase();
    const keywordBlob = item.keywords.join(" ").toLowerCase();
    const haystack = `${label} ${keywordBlob}`;
    return (
      label.includes(q) ||
      haystack.includes(q) ||
      item.keywords.some((keyword) => keyword.includes(q) || q.includes(keyword))
    );
  });
}

export function resolveSettingsSection(query: string): SettingsSearchSection | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const match = SETTINGS_SEARCH_SECTIONS.find(({ keywords }) =>
    keywords.some((keyword) => keyword.includes(q) || q.includes(keyword))
  );

  return match?.id ?? null;
}
