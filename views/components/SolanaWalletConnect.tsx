'use client';

import React, { useEffect, useState } from 'react';
import {
  getSolanaWalletOptions,
  isSolanaWalletInstalled,
  type SolanaBrowserWallet,
} from '@/utils/solanaWallet';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';

type SolanaWalletConnectProps = {
  compact?: boolean;
  onConnected?: () => void;
  className?: string;
};

export default function SolanaWalletConnect({
  compact = false,
  onConnected,
  className = '',
}: SolanaWalletConnectProps) {
  const { registerSolanaWallet, isConnecting, error, clearError } = useSolanaWallet();
  const [installed, setInstalled] = useState<Record<SolanaBrowserWallet, boolean>>({
    phantom: false,
    solflare: false,
    backpack: false,
  });
  const [connectingWallet, setConnectingWallet] = useState<SolanaBrowserWallet | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const options = getSolanaWalletOptions();
    setInstalled(
      options.reduce(
        (acc, wallet) => {
          acc[wallet.id] = isSolanaWalletInstalled(wallet.id);
          return acc;
        },
        { phantom: false, solflare: false, backpack: false } as Record<SolanaBrowserWallet, boolean>
      )
    );
  }, []);

  const handleConnect = async (walletId: SolanaBrowserWallet, walletName: string) => {
    clearError();
    setSuccessMessage(null);
    setConnectingWallet(walletId);
    try {
      await registerSolanaWallet(walletId);
      setSuccessMessage(`${walletName} Solana wallet linked.`);
      onConnected?.();
    } catch {
      // Error state handled in hook.
    } finally {
      setConnectingWallet(null);
    }
  };

  return (
    <div className={className}>
      {!compact ? (
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white">Connect Solana</h3>
          <p className="text-xs text-blue-100/70 mt-1">
            Uses your browser wallet&apos;s Solana account — not the EVM address from WalletConnect.
            Link it to the same SenseiFi user as your EVM wallet when both are connected.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        {getSolanaWalletOptions().map((wallet) => {
          const isInstalled = installed[wallet.id];
          const isBusy = isConnecting && connectingWallet === wallet.id;

          return (
            <button
              key={wallet.id}
              type="button"
              disabled={isConnecting}
              onClick={() => {
                if (!isInstalled) {
                  window.open(wallet.installUrl, '_blank', 'noopener,noreferrer');
                  return;
                }
                void handleConnect(wallet.id, wallet.name);
              }}
              className="w-full rounded-xl p-3 flex items-center gap-3 bg-[#020617]/80 border border-slate-700/60 hover:border-purple-500/50 hover:bg-slate-900/80 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={wallet.logo}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                  referrerPolicy="no-referrer"
                />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-white font-medium text-sm">{wallet.name}</span>
                <span className="block text-xs text-slate-400">
                  {isInstalled ? 'Solana account' : 'Install extension'}
                </span>
              </span>
              {isBusy ? (
                <span className="text-xs text-slate-400 shrink-0">Connecting…</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-center text-red-400">{error}</p>
      ) : null}
      {successMessage ? (
        <p className="mt-3 text-sm text-center text-green-400">{successMessage}</p>
      ) : null}
    </div>
  );
}
