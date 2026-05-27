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
  { label: "Dashboard", href: "/guard", keywords: ["dashboard", "home", "overview", "summary"] },
  { label: "Wallet Security", href: "/guard/wallet-security", keywords: ["wallet", "security", "approval", "approvals", "protection"] },
  { label: "Activity Monitor", href: "/guard/activity-monitor", keywords: ["activity", "monitor", "feed", "transaction", "transactions"] },
  { label: "Threat Intelligence", href: "/guard/threat-intelligence", keywords: ["threat", "intelligence", "scam", "domain", "phishing"] },
  { label: "Contract Scanner", href: "/guard/contract-scanner", keywords: ["contract", "scanner", "scan", "audit"] },
  { label: "Chrome extension", href: "/guard/chrome-extension", keywords: ["chrome", "extension", "browser", "trade", "insight"] },
  { label: "Settings", href: "/guard/settings", keywords: ["settings", "billing", "preferences", "subscription"] },
] as const;

export function filterGuardSearchDestinations(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return GUARD_SEARCH_DESTINATIONS.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.keywords.some((keyword) => keyword.includes(q) || q.includes(keyword))
  );
}
