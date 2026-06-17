"use client";

import React, { useState } from "react";
import Image from "next/image";
import contactHeroImage from "@/assets/images/Rectangle 111.png";

const CONTACT_CARDS = [
  // {
  //   label: "Give us call",
  //   value: "(2033) 454-6125",
  //   href: "tel:+20334546125",
  //   icon: (
  //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
  //       <path
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //         strokeWidth={1.8}
  //         d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
  //       />
  //     </svg>
  //   ),
  // },
  {
    label: "Send us Email",
    value: "support@senseifi.io",
    href: "mailto:support@senseifi.io",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  // {
  //   label: "Our Location",
  //   value: "1761 Treva Groves",
  //   href: "https://maps.google.com/?q=1761+Treva+Groves",
  //   icon: (
  //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
  //       <path
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //         strokeWidth={1.8}
  //         d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
  //       />
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  //     </svg>
  //   ),
  // },
] as const;

const CONTACT_FAQS = [
  {
    question: "Is SenseiFi safe to use?",
    answer: (
      <>
        Yes. SenseiFi uses a zero-access security model—we never collect or store your private keys, seed phrases, or wallet secrets.{" "}
        <span className="text-[#4066FF]">
          SenseiGuard analyzes transactions and smart contracts before you sign, monitors wallet activity in real time, and flags phishing sites, malicious approvals, and suspicious contracts
        </span>{" "}
        across supported chains. Your keys stay in your wallet; SenseiGuard provides the intelligence layer that helps you avoid costly mistakes.
      </>
    ),
  },
  {
    question: "How does SenseiGuard protect my wallet?",
    answer: (
      <>
        SenseiGuard acts as a wallet firewall. It decodes transactions and smart contract calls before you sign, scores each action for risk, and warns you about phishing sites, malicious approvals, drainer contracts, and suspicious token transfers. The SenseiGuard Chrome extension intercepts signing requests on dApps in real time, while the web dashboard gives you ongoing wallet security scans, approval reviews, and threat alerts.
      </>
    ),
  },
  {
    question: "What threats does SenseiGuard detect?",
    answer: (
      <>
        SenseiGuard is built to catch unlimited token approvals, wallet drainers, fake airdrops, address-poisoning scams, impersonation sites, and high-risk smart contracts. It combines on-chain analysis with SenseiFi&apos;s AI detection engine to explain what a transaction actually does in plain language—so you know whether to sign, reject, or revoke access before anything leaves your wallet.
      </>
    ),
  },
] as const;

function ContactFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="w-full bg-black py-20 md:py-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-12 px-6 md:flex-row md:gap-16 md:px-12 lg:px-20 xl:px-24">
        <div className="md:w-5/12">
          <span className="mb-6 inline-flex rounded-full border border-[#0026FF] px-5 py-1 text-sm font-medium text-white">
            FAQ
          </span>
          <h2 className="mb-6 text-4xl font-medium leading-tight text-white md:text-5xl">
            Frequently Asked
            <br />
            Question
          </h2>
          <p className="max-w-md text-lg text-white/70">
            Find quick answers to common questions about our services, pricing, booking, etc
          </p>
        </div>

        <div className="flex w-full flex-col gap-5 md:w-7/12">
          {CONTACT_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className={`rounded-2xl border border-black bg-[#0B111E] transition-all duration-300 ${isOpen ? "shadow-lg" : ""}`}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-6 py-5 text-left text-lg font-normal text-white focus:outline-none md:px-8 md:py-6"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                >
                  <span>{faq.question}</span>
                  <span className="ml-4 shrink-0">
                    {isOpen ? (
                      <svg width="32" height="32" fill="none" aria-hidden>
                        <path d="M16 22V10" stroke="#5B7CFF" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M10 16l6-6 6 6" stroke="#5B7CFF" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="32" height="32" fill="none" aria-hidden>
                        <path d="M10 16h12" stroke="#5B7CFF" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M18 10l6 6-6 6" stroke="#5B7CFF" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </span>
                </button>
                {isOpen ? <div className="px-6 pb-6 text-base text-white/80 md:px-8 md:pb-6">{faq.answer}</div> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function ContactScreen() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("Thanks for reaching out. Our team will get back to you shortly.");
    event.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="h-20" />
      <div className="h-12 md:h-16" />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 md:px-8 lg:px-12 xl:px-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 starfield opacity-80" />
          <div className="absolute -right-16 top-0 h-[28rem] w-[28rem] bg-[radial-gradient(circle_at_center,_rgba(0,38,255,0.55),_rgba(0,38,255,0)_70%)] blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-transparent to-[#0a0a1a]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl pt-4 text-center md:pt-8">
          <h1 className="text-4xl font-normal leading-tight text-white md:text-5xl lg:text-6xl">
            Get in Touch with Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 md:text-lg">
            We&apos;re here to help—reach out with questions, feedback, or just to say hello!
          </p>
        </div>
      </section>

      {/* Form + image */}
      <section className="relative z-10 mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8 lg:px-12 xl:px-20">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
          <div
            className="rounded-xl border border-[#1a2a6b]/60 p-6 md:p-8"
            style={{ background: "linear-gradient(180deg, rgba(12, 20, 58, 0.95) 0%, rgba(8, 14, 42, 0.98) 100%)" }}
          >
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm text-white/80">First name</span>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="Enter first name"
                    className="w-full rounded-xl border-0 bg-[#222a47] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm text-white/80">Last name</span>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="Enter last name"
                    className="w-full rounded-xl border-0 bg-[#222a47] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm text-white/80">Phone number</span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  className="w-full rounded-xl border-0 bg-[#222a47] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-white/80">Email address</span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter email address"
                  className="w-full rounded-xl border-0 bg-[#222a47] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-white/80">Leave us a message</span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Write your message..."
                  className="w-full resize-none rounded-xl border-0 bg-[#222a47] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
                />
              </label>

              {statusMessage ? <p className="text-sm text-green-300">{statusMessage}</p> : null}

              <button
                type="submit"
                className="w-full rounded-xl bg-[#0026FF] py-3.5 text-sm font-semibold text-white transition hover:bg-[#0020dd]"
              >
                Submit
              </button>
            </form>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-3xl lg:min-h-full">
            <Image
              src={contactHeroImage}
              alt="SenseiFi support representative ready to help"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="mx-auto mt-10 max-w-7xl px-4 md:mt-14 md:px-8 lg:px-12 xl:px-20">
        <div className="flex justify-center">
          {CONTACT_CARDS.map((card) => (
            <a
              key={card.label}
              href={card.href}
              className="group flex w-full max-w-md items-center justify-center gap-4 rounded-2xl border-0 bg-[#030821] px-8 py-5 text-center transition hover:bg-[#0a0f2a]"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0026FF]/15 text-[#4066FF]">
                {card.icon}
              </span>
              <div>
                <p className="text-sm text-white/55">{card.label}</p>
                <p className="mt-1 text-base font-medium text-white">{card.value}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <ContactFaqSection />
    </div>
  );
}
