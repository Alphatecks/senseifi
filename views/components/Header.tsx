"use client";


import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';

const MOBILE_NOTIFICATIONS = [
  {
    id: '1',
    icon: 'senseifi',
    title: "We've just reached out 30k goal raised for charity! We're so proud of the team!",
    description: '',
    time: '8 min ago',
    action: null,
  },
  {
    id: '2',
    icon: 'placeholder',
    title: 'Suspicious Transaction Detected',
    description: 'A transfer of 0.75 ETH to an unknown wallet was flagged. Review and approve within 15 minutes to avoid potential loss.',
    time: '17 min ago',
    action: 'Review Transaction',
  },
  {
    id: '3',
    icon: 'placeholder',
    title: 'Strengthen Your Wallet Security 🔒',
    description: "We noticed you haven't enabled 2FA on your Ethereum wallet. Protect your funds by activating it now.",
    time: '45 min ago',
    action: null,
  },
  {
    id: '4',
    icon: 'placeholder',
    title: 'Token Risk Alert ⚠',
    description: '$XYZ token has been flagged for high volatility and low liquidity. Consider reviewing your holdings.',
    time: '1 day ago',
    action: null,
  },
  {
    id: '5',
    icon: 'placeholder',
    title: 'Potential Scam Contract Detected ⚡',
    description: 'A smart contract you interacted with shows suspicious activity patterns. Exercise caution before further interaction.',
    time: '2 day ago',
    action: 'Review Analysis',
  },
];

type HeaderProps = { hideGetStarted?: boolean };

export default function Header({ hideGetStarted }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { connectedAddress, isConnectedOrRemembered, disconnectWallet, isDisconnecting } = useWallet();
  const unreadCount = 2;
  const showConnectedWallet = hasMounted && isConnectedOrRemembered && Boolean(connectedAddress);
  const displayAddress = connectedAddress
    ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
    : '';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <header className="fixed w-full top-0 z-50 bg-gradient-to-b from-[#0a0a1a] via-[#0a0a1a] to-transparent">
      <nav className="relative flex items-center justify-between w-full px-4 md:px-6 lg:px-8 xl:px-8 py-6">
        <div className="flex items-center gap-2 ml-9 md:ml-2 lg:ml-6 xl:ml-40">
          <Image
            src="/images/scaled_logo.png"
            alt="SenseiFi Logo"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
          <span className="text-white font-medium text-lg">SenseiFi</span>
        </div>
        
        <ul className="hidden md:flex flex-1 items-center justify-center gap-4 lg:gap-8 xl:gap-10 text-gray-300 text-sm lg:text-base">
          <li><a href="/" className="hover:text-white transition">Home</a></li>
          <li><a href="/about" className="hover:text-white transition">About</a></li>
          <li><a href="#" className="hover:text-white transition">Pricing</a></li>
          <li><a href="#" className="hover:text-white transition">Features</a></li>
          <li><a href="#" className="hover:text-white transition">Contact</a></li>
        </ul>
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4 ml-0 mr-6 md:ml-auto md:mr-0">
          {/* Mobile: notification icon in its own box */}
          <button
            type="button"
            onClick={() => setShowNotifications(true)}
            className="md:hidden relative flex items-center justify-center w-10 h-10 rounded-xl border-2 border-white/25 bg-[#0f1220] text-white hover:bg-white/10 transition shadow-sm"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0026FF]" aria-hidden />
            )}
          </button>
          {/* Mobile: menu icon in its own box */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border-2 border-white/25 bg-[#0f1220] text-white hover:bg-white/10 transition shadow-sm"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <span className="block w-5 h-5 relative">
                <span className="absolute left-0 top-1/2 w-5 h-0.5 bg-white rotate-45 -translate-y-1/2" />
                <span className="absolute left-0 top-1/2 w-5 h-0.5 bg-white -rotate-45 -translate-y-1/2" />
              </span>
            ) : (
              <span className="block w-5 h-0.5 bg-white relative">
                <span className="block w-5 h-0.5 bg-white mb-1.5" />
                <span className="block w-5 h-0.5 bg-white" />
              </span>
            )}
          </button>
          {!hideGetStarted && (
            showConnectedWallet ? (
              <div className="hidden md:flex items-center gap-2 mr-0 md:mr-0 lg:mr-4 xl:mr-40">
                <button
                  type="button"
                  title={connectedAddress ?? undefined}
                  className="inline-flex flex-none bg-gradient-radial from-[#0026FF] to-blue-400 text-white px-5 lg:px-6 py-2.5 lg:py-3 rounded-2xl font-medium border-2 border-white items-center justify-center"
                >
                  {displayAddress}
                </button>
                <button
                  type="button"
                  onClick={disconnectWallet}
                  disabled={isDisconnecting}
                  className="inline-flex items-center justify-center px-4 lg:px-5 py-2.5 lg:py-3 rounded-2xl font-medium border-2 border-white/25 bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-60"
                >
                  {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            ) : (
              <Link
                href="/connect-wallet"
                className="hidden md:inline-flex flex-none mr-0 md:mr-0 lg:mr-4 xl:mr-40 bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-2xl font-medium transition shadow-lg border-2 border-white items-center justify-center"
              >
                Get started
              </Link>
            )
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 right-auto w-[86%] max-w-xs z-40 bg-[#05070f] px-5 pt-6 pb-10 overflow-y-auto shadow-2xl transition-[transform,opacity] duration-150 ease-out will-change-transform ${open ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Image src="/images/scaled_logo.png" alt="SenseiFi" width={120} height={32} className="h-8 w-auto" />
            <span className="text-white font-medium text-lg">SenseiFi</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
            aria-label="Close menu"
          >
            <span className="sr-only">Close</span>
            <span className="inline-block rotate-180 text-lg leading-none">➜</span>
          </button>
        </div>

        <ul className="text-white/90 text-base divide-y divide-white/10 border-t border-b border-white/10">
          {[
            { label: 'Home', href: '/' },
            { label: 'About us', href: '/about' },
            { label: 'Pricing', href: '#' },
            { label: 'Contact us', href: '#' },
          ].map((item) => (
            <li key={item.label} className="py-4">
              <a href={item.href} className="block hover:text-white transition">{item.label}</a>
            </li>
          ))}
        </ul>

        {!hideGetStarted && (
          <div className="mt-8">
            {showConnectedWallet ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title={connectedAddress ?? undefined}
                  className="w-auto px-5 bg-gradient-radial from-[#0026FF] to-blue-400 text-white py-3 rounded-2xl font-medium border-2 border-white whitespace-nowrap flex items-center justify-center"
                >
                  {displayAddress}
                </button>
                <button
                  type="button"
                  onClick={disconnectWallet}
                  disabled={isDisconnecting}
                  className="w-auto px-4 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl font-medium border-2 border-white/25 whitespace-nowrap flex items-center justify-center transition disabled:opacity-60"
                >
                  {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            ) : (
              <Link
                href="/connect-wallet"
                className="w-auto px-6 bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 text-white py-3 rounded-2xl font-medium transition shadow-lg border-2 border-white whitespace-nowrap flex items-center justify-center"
              >
                Get started
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Mobile notifications panel – full screen when bell is tapped */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-[#0a0a1a] flex flex-col transition-[opacity,visibility] duration-150 ${showNotifications ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        aria-hidden={!showNotifications}
      >
        <div className="flex items-center justify-between w-full px-4 pt-4 pb-3 border-b border-white/10 bg-[#0a0a1a] shrink-0 safe-area-inset-top">
          <div className="flex items-center gap-2">
            <Image src="/images/scaled_logo.png" alt="SenseiFi" width={100} height={28} className="h-7 w-auto" />
            <span className="text-white font-medium text-base">SenseiFi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNotifications(false)}
              className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-white/25 bg-[#0f1220] text-white hover:bg-white/10 transition"
              aria-label="Close notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-white/25 bg-[#0f1220] text-white hover:bg-white/10 transition"
              aria-label="Menu"
            >
              <span className="block w-5 h-0.5 bg-white relative">
                <span className="block w-5 h-0.5 bg-white mb-1.5" />
                <span className="block w-5 h-0.5 bg-white" />
              </span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[#0026FF] text-white text-xs font-semibold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="text-[#0026FF] text-sm font-medium">Mark all as read</button>
              <button type="button" className="p-1 text-white/70 hover:text-white" aria-label="More options">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
              </button>
            </div>
          </div>

          <ul className="space-y-4">
            {MOBILE_NOTIFICATIONS.map((n) => (
              <li key={n.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[#0026FF]/20 flex items-center justify-center overflow-hidden">
                    {n.icon === 'senseifi' ? (
                      <Image src="/images/scaled_logo.png" alt="" width={24} height={24} className="object-contain" />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-white/20" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm leading-snug">{n.title}</p>
                    {n.description && (
                      <p className="text-white/70 text-xs mt-1 leading-relaxed">{n.description}</p>
                    )}
                    <p className="text-white/50 text-xs mt-2">{n.time}</p>
                    {n.action && (
                      <button
                        type="button"
                        className="mt-3 px-4 py-2 rounded-lg bg-[#0026FF] text-white text-sm font-medium hover:opacity-90 transition"
                      >
                        {n.action}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
