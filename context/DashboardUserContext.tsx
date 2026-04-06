"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { DashboardUser } from "@/services/walletService";

type DashboardUserContextValue = {
  dashboardUser: DashboardUser | null;
  setDashboardUser: (user: DashboardUser | null) => void;
};

const DashboardUserContext = createContext<DashboardUserContextValue | null>(null);
const DASHBOARD_USER_STORAGE_KEY = "senseifi:dashboard-user";

export function DashboardUserProvider({ children }: { children: React.ReactNode }) {
  const [dashboardUser, setDashboardUser] = useState<DashboardUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DASHBOARD_USER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as DashboardUser;
      if (parsed?.user_id) setDashboardUser(parsed);
    } catch {
      // Ignore invalid persisted session.
    }
  }, []);

  const value: DashboardUserContextValue = {
    dashboardUser,
    setDashboardUser: useCallback((user) => {
      setDashboardUser(user);
      if (typeof window === "undefined") return;
      try {
        if (user?.user_id) {
          window.localStorage.setItem(DASHBOARD_USER_STORAGE_KEY, JSON.stringify(user));
        } else {
          window.localStorage.removeItem(DASHBOARD_USER_STORAGE_KEY);
        }
      } catch {
        // Ignore storage write failures.
      }
    }, []),
  };
  return (
    <DashboardUserContext.Provider value={value}>
      {children}
    </DashboardUserContext.Provider>
  );
}

export function useDashboardUser() {
  const ctx = useContext(DashboardUserContext);
  return ctx ?? { dashboardUser: null, setDashboardUser: () => {} };
}
