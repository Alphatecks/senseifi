"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import QRCodeBox from './QRCodeBox';

export default function ConnectWalletPage() {
  const [open, setOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<'guard' | 'trade'>('guard');

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative px-4"
      style={{
        backgroundImage: 'url(/images/icons/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Page header: logo far left, button far right */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 md:px-10 py-6">
        <div className="flex items-center gap-2">
          <Image
            src="/images/scaled_logo.png"
            alt="SenseiFi Logo"
            width={140}
            height={36}
            className="h-9 w-auto"
          />
          <span className="text-white text-xl font-semibold tracking-tight">
            SenseiFi
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 text-white px-6 py-2.5 rounded-2xl font-medium transition shadow-lg border-2 border-white whitespace-nowrap"
        >
          Connect Wallet
        </button>
      </div>

      {/* Heading */}
      <div className="mt-24 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-3">
          Choose Your Workspace
        </h1>
        <p className="text-sm md:text-base text-blue-100/80 max-w-xl mx-auto">
          Trade smarter with SenseiTrade or protect your assets with SenseiGuard.
        </p>
      </div>

      {/* Centered workspace selector card */}
      <div className="w-full max-w-xl">
        <div
          className="relative rounded-3xl border border-[#2563EB80] bg-[#020617]/80 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.85)] px-5 py-6 md:px-8 md:py-7 mx-auto"
        >
          {/* Card glow */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-[#1D4ED870] via-transparent to-[#0EA5E980] opacity-80" />

          <div className="relative z-10">
            {/* Card header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-blue-400/70 bg-blue-500/30">
                  <span className="h-2 w-2 rounded-full bg-blue-300" />
                </span>
                <span className="text-sm md:text-base font-medium text-blue-100">
                  Choose Your Sensei Path
                </span>
              </div>
              <button
                type="button"
                className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 hover:text-white transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* SenseiGuard option */}
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
                <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[#052E16] flex items-center justify-center shadow-[0_0_24px_rgba(34,197,94,0.75)]">
                  <Image
                    src="/images/icons/logo_green.png"
                    alt="SenseiGuard"
                    width={40}
                    height={40}
                    className="h-9 w-9 md:h-10 md:w-10"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-base md:text-[17px]">
                      SenseiGuard
                    </span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-200">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-blue-100/80 max-w-xs">
                    Your always-on shield against wallet risks, scams, and unsafe smart contracts.
                  </p>
                </div>
              </div>
              <span
                className={`ml-4 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                  selectedPath === 'guard'
                    ? 'border-blue-300 bg-blue-500/30'
                    : 'border-slate-500 bg-transparent'
                }`}
              >
                {selectedPath === 'guard' && (
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
              </span>
            </button>

            {/* SenseiTrade option */}
            <button
              type="button"
              onClick={() => setSelectedPath('trade')}
              className={`w-full flex items-center justify-between rounded-2xl px-4 py-4 md:px-5 md:py-4 text-left transition ${
                selectedPath === 'trade'
                  ? 'bg-gradient-to-r from-[#0F172A] via-[#020617] to-[#020617] border border-blue-500/60 shadow-[0_0_30px_rgba(37,99,235,0.55)]'
                  : 'bg-[#020617]/80 border border-slate-700 hover:border-blue-500/70 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[#0B1120] flex items-center justify-center border border-sky-500/50">
                  <Image
                    src="/images/icons/logo_green.png"
                    alt="SenseiTrade"
                    width={40}
                    height={40}
                    className="h-9 w-9 md:h-10 md:w-10 saturate-150 hue-rotate-90"
                  />
                </div>
                <div>
                  <span className="block text-white font-medium text-base md:text-[17px] mb-1">
                    SenseiTrade
                  </span>
                  <p className="text-xs md:text-sm text-blue-100/80 max-w-xs">
                    AI signals, market context, and execution in one trading command center.
                  </p>
                </div>
              </div>
              <span
                className={`ml-4 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                  selectedPath === 'trade'
                    ? 'border-blue-300 bg-blue-500/30'
                    : 'border-slate-500 bg-transparent'
                }`}
              >
                {selectedPath === 'trade' && (
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
              </span>
            </button>

            {/* Continue button */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0EA5E9] px-6 py-3 text-sm md:text-base font-medium text-white shadow-[0_18px_45px_rgba(37,99,235,0.65)] hover:shadow-[0_22px_55px_rgba(37,99,235,0.85)] hover:brightness-110 transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Modal overlay and dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative w-full max-w-md p-8 rounded-2xl bg-black bg-opacity-60 border border-blue-500 shadow-xl flex flex-col items-center">
            {/* Title */}
            <div className="flex items-center mb-6 gap-2 w-full justify-between">
              <div className="flex items-center gap-2">
                <img src="/images/icons/wallet.png" alt="Wallet Icon" className="w-9 h-9" />
                <span className="text-white text-lg">Connect Wallet</span>
              </div>
              <button
                className="text-white text-2xl hover:bg-white/10 rounded-full p-1 transition"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                &times;
              </button>
            </div>
            {/* Wallet Options */}
            <div className="space-y-3 mb-6 w-full">
              <div
                className="flex items-center justify-between px-6 py-4 rounded-2xl border border-blue-400 shadow-[0_2px_16px_0_rgba(0,38,255,0.18)] mb-2"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, #2563eb 0%, #2563eb 60%, #0026FF 100%)',
                  boxShadow: '0 2px 32px 0 #0026FF99, 0 1.5px 0 0 #2563eb inset',
                }}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQphwLzRDakG6JSViYg3TAA7i1oYLdOM2hHgQ&s"
                    alt="MetaMask"
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <span className="text-white font-medium text-base">
                    MetaMask{' '}
                    <span className="text-xs text-blue-100 font-normal ml-1">
                      (Recommended)
                    </span>
                  </span>
                </div>
                <button
                  className="backdrop-blur-md bg-white/10 border border-white/30 text-white text-base px-7 py-2 rounded-xl shadow-md transition font-normal hover:bg-white/20"
                  style={{ boxShadow: '0 0 0 1.5px #fff3, 0 2px 8px 0 #0026FF22', borderRadius: 14 }}
                >
                  Connect
                </button>
              </div>
              <div
                className="flex items-center justify-between px-6 py-4 rounded-2xl mb-2"
                style={{
                  background: '#1e293b',
                  boxShadow:
                    'inset 0 -2px 6px 0 #2563eb, inset 2px 0 6px 0 #2563eb, inset -2px 0 6px 0 #2563eb',
                  borderLeft: '4px solid #2563eb',
                  borderRight: '4px solid #2563eb',
                  borderBottom: '4px solid #2563eb',
                  borderTop: 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAt-ukC5nUe-3CJf171wLkpzIgxoqnO0JOKw&s"
                    alt="Coinbase Wallet"
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <span className="text-white font-medium text-base">Coinbase Wallet</span>
                </div>
                <button
                  className="backdrop-blur-md bg-white/10 border border-white/30 text-white text-base px-7 py-2 min-w-[110px] rounded-xl shadow-md transition font-normal hover:bg-white/20"
                  style={{ boxShadow: '0 0 0 1.5px #fff3, 0 2px 8px 0 #2563eb22', borderRadius: 14 }}
                >
                  Connect
                </button>
              </div>
            </div>
            {/* Divider */}
            <div className="flex items-center mb-6 w-full">
              <div className="flex-grow h-px bg-gray-700" />
              <span className="mx-3 text-gray-400">OR</span>
              <div className="flex-grow h-px bg-gray-700" />
            </div>
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <QRCodeBox value={typeof window !== 'undefined' ? window.location.href : ''} />
              <span className="text-gray-300 text-sm flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405M19 13V7a2 2 0 00-2-2h-6M5 7V5a2 2 0 012-2h6m-6 0v2m0 0H7m0 0v2"
                  />
                </svg>
                Scan Code to connect
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
