"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useInView } from "../utils/useInView";

const faqs = [
  {
    question: "Is SenseiFi safe to use?",
    answer: (
      <>
        Yes. SenseiFi uses a zero-access security model. We never collect or store your private keys, seed phrases, or wallet secrets.{" "}
        <Link href="/guard/wallet-security" className="text-blue-400 hover:underline">
          SenseiGuard
        </Link>{" "}
        analyzes transactions and smart contracts before you sign, monitors wallet activity in real time, and flags phishing sites, malicious approvals, and suspicious contracts across supported chains. Your keys stay in your wallet; SenseiFi provides the intelligence layer that helps you avoid costly mistakes.
      </>
    ),
  },
  {
    question: "Can I trade using SenseiFi?",
    answer: (
      <>
        Yes, through{" "}
        <strong className="text-white/90">SenseiTrade</strong>, SenseiFi&apos;s AI-powered trading workspace. It delivers market signals, trend alerts, and portfolio insights tailored to your strategy so you can trade with more context and less guesswork. Connect your wallet via the{" "}
        <Link href="/connect-wallet" className="text-blue-400 hover:underline">
          web app
        </Link>{" "}
        to get started. SenseiGuard is available today; SenseiTrade is rolling out progressively. Check Connect Wallet for the latest availability.
      </>
    ),
  },
  {
    question: "How does SenseiCard work?",
    answer: (
      <>
        <strong className="text-white/90">SenseiCard</strong> lets you spend crypto in everyday life. Link your wallet, convert digital assets to fiat at competitive rates, and pay online or track subscriptions from your SenseiFi dashboard. Card issuance and payment processing are handled by regulated third-party providers. SenseiFi does not store sensitive card credentials directly. Subscription plans unlock higher transaction limits and priority conversion rates as you upgrade.
      </>
    ),
  },
  {
    question: "Do I need to install anything?",
    answer: (
      <>
        No installation is required for the SenseiFi web app. You can connect your wallet, scan addresses, and use the security dashboard directly in your browser. For full protection on dApps, install the free{" "}
        <Link href="/guard/chrome-extension" className="text-blue-400 hover:underline">
          SenseiGuard Chrome extension
        </Link>{" "}
        (SenseiFi Trade Insight). It intercepts transaction and signing requests on the sites you visit, runs AI-powered risk analysis via the SenseiFi backend, and warns you before you approve dangerous actions.
      </>
    ),
  },
  {
    question: "Which cryptocurrencies are supported?",
    answer: (
      <>
        SenseiFi supports major EVM networks including Ethereum, BNB Smart Chain, Polygon, Base, Arbitrum, and Optimism, with coverage expanding across additional chains. You can connect popular wallets such as MetaMask, Coinbase Wallet, WalletConnect, Phantom, Rabby, and Trust Wallet. Tokens and contracts on your active chain are scanned by SenseiGuard. Supported assets depend on the network you connect to.
      </>
    ),
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [headerRef, headerInView] = useInView<HTMLDivElement>({ threshold: 0 });
  // One ref per FAQ card for staggered animation
  const faqRefs = faqs.map(() => useInView<HTMLDivElement>({ threshold: 0 }));

  return (
    <section
      className="w-full flex flex-col md:flex-row justify-between items-start py-24 bg-black !bg-black !bg-opacity-100 relative z-10"
      id="faq"
      style={{ background: '#000' }}
    >
      {/* Left Side */}
      <div ref={headerRef} className={`md:w-1/2 w-full px-8 md:px-24 flex flex-col items-start ${headerInView ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <span className="px-5 py-1 mb-6 rounded-full border border-blue-400 text-blue-400 font-medium text-base">FAQ</span>
        <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 leading-tight">Frequently Asked<br />Questions</h2>
        <p className="text-white/70 text-lg max-w-md mb-2">Quick answers about wallet security, SenseiGuard, SenseiTrade, SenseiCard, and getting started.</p>
      </div>
      {/* Right Side */}
      <div className="md:w-1/2 w-full flex flex-col gap-6 px-8 mt-12 md:mt-0">
        {faqs.map((faq, idx) => {
          const [faqRef, faqInView] = faqRefs[idx];
          return (
            <div
              key={faq.question}
              ref={faqRef}
              className={`bg-[#0B111E] transition-all duration-300 ${openIndex === idx ? "shadow-lg" : ""} rounded-2xl border border-black relative z-10 ${faqInView ? 'animate-fade-slide-up' : 'opacity-0'}`}
              style={{ background: '#0B111E' }}
            >
              <button
                className="w-full flex justify-between items-center text-left px-8 py-6 text-white text-lg font-normal focus:outline-none"
                onClick={() => setOpenIndex(idx === openIndex ? -1 : idx)}
              >
                <span>{faq.question}</span>
                <span className="ml-4">
                  {openIndex === idx ? (
                    // Up arrow, larger size
                    <svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 22V10" stroke="#5B7CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 16l6-6 6 6" stroke="#5B7CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    // Right arrow, larger size
                    <svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 16h12" stroke="#5B7CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 10l6 6-6 6" stroke="#5B7CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </span>
              </button>
              {openIndex === idx && faq.answer && (
                <div className="px-8 pb-6 text-white/80 text-base">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
