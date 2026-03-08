"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { DashboardUser } from "@/services/walletService";

type DashboardUserContextValue = {
  dashboardUser: DashboardUser | null;
  setDashboardUser: (user: DashboardUser | null) => void;
};

const DashboardUserContext = createContext<DashboardUserContextValue | null>(null);

export function DashboardUserProvider({ children }: { children: React.ReactNode }) {
  const [dashboardUser, setDashboardUser] = useState<DashboardUser | null>(null);
  const value: DashboardUserContextValue = {
    dashboardUser,
    setDashboardUser: useCallback((user) => setDashboardUser(user), []),
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
