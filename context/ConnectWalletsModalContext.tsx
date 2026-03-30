"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";

/** Major networks users can browse from the guard “connect” modal (logos via Trust Wallet assets). */
const POPULAR_NETWORKS = [
  { name: "Ethereum", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
  { name: "BNB Smart Chain", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png" },
  { name: "Polygon", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png" },
  { name: "Arbitrum", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png" },
  { name: "Optimism", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png" },
  { name: "Base", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png" },
  { name: "Avalanche", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png" },
  { name: "Solana", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png" },
  { name: "Fantom", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/info/logo.png" },
  { name: "Linea", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/linea/info/logo.png" },
];

type ConnectNetworksModalContextValue = {
  openConnectNetworksModal: () => void;
};

const ConnectNetworksModalContext = createContext<ConnectNetworksModalContextValue | null>(null);

export function ConnectNetworksModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openConnectNetworksModal = useCallback(() => setOpen(true), []);
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </span>
              <h2 className="text-lg font-bold text-white truncate">Connect other networks</h2>
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
            {POPULAR_NETWORKS.map((network) => (
              <button
                key={network.name}
                type="button"
                className="w-full rounded-lg p-3 flex items-center gap-3 bg-[#262938]/90 border border-slate-700/40 hover:border-slate-600/60 hover:bg-[#262938] transition text-left"
              >
                <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={network.logo} alt="" width={32} height={32} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                </span>
                <span className="text-white font-medium text-sm">{network.name}</span>
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
    <ConnectNetworksModalContext.Provider value={{ openConnectNetworksModal }}>
      {children}
      {modal}
    </ConnectNetworksModalContext.Provider>
  );
}

export function useConnectNetworksModal() {
  const ctx = useContext(ConnectNetworksModalContext);
  return ctx;
}
