"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useWallet } from "@/hooks/useWallet";
import { useDashboardUser } from "@/context/DashboardUserContext";
import { walletService } from "@/services/walletService";
import { getWalletChainIds } from "@/config/walletChains";
import { notifyWalletsUpdated } from "@/utils/registerWalletNetworks";
import SolanaWalletConnect from "@/views/components/SolanaWalletConnect";

const SUPPORTED_CHAIN_IDS = new Set(getWalletChainIds());

/** Networks the backend can monitor for the connected EVM address (one active chain per address). */
const POPULAR_NETWORKS = [
  { name: "Ethereum", chainId: 1, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
  { name: "BNB Smart Chain", chainId: 56, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png" },
  { name: "Polygon", chainId: 137, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png" },
  { name: "Base", chainId: 8453, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png" },
  { name: "Base Sepolia", chainId: 84532, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png" },
] as const;

const COMING_SOON_NETWORKS = [
  { name: "Arbitrum", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png" },
  { name: "Optimism", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png" },
  { name: "Avalanche", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png" },
  { name: "Fantom", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/info/logo.png" },
  { name: "Linea", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/linea/info/logo.png" },
] as const;

type ConnectNetworksModalContextValue = {
  openConnectNetworksModal: () => void;
};

const ConnectNetworksModalContext = createContext<ConnectNetworksModalContextValue | null>(null);

function ConnectNetworksModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { activeAddress, walletType } = useWallet();
  const { dashboardUser, setDashboardUser } = useDashboardUser();
  const [connectingChainId, setConnectingChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleConnectNetwork = useCallback(
    async (chainId: number, networkName: string) => {
      const address = activeAddress?.trim();
      if (!address) {
        setError("Connect a wallet first.");
        return;
      }
      if (!SUPPORTED_CHAIN_IDS.has(chainId)) {
        setError(`${networkName} is not supported yet.`);
        return;
      }

      setConnectingChainId(chainId);
      setError(null);
      setSuccessMessage(null);

      try {
        const result = await walletService.connectWallet(address, chainId, walletType, {
          chainFamily: 'evm',
          userId: dashboardUser?.user_id,
        });
        if (result.dashboard_user?.user_id) {
          setDashboardUser(result.dashboard_user);
        }
        setSuccessMessage(`Monitoring set to ${networkName}.`);
        notifyWalletsUpdated();
        window.setTimeout(() => onClose(), 800);
      } catch (err) {
        const message = err instanceof Error ? err.message : `Could not link ${networkName}.`;
        if (/already connected|already registered|duplicate/i.test(message)) {
          setSuccessMessage(`${networkName} is already your monitoring network.`);
          notifyWalletsUpdated();
          window.setTimeout(() => onClose(), 800);
          return;
        }
        setError(message);
      } finally {
        setConnectingChainId(null);
      }
    },
    [activeAddress, dashboardUser?.user_id, onClose, setDashboardUser, walletType]
  );

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh" }}
      onClick={onClose}
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
            <h2 className="text-lg font-bold text-white truncate">Manage networks</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto hide-scrollbar space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 px-1 mb-2">
              EVM monitoring network
            </p>
            <div className="space-y-2">
          {!activeAddress ? (
            <p className="text-sm text-slate-400 px-1 py-2">Connect an EVM wallet first to switch its monitoring network.</p>
          ) : null}

          {POPULAR_NETWORKS.filter((network) => SUPPORTED_CHAIN_IDS.has(network.chainId)).map((network) => (
            <button
              key={network.name}
              type="button"
              disabled={!activeAddress || connectingChainId !== null}
              onClick={() => void handleConnectNetwork(network.chainId, network.name)}
              className="w-full rounded-lg p-3 flex items-center gap-3 bg-[#262938]/90 border border-slate-700/40 hover:border-slate-600/60 hover:bg-[#262938] transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={network.logo} alt="" width={32} height={32} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              </span>
              <span className="text-white font-medium text-sm flex-1">{network.name}</span>
              {connectingChainId === network.chainId ? (
                <span className="text-xs text-slate-400">Linking…</span>
              ) : null}
            </button>
          ))}

          {COMING_SOON_NETWORKS.map((network) => (
            <div
              key={network.name}
              className="w-full rounded-lg p-3 flex items-center gap-3 bg-[#262938]/40 border border-slate-700/30 text-left opacity-50"
            >
              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={network.logo} alt="" width={32} height={32} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              </span>
              <span className="text-white font-medium text-sm">{network.name}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-500">Soon</span>
            </div>
          ))}
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-4">
            <SolanaWalletConnect compact onConnected={onClose} />
          </div>
        </div>

        {error ? <p className="px-5 pb-2 text-sm text-red-400">{error}</p> : null}
        {successMessage ? <p className="px-5 pb-2 text-sm text-green-400">{successMessage}</p> : null}

        <div className="p-5 border-t border-slate-700/50">
          <button
            type="button"
            onClick={onClose}
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
}

export function ConnectNetworksModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openConnectNetworksModal = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <ConnectNetworksModalContext.Provider value={{ openConnectNetworksModal }}>
      {children}
      <ConnectNetworksModal open={open} onClose={close} />
    </ConnectNetworksModalContext.Provider>
  );
}

export function useConnectNetworksModal() {
  const ctx = useContext(ConnectNetworksModalContext);
  return ctx;
}
