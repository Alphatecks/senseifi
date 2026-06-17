"use client";


import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import MarketingNavLink from '@/views/marketing/MarketingNavLink';

type HeaderProps = { hideGetStarted?: boolean };

export default function Header({ hideGetStarted }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { connectedAddress, isConnectedOrRemembered, disconnectWallet, isDisconnecting } = useWallet();
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
          <li>
            <MarketingNavLink href="/" className="hover:text-white transition">
              Home
            </MarketingNavLink>
          </li>
          <li>
            <MarketingNavLink href="/about" className="hover:text-white transition">
              About
            </MarketingNavLink>
          </li>
          <li>
            <MarketingNavLink href="/pricing" className="hover:text-white transition">
              Pricing
            </MarketingNavLink>
          </li>
          <li>
            <MarketingNavLink href="/features" className="hover:text-white transition">
              Features
            </MarketingNavLink>
          </li>
          <li>
            <MarketingNavLink href="/contact" className="hover:text-white transition">
              Contact
            </MarketingNavLink>
          </li>
        </ul>
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4 ml-0 mr-6 md:ml-auto md:mr-0">
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
                prefetch
                className="hidden md:inline-flex flex-none mr-0 md:mr-0 lg:mr-4 xl:mr-40 bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-2xl font-medium transition shadow-lg border-2 border-white items-center justify-center"
              >
                Connect Wallet
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
            { label: 'Pricing', href: '/pricing' },
            { label: 'Features', href: '/features' },
            { label: 'Contact us', href: '/contact' },
          ].map((item) => (
            <li key={item.label} className="py-4">
              {item.href.startsWith('/') ? (
                <MarketingNavLink
                  href={item.href}
                  className="block hover:text-white transition"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </MarketingNavLink>
              ) : (
                <a href={item.href} className="block hover:text-white transition">
                  {item.label}
                </a>
              )}
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
                prefetch
                className="w-auto px-6 bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 text-white py-3 rounded-2xl font-medium transition shadow-lg border-2 border-white whitespace-nowrap flex items-center justify-center"
              >
                Connect Wallet
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
