"use client";
import FAQSection from "./FAQSection";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import HowItWorksSection from "./HowItWorksSection";
import WhyTrustSection from "./WhyTrustSection";
import CenteredAppDownload from "./CenteredAppDownload";
import { useInView } from "../utils/useInView";
import handImage from "@/assets/images/hand.png";
import HomeAddressScanModal from "@/views/components/HomeAddressScanModal";
import { normalizeEvmAddressInput } from "@/utils/evmAddress";

export default function HomeScreen() {
  const [scanAddress, setScanAddress] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const [scanError, setScanError] = React.useState("");
  const [scanModalOpen, setScanModalOpen] = React.useState(false);

  const handleAddressScan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeEvmAddressInput(inputValue);

    if (!normalized) {
      setScanError("Enter a valid wallet or contract address (0x…).");
      return;
    }

    setScanError("");
    setScanAddress(normalized);
    setScanModalOpen(true);
  };

  const closeScanModal = () => {
    setScanModalOpen(false);
  };

  // Hero Section scroll animation
  const [heroRef, heroInView] = useInView({ threshold: 0.2 });
  // Value Section scroll animation
  const [valueRef, valueInView] = useInView({ threshold: 0.2 });
  // Features Section scroll animation
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2 });
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0a0a1a] to-[#181c2a] text-white flex flex-col">
      {/* Header spacing */}
      <div className="h-20" />
      {/* Additional spacing */}
      <div className="h-20" />
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="w-full flex flex-col relative overflow-visible pl-4 pr-4 md:px-8 lg:px-12 xl:pl-40 xl:pr-0"
      >
        {/* Starfield background scoped to hero only */}
        <div
          className="absolute inset-0 -inset-x-8 -inset-y-12 pointer-events-none z-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute inset-0 starfield opacity-100" />
          <div className="absolute -left-24 -top-12 h-[34rem] w-[34rem] bg-[radial-gradient(circle_at_center,_rgba(0,38,255,0.6),_rgba(0,38,255,0)_70%)] blur-3xl" />
          <div className="absolute -right-16 -top-20 h-[32rem] w-[32rem] bg-[radial-gradient(circle_at_center,_rgba(0,38,255,0.65),_rgba(0,38,255,0)_72%)] blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-transparent to-transparent" />
        </div>
        {/* Desktop rolling coin */}
        <div className="hidden md:block absolute right-[-3rem] top-[-1rem] md:w-[20rem] md:h-[20rem] lg:right-[-6rem] lg:-top-16 lg:w-[32rem] lg:h-[32rem] xl:right-[-8rem] xl:-top-48 xl:w-[64rem] xl:h-[64rem] z-50 pointer-events-none">
          <Image
            src={handImage}
            alt="SenseiFi hand"
            width={1024}
            height={1024}
            className="w-full h-full object-contain opacity-70"
            unoptimized
          />
        </div>
        {/* ...no animated coins... */}
        <div className="w-full flex flex-col items-center md:items-start text-center md:text-left mt-2 md:mt-20 lg:mt-28 xl:mt-36 md:max-w-2xl lg:max-w-3xl xl:max-w-none">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mb-4 text-white drop-shadow-xl z-10 relative ${heroInView ? "animate-fade-slide-up" : "opacity-0"}`}>
            Protect Wallets. Detect Threats.<br className="hidden md:inline" /> Trade Crypto With Confidence
          </h1>
          <p className={`text-lg md:text-lg lg:text-xl text-white/80 mb-8 max-w-2xl z-10 relative ${heroInView ? "animate-fade-slide-up delay-200" : "opacity-0"}`}>
            Where Artificial Intelligence Meets Financial Precision.
          </p>
          <div className="flex flex-row flex-wrap gap-3 mb-12 z-10 relative w-full justify-center md:justify-start">
            <Link href="/connect-wallet" className="flex-1 min-w-[120px] max-w-[180px] md:flex-none md:min-w-0 md:max-w-none flex justify-center md:block" scroll={true}>
              <button className="w-full md:w-auto px-4 py-2 md:px-7 md:py-3 rounded-xl font-semibold text-sm md:text-base bg-gradient-to-r from-[#0026FF] to-[#0026FF] text-white shadow-lg border-2 border-white/20 hover:from-[#0026FF] hover:to-blue-500 transition">
                Connect Wallet
              </button>
            </Link>
          </div>
        </div>
        {/* Mobile rolling coin below hero content */}
        <div className="block md:hidden relative pointer-events-none" style={{ height: '400px', overflow: 'visible' }}>
          <Image
            src={handImage}
            alt="SenseiFi hand"
            width={2000}
            height={800}
            style={{
              position: 'absolute',
              left: '50%',
              top: '-100px',
              transform: 'translateX(-50%)',
              width: '200vw',
              height: 'auto',
              zIndex: 10,
              opacity: 0.7,
            }}
            unoptimized
          />
        </div>
      </section>
      {/* Value Section */}
      <section ref={valueRef} className="w-full px-4 flex flex-col items-center -mt-6 md:mt-52">
        <h2 className={`text-3xl md:text-6xl font-normal mb-3 text-white text-center ${valueInView ? "animate-fade-slide-up" : "opacity-0"}`}>All-in-one Platform</h2>
        <p className={`text-base md:text-3xl text-white/80 mb-10 text-center max-w-4xl leading-tight ${valueInView ? "animate-fade-slide-up delay-200" : "opacity-0"}`}>
          Detect phishing, malicious contracts, and risky approvals before you sign. Scan any wallet and stay protected with AI-powered security.
        </p>
        <div className={`w-full mt-6 md:mt-16 ${valueInView ? "animate-fade-slide-up delay-300" : "opacity-0"}`}>
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

          <form
            onSubmit={handleAddressScan}
            className="relative z-10 w-full max-w-4xl mx-auto mt-8 mb-10 md:mt-48 md:-mb-36 flex flex-col items-center gap-2"
          >
            <div className="flex flex-row gap-2 sm:gap-3 w-full items-end">
              <input
                id="wallet-address-scan"
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (scanError) setScanError("");
                }}
                placeholder="Scan wallet or contract address (0x…)"
                className="min-w-0 flex-1 rounded-none border-0 border-b border-white/20 bg-transparent text-white text-xs sm:text-sm md:text-base px-0 py-2.5 sm:py-3 focus:outline-none focus:ring-0 focus:border-[#4066FF] placeholder:text-white/40"
                aria-invalid={Boolean(scanError)}
                aria-describedby={scanError ? "wallet-address-error" : undefined}
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 font-normal text-xs sm:text-sm md:text-base bg-gradient-to-r from-[#0026FF] to-[#4066FF] text-white hover:brightness-110 transition whitespace-nowrap"
              >
                Scan
              </button>
            </div>
            {scanError ? (
              <p id="wallet-address-error" className="text-red-300 text-xs md:text-sm w-full text-left">
                {scanError}
              </p>
            ) : null}
          </form>
        </div>
      </section>
      {/* Features Section */}
      <section ref={featuresRef} className="w-full px-4 py-20 flex flex-col items-start bg-white md:mt-52 mt-16">
        {/* Mobile Features Section */}
        <div className="block md:hidden w-full">
          <span className="px-4 py-1 rounded-full border border-[#0026FF] text-black text-sm font-medium bg-transparent mb-6 inline-block">Features</span>
          <h2 className={`text-4xl font-normal text-black mb-4 ${featuresInView ? "animate-fade-slide-up" : "opacity-0"}`}>Crypto Made Simple.<br/>Safe. Smart.</h2>
          <p className={`text-base text-black mb-6 ${featuresInView ? "animate-fade-slide-up delay-200" : "opacity-0"}`}>Trade with AI-powered insights, protect your wallets with real-time security, and spend crypto seamlessly all in one platform.</p>
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
        </div>
        {/* Desktop Features Section */}
        <div className="hidden md:block w-full">
          <div className="w-full flex justify-start px-6 lg:px-10 xl:pl-40">
            <span className="px-4 py-1 rounded-full border border-[#0026FF] text-black text-sm font-medium bg-transparent mb-20 inline-block">Features</span>
          </div>
          <div className="w-full flex flex-col lg:flex-row lg:items-center gap-6 mb-8 -mt-6 px-6 lg:px-10 xl:px-0">
            <h2 className={`text-3xl md:text-5xl font-medium text-black text-left max-w-2xl xl:ml-40 ${featuresInView ? "animate-fade-slide-up" : "opacity-0"}`}>Crypto Made Simple. Safe. Smart.</h2>
            <div className="hidden lg:block flex-1" />
            <p className={`text-lg md:text-2xl text-gray-600 text-left max-w-2xl lg:ml-auto xl:mr-10 ${featuresInView ? "animate-fade-slide-up delay-200" : "opacity-0"}`}>
              Trade with AI-powered insights, protect your wallets with real-time security, and spend crypto seamlessly  all in one platform.
            </p>
          </div>
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
        </div>
      </section>
      {/* How it works Section */}
      <HowItWorksSection />

      {/* Why Trust Section */}
      <WhyTrustSection />
      <FAQSection />
      <CenteredAppDownload />
      <HomeAddressScanModal open={scanModalOpen} address={scanAddress} onClose={closeScanModal} />
    </main>
  );
}
