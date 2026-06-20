"use client";
import FAQSection from "./FAQSection";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HowItWorksSection from "./HowItWorksSection";
import WhyTrustSection from "./WhyTrustSection";
import CenteredAppDownload from "./CenteredAppDownload";
import { useInView } from "../utils/useInView";
import TransparentVideo from "./components/TransparentVideo";
import { useWallet } from "@/hooks/useWallet";

const HERO_VIDEO_SRC = "/videos/hero.mp4";

const PARTNER_LOGOS = [
  { src: "/images/Group.png", alt: "WalletConnect Pay", className: "h-5 sm:h-6 md:h-7" },
  { src: "/images/MetaMask-logo-white 1.png", alt: "MetaMask", className: "h-6 sm:h-7 md:h-8" },
  { src: "/images/idR3970tUM_1775665826564 1.png", alt: "Coinbase", className: "h-6 sm:h-7 md:h-8" },
  { src: "/images/g18.png", alt: "Binance", className: "h-6 sm:h-7 md:h-8" },
  { src: "/images/Trust Wallet Wordmark_White 1.png", alt: "Trust Wallet", className: "h-6 sm:h-7 md:h-8" },
  { src: "/images/id9jl1arwx_logos 1.png", alt: "Phantom", className: "h-6 sm:h-7 md:h-8" },
] as const;

export default function HomeScreen() {
  const [hasMounted, setHasMounted] = useState(false);
  const { connectedAddress, isConnectedOrRemembered } = useWallet();
  const showConnectedWallet = hasMounted && isConnectedOrRemembered && Boolean(connectedAddress);
  const displayAddress = connectedAddress
    ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
    : "";

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Hero Section scroll animation
  const [heroRef, heroInView] = useInView({ threshold: 0.2 });
  // All-in-one hero scroll animation
  const [valueRef, valueInView] = useInView({ threshold: 0.2 });
  // Features Section scroll animation
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2 });
  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white flex flex-col">
      {/* Hero — headline, CTAs, video */}
      <section
        ref={heroRef}
        className="relative w-full overflow-visible px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 md:pt-36"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 starfield opacity-60" />
          <div className="absolute top-0 right-0 h-64 w-64 bg-[radial-gradient(circle_at_center,_rgba(0,38,255,0.35),_transparent_70%)] blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a]/30 via-transparent to-[#0a0a1a]" />

          {/* Slanted beam from header toward hero video — scrolls with hero */}
          <div className="connect-wallet-beam absolute top-0 right-3 origin-top-right rotate-[40deg] sm:right-6 sm:rotate-[44deg] md:right-6 lg:right-8 lg:rotate-[50deg] xl:right-40">
            <div className="relative h-[18rem] w-36 sm:h-[24rem] sm:w-44 lg:h-[32rem]">
              <div className="absolute inset-0 bg-gradient-to-b from-[#4066FF]/80 via-[#0026FF]/30 to-transparent blur-3xl" />
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-white/90 via-[#4066FF]/90 to-transparent shadow-[0_0_20px_#4066FF]" />
              <div className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 bg-gradient-to-b from-[#4066FF] to-transparent blur-2xl" />
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2 top-[10.5rem] sm:top-[15.5rem] md:top-[16.5rem] lg:top-[17.5rem] h-[min(52.1vw,520px)] overflow-hidden"
          aria-hidden
        >
          <TransparentVideo
            src={HERO_VIDEO_SRC}
            className="h-full w-full opacity-95"
            threshold={40}
            align="bottom"
          />
          <div className="absolute inset-0 bg-[#0a0a1a]/55" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-4xl translate-y-0 sm:translate-y-16 md:translate-y-40 lg:translate-y-48 flex-col items-center text-center">
          <h1
            className={`text-[1.65rem] leading-tight sm:text-5xl md:text-6xl lg:text-[4.25rem] font-normal sm:leading-[1.15] tracking-tight text-white drop-shadow-lg ${
              heroInView ? "animate-fade-slide-up" : "opacity-0"
            }`}
          >
            Intelligent Crypto Insights,
            <br />
            Driven by Next-Level AI
          </h1>
          <p
            className={`mt-3 sm:mt-4 md:mt-5 text-xs sm:text-base md:text-lg text-white/75 max-w-2xl px-1 ${
              heroInView ? "animate-fade-slide-up delay-200" : "opacity-0"
            }`}
          >
            Where Artificial Intelligence Meets Financial Precision.
          </p>
          <div
            className={`mt-5 sm:mt-8 md:mt-10 flex w-full max-w-md flex-row items-stretch justify-center gap-2 px-1 sm:max-w-none sm:gap-4 sm:px-0 ${
              heroInView ? "animate-fade-slide-up delay-300" : "opacity-0"
            }`}
          >
            <Link
              href={showConnectedWallet ? "/guard" : "/connect-wallet"}
              scroll
              className="min-w-0 flex-1 sm:flex-none sm:w-auto"
            >
              <button
                type="button"
                title={showConnectedWallet ? connectedAddress ?? undefined : undefined}
                className="w-full rounded-xl px-3 py-2.5 text-[11px] font-medium leading-tight bg-[#0026FF] text-white shadow-[0_12px_40px_rgba(0,38,255,0.35)] hover:brightness-110 transition sm:min-w-[180px] sm:px-8 sm:py-3 sm:text-sm md:text-base"
              >
                {showConnectedWallet ? displayAddress : "Connect Wallet"}
              </button>
            </Link>
            <Link href="/features" scroll className="min-w-0 flex-1 sm:flex-none sm:w-auto">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-[11px] font-medium leading-tight border border-white/25 bg-transparent text-white hover:bg-white/5 transition sm:min-w-[180px] sm:gap-1.5 sm:px-8 sm:py-3 sm:text-sm md:text-base"
              >
                Explore Products
                <svg
                  aria-hidden
                  className="hidden h-4 w-4 shrink-0 sm:block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>
        </div>

        {/* Reserves space so the video stays inside this hero */}
        <div
          className="pointer-events-none h-[min(34vw,300px)] sm:h-[min(42vw,440px)] md:h-[min(46vw,480px)] lg:h-[min(50vw,520px)]"
          aria-hidden
        />

        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 z-20 h-28 w-screen max-w-[100vw] -translate-x-1/2 backdrop-blur-2xl sm:h-32 md:h-40 [mask-image:linear-gradient(to_top,#000_45%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,#000_45%,transparent_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 z-20 h-20 w-screen max-w-[100vw] -translate-x-1/2 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/80 to-transparent sm:h-24 md:h-28"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 z-20 h-12 w-screen max-w-[100vw] -translate-x-1/2 blur-md sm:h-14 md:h-16 [mask-image:linear-gradient(to_top,#000_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,#000_60%,transparent_100%)] bg-[#0a0a1a]/40"
        />
      </section>

      {/* Second hero — All-in-one platform (separate section below) */}
      <section
        ref={valueRef}
        className="relative isolate w-full bg-[#0a0a1a] px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14 flex flex-col items-center justify-center"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 starfield opacity-60" />
          <div className="absolute top-0 right-0 h-64 w-64 bg-[radial-gradient(circle_at_center,_rgba(0,38,255,0.35),_transparent_70%)] blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a]/30 via-transparent to-[#0a0a1a]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <span
            className={`mb-4 px-4 py-1 rounded-full border border-[#0026FF] text-[#4066FF] text-sm font-medium bg-transparent ${
              valueInView ? "animate-fade-slide-up" : "opacity-0"
            }`}
          >
            Value
          </span>
          <h2
            className={`text-3xl md:text-5xl lg:text-6xl font-normal text-white ${
              valueInView ? "animate-fade-slide-up delay-100" : "opacity-0"
            }`}
          >
            All-in-one Platform
          </h2>
          <p
            className={`mt-4 md:mt-5 text-sm sm:text-base md:text-xl text-white/70 max-w-3xl leading-relaxed px-2 ${
              valueInView ? "animate-fade-slide-up delay-200" : "opacity-0"
            }`}
          >
            Manage, protect and grow your digital assets with AI-powered intelligence in one platform.
          </p>
        </div>

        <div
          className={`relative z-10 mt-8 w-full md:mt-10 ${valueInView ? "animate-fade-slide-up delay-300" : "opacity-0"}`}
        >
          <div className="block overflow-hidden md:hidden">
            <div className="logo-marquee-track flex items-center gap-x-8 whitespace-nowrap">
              {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((logo, index) => (
                <img
                  key={`${logo.alt}-${index}`}
                  src={logo.src}
                  alt={index < PARTNER_LOGOS.length ? logo.alt : ""}
                  aria-hidden={index >= PARTNER_LOGOS.length}
                  className={`${logo.className} w-auto shrink-0 object-contain`}
                />
              ))}
            </div>
          </div>
          <div className="hidden flex-nowrap items-center justify-center gap-x-8 overflow-x-auto px-2 md:flex sm:gap-x-10 lg:gap-x-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PARTNER_LOGOS.map((logo) => (
              <img
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                className={`${logo.className} w-auto shrink-0 object-contain`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="w-full px-4 py-20 flex flex-col items-start bg-white mt-16 md:mt-24">
        {/* Mobile Features Section */}
        <div className="block md:hidden w-full text-center">
          <div className="grid grid-cols-1 gap-8 w-full max-w-6xl mx-auto">
            <div className="w-full flex justify-center items-center">
              <Image
                src="/images/senseitrade.gif"
                alt="Sensei Trade"
                width={800}
                height={800}
                className="object-contain w-[22rem] h-[22rem]"
                unoptimized
              />
            </div>
            <div className="w-full flex justify-center items-center">
              <Image
                src="/images/senseiguard.gif"
                alt="Sensei Guard"
                width={800}
                height={800}
                className="object-contain w-[22rem] h-[22rem]"
                unoptimized
              />
            </div>
            <div className="w-full flex justify-center items-center">
              <Image
                src="/images/senseicard.gif"
                alt="Sensei Card"
                width={800}
                height={800}
                className="object-contain w-[22rem] h-[22rem]"
                unoptimized
              />
            </div>
          </div>
          <span className="mt-10 inline-block px-4 py-1 rounded-full border border-[#0026FF] text-[#0026FF] text-sm font-medium bg-transparent mb-6">Features</span>
          <h2 className={`text-3xl font-normal text-black mb-4 px-2 ${featuresInView ? "animate-fade-slide-up" : "opacity-0"}`}>We Are What Your<br/>Wallet Was Missing</h2>
          <p className={`text-sm text-black px-4 leading-relaxed ${featuresInView ? "animate-fade-slide-up delay-200" : "opacity-0"}`}>Safer wallet, smarter trade &amp; frictionless spending with Senseifi Protocol. Your Wallet Deserves More Than A Seed Phrase.</p>
        </div>
        {/* Desktop Features Section */}
        <div className="hidden md:block w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-6 lg:px-10 mx-auto">
            <div className="w-full flex justify-center items-center">
              <Image
                src="/images/senseitrade.gif"
                alt="Sensei Trade"
                width={800}
                height={800}
                className="object-contain w-[28rem] h-[28rem]"
                unoptimized
              />
            </div>
            <div className="w-full flex justify-center items-center">
              <Image
                src="/images/senseiguard.gif"
                alt="Sensei Guard"
                width={800}
                height={800}
                className="object-contain w-[28rem] h-[28rem]"
                unoptimized
              />
            </div>
            <div className="w-full flex justify-center items-center">
              <Image
                src="/images/senseicard.gif"
                alt="Sensei Card"
                width={800}
                height={800}
                className="object-contain w-[28rem] h-[28rem]"
                unoptimized
              />
            </div>
          </div>
          <div className="w-full flex justify-start px-6 lg:px-10 xl:pl-40 mt-16 lg:mt-20">
            <span className="px-4 py-1 rounded-full border border-[#0026FF] text-black text-sm font-medium bg-transparent mb-8 inline-block">Features</span>
          </div>
          <div className="w-full flex flex-col lg:flex-row lg:items-center gap-6 px-6 lg:px-10 xl:px-0">
            <h2 className={`text-3xl md:text-5xl font-medium text-black text-left max-w-2xl xl:ml-40 ${featuresInView ? "animate-fade-slide-up" : "opacity-0"}`}>We Are What Your Wallet Was Missing</h2>
            <div className="hidden lg:block flex-1" />
            <p className={`text-lg md:text-2xl text-gray-600 text-left max-w-2xl lg:ml-auto xl:mr-10 ${featuresInView ? "animate-fade-slide-up delay-200" : "opacity-0"}`}>
              Safer wallet, smarter trade &amp; frictionless spending with Senseifi Protocol. Your Wallet Deserves More Than A Seed Phrase.
            </p>
          </div>
        </div>
      </section>
      {/* How it works Section */}
      <HowItWorksSection />

      {/* Why Trust Section */}
      <WhyTrustSection />
      <FAQSection />
      <CenteredAppDownload />
    </main>
  );
}
