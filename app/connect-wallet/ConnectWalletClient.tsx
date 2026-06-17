"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../hooks/useWallet';
import { useWalletConnectModal } from '../../hooks/useWalletConnectModal';
import { isWalletConnectConfigured } from '@/config/appkit';
import { useWalletStack } from '@/context/WalletStackContext';
import {
  isExtensionWalletBridge,
  notifyExtensionWalletConnected,
} from '@/utils/extensionWalletBridge';
import SolanaWalletConnect from '@/views/components/SolanaWalletConnect';

function WalletConnectSetupRequired() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative px-4"
      style={{
        backgroundImage: 'url(/images/icons/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-md rounded-2xl border border-amber-500/40 bg-[#020617]/90 p-8 text-center">
        <h1 className="text-xl font-semibold text-white mb-3">WalletConnect not configured</h1>
        <p className="text-sm text-blue-100/80 mb-4">
          Add your Reown project ID to enable multi-wallet connection on the Choose Your Workspace page.
        </p>
        <code className="block text-xs text-amber-100 bg-black/40 rounded-lg px-3 py-2">
          NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
        </code>
        <p className="mt-4 text-xs text-blue-100/60">
          Create a free project at{' '}
          <a href="https://dashboard.reown.com" className="text-blue-300 underline" target="_blank" rel="noreferrer">
            dashboard.reown.com
          </a>
        </p>
      </div>
    </div>
  );
}

function ConnectWalletPageContent() {
  const [selectedPath, setSelectedPath] = useState<'guard' | 'trade'>('guard');
  const [isOpeningWalletModal, setIsOpeningWalletModal] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [extensionBridgeComplete, setExtensionBridgeComplete] = useState(false);
  const isExtensionBridge = isExtensionWalletBridge();
  const router = useRouter();
  const { openWalletConnectModal } = useWalletConnectModal();
  const {
    address,
    isConnected,
    chainId,
    walletType,
    disconnectWallet,
    registerWalletWithBackend,
    isRegistering,
    isDisconnecting,
    registrationError,
  } = useWallet();
  const registeredSessionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isConnected) {
      registeredSessionKeyRef.current = null;
    }
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected || !address || !chainId || isRegistering) return;

    const sessionKey = `${address.toLowerCase()}:${chainId}:${walletType}`;
    if (registeredSessionKeyRef.current === sessionKey) return;
    registeredSessionKeyRef.current = sessionKey;

    registerWalletWithBackend(walletType)
      .then((result) => {
        if (isExtensionBridge && address && chainId) {
          notifyExtensionWalletConnected({
            address,
            chainId,
            walletType,
            wallet: {
              address,
              chain_id: chainId,
              wallet_type: walletType,
              connected_at: new Date().toISOString(),
              is_active: true,
            },
            dashboard_user: result.dashboard_user,
          });
          setExtensionBridgeComplete(true);
          return;
        }
        if (selectedPath === 'guard') {
          setTimeout(() => router.push('/guard'), 1000);
        }
      })
      .catch((error) => {
        console.error('Failed to register wallet:', error);
        if (registeredSessionKeyRef.current === sessionKey) {
          registeredSessionKeyRef.current = null;
        }
      });
  }, [
    isConnected,
    address,
    chainId,
    walletType,
    isRegistering,
    isExtensionBridge,
    selectedPath,
    registerWalletWithBackend,
    router,
  ]);

  const handleOpenWalletModal = useCallback(async () => {
    setConnectError(null);
    setIsOpeningWalletModal(true);
    try {
      await openWalletConnectModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not open wallet picker.';
      setConnectError(message);
      console.error('Failed to open wallet modal:', error);
    } finally {
      setIsOpeningWalletModal(false);
    }
  }, [openWalletConnectModal]);

  useEffect(() => {
    if (!isExtensionBridge || !isMounted) return;
    void handleOpenWalletModal();
  }, [isExtensionBridge, isMounted, handleOpenWalletModal]);

  const handleContinue = () => {
    if (isConnected && selectedPath === 'guard') {
      router.push('/guard');
      return;
    }
    void handleOpenWalletModal();
  };

  const isConnecting = isOpeningWalletModal || isRegistering;
  const displayError = connectError || registrationError;

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative px-4"
      style={{
        backgroundImage: 'url(/images/icons/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 md:px-10 py-6">
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <Image
            src="/images/scaled_logo.png"
            alt="SenseiFi Logo"
            width={140}
            height={36}
            className="h-7 w-auto group-hover:opacity-80 transition md:h-9"
          />
          <span className="text-white text-xl font-semibold tracking-tight group-hover:text-blue-300 transition">
            SenseiFi
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleOpenWalletModal()}
            disabled={isConnecting}
            className="bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 text-white px-6 py-2.5 rounded-2xl font-medium transition shadow-lg border-2 border-white whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {!isMounted
              ? 'Connect Wallet'
              : isConnecting
              ? 'Connecting...'
              : isConnected && address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : 'Connect Wallet'}
          </button>
          {isMounted && isConnected && (
            <button
              type="button"
              onClick={disconnectWallet}
              disabled={isDisconnecting}
              className="text-white px-6 py-2.5 rounded-2xl font-medium transition shadow-lg border-2 whitespace-nowrap inline-flex items-center justify-center gap-2 min-w-[120px] hover:opacity-90 disabled:opacity-80 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#F00500", borderColor: "#F00500" }}
            >
              {isDisconnecting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Disconnecting…
                </>
              ) : (
                'Disconnect'
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-24 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-3">
          {isExtensionBridge ? 'Connect Your Wallet' : 'Choose Your Workspace'}
        </h1>
        <p className="text-sm md:text-base text-blue-100/80 max-w-xl mx-auto">
          {isExtensionBridge
            ? 'Opened from SenseiGuard — pick Trust Wallet, Rabby, or 300+ wallets via WalletConnect.'
            : 'Trade smarter with SenseiTrade or protect your assets with SenseiGuard.'}
        </p>
      </div>

      <div className="w-full max-w-xl">
        <div
          className="relative rounded-3xl border border-[#2563EB80] bg-[#020617]/80 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.85)] px-5 py-6 md:px-8 md:py-7 mx-auto"
        >
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-[#1D4ED870] via-transparent to-[#0EA5E980] opacity-80" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-blue-400/70 bg-blue-500/30">
                  <span className="h-2 w-2 rounded-full bg-blue-300" />
                </span>
                <span className="text-sm md:text-base font-medium text-blue-100">
                  Choose Your Sensei Path
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPath('guard')}
              className={`w-full mb-4 flex items-center justify-between rounded-2xl px-4 py-4 md:px-5 md:py-4 text-left transition ${
                selectedPath === 'guard'
                  ? 'bg-gradient-to-r from-[#0F172A] via-[#020617] to-[#020617] border border-blue-500/60 shadow-[0_0_30px_rgba(37,99,235,0.55)]'
                  : 'bg-[#020617]/80 border border-slate-700 hover:border-blue-500/70 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-4">
                <>
                  <span className="md:hidden flex items-center justify-center bg-[#052E16] rounded-xl shadow-[0_0_16px_rgba(34,197,94,0.45)] mr-2 p-1" style={{ minWidth: 40, minHeight: 40 }}>
                    <Image
                      src="/images/icons/logo_green.png"
                      alt="SenseiGuard"
                      width={32}
                      height={32}
                      className="h-8 w-8"
                    />
                  </span>
                  <span className="hidden md:flex relative h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[#052E16] items-center justify-center shadow-[0_0_24px_rgba(34,197,94,0.75)]">
                    <Image
                      src="/images/icons/logo_green.png"
                      alt="SenseiGuard"
                      width={40}
                      height={40}
                      className="h-10 w-10"
                    />
                  </span>
                </>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-base md:text-[17px]">
                      SenseiGuard
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-blue-100/80 max-w-xs">
                    Your always-on shield against wallet risks, scams, and unsafe smart contracts.
                  </p>
                </div>
              </div>
              <span
                className={`ml-4 inline-flex h-5 w-5 items-center justify-center rounded-full md:rounded-[20px] border force-mobile-circle ${
                  selectedPath === 'guard'
                    ? 'border-blue-300 bg-blue-500/30'
                    : 'border-slate-500 bg-transparent'
                }`}
              >
                {selectedPath === 'guard' && (
                  <span className="h-2.5 w-2.5 rounded-full bg-white aspect-square md:aspect-auto force-mobile-circle-inner" />
                )}
              </span>
            </button>

            <div
              className="w-full flex items-center justify-between rounded-2xl px-4 py-4 md:px-5 md:py-4 text-left cursor-not-allowed opacity-60 bg-[#020617]/60 border border-slate-700/80"
              aria-disabled="true"
            >
              <div className="flex items-center gap-4">
                <>
                  <span className="md:hidden flex items-center justify-center bg-[#0B1120] rounded-xl border border-sky-500/50 mr-2 p-1" style={{ minWidth: 40, minHeight: 40 }}>
                    <Image
                      src="/images/icons/logo_green.png"
                      alt="SenseiTrade"
                      width={32}
                      height={32}
                      className="h-8 w-8 saturate-150 hue-rotate-90"
                    />
                  </span>
                  <span className="hidden md:flex relative h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[#0B1120] items-center justify-center border border-sky-500/50">
                    <Image
                      src="/images/icons/logo_green.png"
                      alt="SenseiTrade"
                      width={40}
                      height={40}
                      className="h-10 w-10 saturate-150 hue-rotate-90"
                    />
                  </span>
                </>
                <div>
                  <span className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-base md:text-[17px]">
                      SenseiTrade
                    </span>
                    <span className="rounded-full bg-blue-500/20 border border-blue-400/50 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-blue-200 whitespace-nowrap">
                      Coming Soon
                    </span>
                  </span>
                  <p className="text-xs md:text-sm text-blue-100/80 max-w-xs">
                    AI signals, market context, and execution in one trading command center.
                  </p>
                </div>
              </div>
              <span className="ml-4 inline-flex h-5 w-5 items-center justify-center rounded-full md:rounded-[20px] border border-slate-500 bg-transparent force-mobile-circle" />
            </div>

            {displayError && (
              <div
                className="mt-4 p-3 rounded-lg border border-[#F00500]/50 text-sm text-center"
                style={{ backgroundColor: "rgba(240,5,0,0.2)", color: "#F00500" }}
              >
                {displayError}
              </div>
            )}

            {isConnected && address && (
              <div
                className="mt-4 p-3 rounded-lg border border-[#32BB1D]/50 text-sm text-center"
                style={{ backgroundColor: "rgba(50,187,29,0.2)", color: "#32BB1D" }}
              >
                <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
                {isRegistering ? (
                  <p className="mt-1">Registering wallet with backend…</p>
                ) : null}
                {extensionBridgeComplete && (
                  <p className="mt-1">Wallet linked — return to the SenseiGuard extension.</p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleContinue}
              disabled={isConnecting}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0EA5E9] px-6 py-3 text-sm md:text-base font-medium text-white shadow-[0_18px_45px_rgba(37,99,235,0.65)] hover:shadow-[0_22px_55px_rgba(37,99,235,0.85)] hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : isConnected ? 'Continue to SenseiGuard' : 'Connect Wallet'}
            </button>

            {!isConnected && (
              <p className="mt-3 text-center text-xs text-blue-100/70">
                WalletConnect links EVM accounts (0x address). Pick Trust, Rabby, MetaMask, and 300+ wallets.
              </p>
            )}

            <div className="mt-6 pt-6 border-t border-slate-700/60">
              <SolanaWalletConnect
                onConnected={() => {
                  if (selectedPath === 'guard' && !isExtensionBridge) {
                    setTimeout(() => router.push('/guard'), 1000);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConnectWalletClient() {
  const { ready, walletConnectEnabled } = useWalletStack();

  if (!isWalletConnectConfigured()) {
    return <WalletConnectSetupRequired />;
  }

  if (!ready || !walletConnectEnabled) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center bg-[#0a0a1a] text-blue-100/80"
        aria-busy="true"
      >
        Loading wallet connection…
      </div>
    );
  }

  return <ConnectWalletPageContent />;
}
