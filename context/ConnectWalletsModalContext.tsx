"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const POPULAR_DEX_WALLETS = [
  { name: "MetaMask", logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" },
  { name: "Coinbase Wallet", logo: "https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Product_Wallet.svg" },
  { name: "WalletConnect", logo: "https://cdn.jsdelivr.net/gh/WalletConnect/walletconnect-assets@master/Logo/Blue%20(Default)/Logo.svg" },
  { name: "Rabby", logo: "https://rabby.io/assets/images/logo-128.png" },
  { name: "Phantom", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/phantom.svg" },
  { name: "Trust Wallet", logo: "https://trustwallet.com/assets/images/media/assets/TWT.png" },
  { name: "Rainbow", logo: "https://avatars.githubusercontent.com/u/31578401?s=200&v=4" },
  { name: "Brave Wallet", logo: "https://brave.com/static-assets/images/brave-logo-sans-text.svg" },
];

type ConnectWalletsModalContextValue = {
  openConnectWalletsModal: () => void;
};

const ConnectWalletsModalContext = createContext<ConnectWalletsModalContextValue | null>(null);

export function ConnectWalletsModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openConnectWalletsModal = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const modal =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }}
        onClick={close}
      >
        <div
          className="w-full max-w-md rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden bg-[#1A1E2E]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#2D2F3C] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-slate-700/80 border border-slate-600/50 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </span>
              <h2 className="text-lg font-bold text-white truncate">Connect other wallets</h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 transition"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 max-h-[60vh] overflow-y-auto hide-scrollbar space-y-2">
            {POPULAR_DEX_WALLETS.map((wallet) => (
              <button
                key={wallet.name}
                type="button"
                className="w-full rounded-lg p-3 flex items-center gap-3 bg-[#262938]/90 border border-slate-700/40 hover:border-slate-600/60 hover:bg-[#262938] transition text-left"
              >
                <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={wallet.logo} alt="" width={32} height={32} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                </span>
                <span className="text-white font-medium text-sm">{wallet.name}</span>
              </button>
            ))}
          </div>
          <div className="p-5 border-t border-slate-700/50">
            <button
              type="button"
              onClick={close}
              className="w-full rounded-xl font-bold text-white py-3 px-4 transition hover:opacity-90"
              style={{ background: "linear-gradient(to bottom, #4a4a4a 0%, #414141 50%, #383838 100%)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <ConnectWalletsModalContext.Provider value={{ openConnectWalletsModal }}>
      {children}
      {modal}
    </ConnectWalletsModalContext.Provider>
  );
}

export function useConnectWalletsModal() {
  const ctx = useContext(ConnectWalletsModalContext);
  return ctx;
}
