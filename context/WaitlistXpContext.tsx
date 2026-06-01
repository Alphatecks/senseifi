"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useDashboardUser } from "@/context/DashboardUserContext";
import { useWallet } from "@/hooks/useWallet";
import { walletService } from "@/services/walletService";
import {
  InsufficientXpError,
  XP_COST_CONTRACT_SCAN,
  XP_COST_DAPP_CHECK,
  XP_COST_TX_ANALYSIS,
  formatInsufficientXpMessage,
  isInsufficientXpError,
} from "@/services/xpTypes";

type WaitlistXpContextValue = {
  xpBalance: number | null;
  xpClaimed: boolean;
  refreshWaitlistXp: () => Promise<void>;
  applyInsufficientXp: (error: InsufficientXpError) => void;
  canAffordTxAnalysis: (highRiskWarningsOn: boolean) => boolean;
  canAffordContractScan: (withForAddress: boolean) => boolean;
  canAffordDappCheck: () => boolean;
  txAnalysisCost: number;
  contractScanCost: number;
  dappCheckCost: number;
  insufficientXpMessage: (error: InsufficientXpError) => string;
};

const WaitlistXpContext = createContext<WaitlistXpContextValue | null>(null);

export function WaitlistXpProvider({ children }: { children: React.ReactNode }) {
  const { activeAddress: address } = useWallet();
  const { dashboardUser } = useDashboardUser();
  const [xpBalance, setXpBalance] = useState<number | null>(null);
  const [xpClaimed, setXpClaimed] = useState(false);

  const refreshWaitlistXp = useCallback(async () => {
    const walletAddress = address?.trim();
    const userId = dashboardUser?.user_id?.trim();
    if (!walletAddress && !userId) {
      setXpBalance(null);
      setXpClaimed(false);
      return;
    }
    try {
      const status = await walletService.getWaitlistStatus(
        walletAddress || undefined,
        userId || undefined
      );
      setXpClaimed(status.claimed);
      setXpBalance(status.claimed && status.data ? status.data.xp : null);
    } catch {
      setXpBalance(null);
      setXpClaimed(false);
    }
  }, [address, dashboardUser?.user_id]);

  useEffect(() => {
    void refreshWaitlistXp();
  }, [refreshWaitlistXp]);

  const applyInsufficientXp = useCallback((error: InsufficientXpError) => {
    setXpClaimed(true);
    setXpBalance(error.xpBalance);
  }, []);

  const canAffordTxAnalysis = useCallback(
    (highRiskWarningsOn: boolean) => {
      if (!xpClaimed || !highRiskWarningsOn) return true;
      return (xpBalance ?? 0) >= XP_COST_TX_ANALYSIS;
    },
    [xpClaimed, xpBalance]
  );

  const canAffordContractScan = useCallback(
    (withForAddress: boolean) => {
      if (!withForAddress || !xpClaimed) return true;
      return (xpBalance ?? 0) >= XP_COST_CONTRACT_SCAN;
    },
    [xpClaimed, xpBalance]
  );

  const canAffordDappCheck = useCallback(() => {
    if (!xpClaimed) return true;
    return (xpBalance ?? 0) >= XP_COST_DAPP_CHECK;
  }, [xpClaimed, xpBalance]);

  const value: WaitlistXpContextValue = {
    xpBalance,
    xpClaimed,
    refreshWaitlistXp,
    applyInsufficientXp,
    canAffordTxAnalysis,
    canAffordContractScan,
    canAffordDappCheck,
    txAnalysisCost: XP_COST_TX_ANALYSIS,
    contractScanCost: XP_COST_CONTRACT_SCAN,
    dappCheckCost: XP_COST_DAPP_CHECK,
    insufficientXpMessage: formatInsufficientXpMessage,
  };

  return (
    <WaitlistXpContext.Provider value={value}>{children}</WaitlistXpContext.Provider>
  );
}

export function useWaitlistXp() {
  const ctx = useContext(WaitlistXpContext);
  return (
    ctx ?? {
      xpBalance: null,
      xpClaimed: false,
      refreshWaitlistXp: async () => {},
      applyInsufficientXp: () => {},
      canAffordTxAnalysis: () => true,
      canAffordContractScan: () => true,
      canAffordDappCheck: () => true,
      txAnalysisCost: XP_COST_TX_ANALYSIS,
      contractScanCost: XP_COST_CONTRACT_SCAN,
      dappCheckCost: XP_COST_DAPP_CHECK,
      insufficientXpMessage: formatInsufficientXpMessage,
    }
  );
}

export { isInsufficientXpError };
