"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import QRCodeBox from './QRCodeBox';

export default function ConnectWalletPage() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative"
      style={{
        backgroundImage: 'url(/images/icons/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Top-right Connect Wallet button */}
      <button
        className="fixed top-8 right-8 z-50 bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 text-white px-8 py-3 rounded-2xl font-medium transition shadow-lg border-2 border-white items-center justify-center"
        type="button"
        onClick={() => setOpen(true)}
      >
        Connect Wallet
      </button>
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <Image src="/images/logo.png" alt="SenseiFi Logo" width={40} height={40} />
        <span className="text-white text-2xl font-semibold">SenseiFi</span>
      </div>
      {/* Always show logo and connect button */}
      <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
        <Image src="/images/logo.png" alt="SenseiFi Logo" width={40} height={40} />
        <span className="text-white text-2xl font-semibold">SenseiFi</span>
      </div>
      <button
        className="fixed top-8 right-8 z-10 bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 text-white px-8 py-3 rounded-2xl font-medium transition shadow-lg border-2 border-white items-center justify-center"
        type="button"
        onClick={() => setOpen(true)}
      >
        Connect Wallet
      </button>

      {/* Centered workspace selection image as default content */}
      {!open && (
        <div className="flex flex-col items-center justify-center w-full h-full absolute top-0 left-0 z-0">
          <img src="/images/choose-workspace.png" alt="Choose Your Workspace" className="max-w-[420px] w-full h-auto mx-auto" />
        </div>
      )}

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
              <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQphwLzRDakG6JSViYg3TAA7i1oYLdOM2hHgQ&s" alt="MetaMask" width={40} height={40} className="rounded-lg" />
              <span className="text-white font-medium text-base">MetaMask <span className="text-xs text-blue-100 font-normal ml-1">(Recommended)</span></span>
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
              boxShadow: 'inset 0 -2px 6px 0 #2563eb, inset 2px 0 6px 0 #2563eb, inset -2px 0 6px 0 #2563eb',
              borderLeft: '4px solid #2563eb',
              borderRight: '4px solid #2563eb',
              borderBottom: '4px solid #2563eb',
              borderTop: 'none',
            }}
          >
            <div className="flex items-center gap-3">
              <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAt-ukC5nUe-3CJf171wLkpzIgxoqnO0JOKw&s" alt="Coinbase Wallet" width={40} height={40} className="rounded-lg" />
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
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405M19 13V7a2 2 0 00-2-2h-6M5 7V5a2 2 0 012-2h6m-6 0v2m0 0H7m0 0v2" /></svg>
            Scan Code to connect
          </span>
        </div>
        </div>
      </div>
      )}
    </div>
  );
}
