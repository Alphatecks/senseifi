'use client';

import React, { createContext, useContext } from 'react';

type WalletStackContextValue = {
  /** True once wagmi config is ready (legacy or WalletConnect stack). */
  ready: boolean;
  /** True when Reown AppKit was initialized (multi-wallet modal available). */
  walletConnectEnabled: boolean;
};

const WalletStackContext = createContext<WalletStackContextValue>({
  ready: false,
  walletConnectEnabled: false,
});

export function WalletStackProvider({
  children,
  ready,
  walletConnectEnabled,
}: {
  children: React.ReactNode;
  ready: boolean;
  walletConnectEnabled: boolean;
}) {
  return (
    <WalletStackContext.Provider value={{ ready, walletConnectEnabled }}>
      {children}
    </WalletStackContext.Provider>
  );
}

export function useWalletStack() {
  return useContext(WalletStackContext);
}
