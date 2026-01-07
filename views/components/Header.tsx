"use client";

import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 z-50 bg-gradient-to-b from-[#0a0a1a] via-[#0a0a1a] to-transparent">
      <nav className="relative flex items-center justify-between w-full px-4 md:px-8 py-6">
        <div className="flex items-center gap-2 ml-9 md:ml-40">
          <Image 
            src="/images/logo.png" 
            alt="SenseiFi Logo" 
            width={32}
            height={32}
          />
          <span className="text-white font-medium text-lg">SenseiFi</span>
        </div>
        
        <ul className="hidden md:flex flex-1 items-center justify-center gap-10 text-gray-300">
          <li><a href="/" className="hover:text-white transition">Home</a></li>
          <li><a href="#" className="hover:text-white transition">About</a></li>
          <li><a href="#" className="hover:text-white transition">Pricing</a></li>
          <li><a href="#" className="hover:text-white transition">Features</a></li>
          <li><a href="#" className="hover:text-white transition">Contact</a></li>
        </ul>
        <div className="flex items-center gap-4 ml-0 mr-6 md:ml-auto md:mr-0">
          <button
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <span className="block w-6 h-6 relative">
                <span className="absolute left-0 top-1/2 w-6 h-0.5 bg-white rotate-45" />
                <span className="absolute left-0 top-1/2 w-6 h-0.5 bg-white -rotate-45" />
              </span>
            ) : (
              <span className="block w-6 h-0.5 bg-white relative">
                <span className="block w-6 h-0.5 bg-white mb-1" />
                <span className="block w-6 h-0.5 bg-white" />
              </span>
            )}
          </button>
          <button className="hidden md:inline-flex flex-none mr-0 md:mr-40 bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 text-white px-8 py-3 rounded-2xl font-medium transition shadow-lg border-2 border-white">
            Get started
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 right-auto w-[86%] max-w-xs z-40 bg-[#05070f] px-5 pt-6 pb-10 overflow-y-auto shadow-2xl transition-[transform,opacity] duration-300 ease-out ${open ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="SenseiFi" width={32} height={32} />
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
            { label: 'About us', href: '#' },
            { label: 'Pricing', href: '#' },
            { label: 'Contact us', href: '#' },
          ].map((item) => (
            <li key={item.label} className="py-4">
              <a href={item.href} className="block hover:text-white transition">{item.label}</a>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <button className="w-auto px-6 bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 text-white py-3 rounded-2xl font-medium transition shadow-lg border-2 border-white whitespace-nowrap">
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}
