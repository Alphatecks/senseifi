"use client";

import Image from "next/image";
import Link from "next/link";
import subtractShape from "@/assets/images/Subtract.png";
import WhyTrustSection from "./WhyTrustSection";
import CenteredAppDownload from "./CenteredAppDownload";

const IMPACT_STATS = [
  { value: "12,000+", label: "Digital Wallets" },
  { value: "8,500+", label: "Traders" },
  { value: "$10M+", label: "Crypto Card Transactions" },
  { value: "99.3%", label: "User Satisfaction" },
] as const;

const CORE_VALUES = [
  {
    title: "Security First",
    description: "Protecting users' assets is our top priority",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#0026FF]" aria-hidden="true">
        <path
          d="M12 3.5 5 6.75v5.5c0 4.2 2.98 8.12 7 9.25 4.02-1.13 7-5.05 7-9.25v-5.5L12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Innovation",
    description: "Constantly improving with AI and DeFi technology.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#0026FF]" aria-hidden="true">
        <path
          d="M9 18h6M10 21h4M12 3a5 5 0 0 0-2.5 9.33V13h5v-.67A5 5 0 0 0 12 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Transparency",
    description: "Clear, trustworthy, and honest operations.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#0026FF]" aria-hidden="true">
        <circle cx="8" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    title: "User Empowerment",
    description: "Tools that give full control to users.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#0026FF]" aria-hidden="true">
        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M6.5 19c.8-2.8 2.9-4.5 5.5-4.5s4.7 1.7 5.5 4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Speed & Performance",
    description: "Fast transactions and real-time insights.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#0026FF]" aria-hidden="true">
        <path
          d="M12 4a8 8 0 1 0 8 8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M20 4v4h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Accessibility",
    description: "Making crypto management simple for everyone.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#0026FF]" aria-hidden="true">
        <path
          d="m8.5 12.5 2.5 2.5 5-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
] as const;

export default function AboutScreen() {
  return (
    <main className="w-full bg-[#0a0a1a] text-white pt-32 md:pt-36 pb-0">
      <section className="w-full px-4 md:px-8 lg:px-12 xl:px-20">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center">
            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center rounded-full border border-blue-400/60 px-4 py-1 text-sm text-blue-300 mb-6">
                About Us
              </span>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-normal leading-tight">
                Making Crypto
                <br />
                Management Clear,
                <br />
                Secure, and Effortless
              </h1>
              <p className="mt-6 text-white/75 text-base md:text-lg max-w-xl">
                We combine advanced AI, real-time protection, and seamless financial tools to simplify how
                you manage digital assets.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/connect-wallet"
                  className="inline-flex items-center rounded-xl border-2 border-white/20 bg-[#0026FF] px-6 py-3 text-sm md:text-base"
                >
                  Sign up
                </Link>
                <button className="inline-flex items-center rounded-xl border-2 border-white/20 bg-white/10 px-6 py-3 text-sm md:text-base">
                  Explore Products <span className="ml-2 text-lg">›</span>
                </button>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="overflow-hidden">
                <video
                  src="/images/About%20header%20gif.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-[280px] md:h-[420px] lg:h-[500px] object-contain mix-blend-screen contrast-125 brightness-110"
                />
              </div>
            </div>
          </div>

          <div className="w-full mt-10 md:mt-12">
            <div className="block md:hidden w-full overflow-hidden">
              <div className="logo-marquee-track flex items-center gap-x-10 whitespace-nowrap">
                <img src="/images/id9jl1arwx_logos 1.png" alt="Phantom" className="h-7 w-auto object-contain" />
                <img src="/images/idR3970tUM_1775665826564 1.png" alt="Coinbase" className="h-7 w-auto object-contain" />
                <img src="/images/g18.png" alt="Binance" className="h-7 w-auto object-contain" />
                <img src="/images/Group.png" alt="WalletConnect Pay" className="h-6 w-auto object-contain" />
                <img src="/images/MetaMask-logo-white 1.png" alt="MetaMask" className="h-7 w-auto object-contain" />

                <img src="/images/id9jl1arwx_logos 1.png" alt="" aria-hidden="true" className="h-7 w-auto object-contain" />
                <img src="/images/idR3970tUM_1775665826564 1.png" alt="" aria-hidden="true" className="h-7 w-auto object-contain" />
                <img src="/images/g18.png" alt="" aria-hidden="true" className="h-7 w-auto object-contain" />
                <img src="/images/Group.png" alt="" aria-hidden="true" className="h-6 w-auto object-contain" />
                <img src="/images/MetaMask-logo-white 1.png" alt="" aria-hidden="true" className="h-7 w-auto object-contain" />
              </div>
            </div>

            <div className="hidden md:flex flex-nowrap items-center justify-center gap-x-10 text-white whitespace-nowrap">
              <img src="/images/id9jl1arwx_logos 1.png" alt="Phantom" className="h-10 w-auto object-contain" />
              <img src="/images/idR3970tUM_1775665826564 1.png" alt="Coinbase" className="h-10 w-auto object-contain" />
              <img src="/images/g18.png" alt="Binance" className="h-10 w-auto object-contain" />
              <img src="/images/Group.png" alt="WalletConnect Pay" className="h-9 w-auto object-contain" />
              <img src="/images/MetaMask-logo-white 1.png" alt="MetaMask" className="h-10 w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 md:px-8 lg:px-12 xl:px-20 mt-12 md:mt-16">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-[26px] border border-white/10 bg-[#0e1630] p-6 md:p-8 min-h-[480px] md:min-h-[640px] flex flex-col justify-between">
            <h2 className="text-4xl md:text-5xl font-normal leading-tight max-w-md">
              Built for a Smarter,
              <br />
              Safer Crypto Future
            </h2>
            <div className="mt-8 relative w-full h-[340px] md:h-[440px] lg:h-[520px] overflow-hidden">
              <video
                src="/images/about%20mid%20gif.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                className="absolute inset-x-0 bottom-0 h-[130%] w-full object-cover object-bottom mix-blend-screen contrast-125 brightness-110"
              />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-[22px] border border-white/10 bg-[#01061c] p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-full border border-white/20 bg-white/20" />
                <div className="h-10 w-10 rounded-full border border-white/20 bg-white/10" />
                <div className="h-10 w-10 rounded-full border border-white/20 bg-white/20" />
                <div className="h-10 w-10 rounded-full border border-white/20 bg-[#0026FF] flex items-center justify-center">
                  <Image src="/images/scaled_logo.png" alt="SenseiFi" width={18} height={18} />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl md:text-5xl font-semibold">150K +</span>
                <span className="text-lg md:text-2xl text-white/80">Our Active Users</span>
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-[#0e1630] p-5 md:p-6">
              <h3 className="text-2xl md:text-4xl leading-tight font-medium">
                SenseiFi is a next-generation DeFi intelligence and security platform designed to make crypto
                management smarter, safer, and effortless.
              </h3>
              <p className="mt-4 text-white/75 text-sm md:text-base max-w-2xl">
                We combine AI-powered trading insights, advanced wallet protection, and seamless virtual
                crypto cards to help users navigate the digital asset world with confidence.
              </p>
              <button className="mt-6 inline-flex items-center rounded-full border border-blue-400/60 px-5 py-2 text-blue-300 text-sm">
                About Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 md:px-8 lg:px-12 xl:px-20 mt-12 md:mt-16">
        <div className="w-full max-w-7xl mx-auto relative py-8 md:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[220px] md:h-[280px] bg-[radial-gradient(ellipse_at_center,rgba(0,38,255,0.35)_0%,rgba(0,38,255,0.08)_45%,transparent_72%)]"
          />

          <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
            {IMPACT_STATS.map((stat) => (
              <article
                key={stat.label}
                className="relative min-h-[148px] md:min-h-[168px] overflow-hidden"
              >
                <Image
                  src={subtractShape}
                  alt=""
                  aria-hidden="true"
                  fill
                  className="object-fill pointer-events-none select-none"
                />
                <div className="relative z-10 flex h-full flex-col justify-center px-6 py-7 md:px-7 md:py-8">
                  <p className="text-3xl md:text-4xl font-semibold leading-none tracking-tight">
                    {stat.value}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="h-[2px] w-10 md:w-12 rounded-full bg-[#0026FF]" />
                    <span className="h-2 w-2 rounded-full bg-[#0026FF]" />
                  </div>
                  <p className="mt-3 text-sm md:text-base text-white/85">{stat.label}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <WhyTrustSection showPricing={false} />

      <section className="w-full bg-[#000000] px-4 md:px-8 lg:px-12 xl:px-20 pt-12 md:pt-16 pb-12 md:pb-16">
        <div className="w-full max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-normal text-center mb-10 md:mb-14">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {CORE_VALUES.map((value) => (
              <article
                key={value.title}
                className="rounded-[22px] bg-[#00041a] p-6 md:p-7 min-h-[190px] md:min-h-[210px] flex flex-col"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-white">
                  {value.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-semibold leading-tight">{value.title}</h3>
                <p className="mt-3 text-sm md:text-base text-white/65 leading-relaxed">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CenteredAppDownload />
    </main>
  );
}

