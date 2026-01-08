"use client";
import FAQSection from "./FAQSection";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import HowItWorksSection from "./HowItWorksSection";
import WhyTrustSection from "./WhyTrustSection";
import CenteredAppDownload from "./CenteredAppDownload";
import { useInView } from "../utils/useInView";

export default function HomeScreen() {
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
        className="w-full flex flex-col relative overflow-visible pl-4 pr-4 md:pl-40 md:pr-0"
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
        <div className="hidden md:block absolute right-0 -top-20 md:-top-48 w-[28rem] h-[28rem] md:w-[64rem] md:h-[64rem] z-50 pointer-events-none">
          <Image
            src="/images/rollingcoin.gif"
            alt="Rolling coin"
            width={1024}
            height={1024}
            className="w-full h-full object-contain opacity-70"
            unoptimized
          />
        </div>
        {/* ...no animated coins... */}
        <div className="w-full flex flex-col items-center md:items-start text-center md:text-left mt-2 md:mt-36">
          <h1 className={`text-4xl md:text-6xl font-normal leading-tight mb-4 text-white drop-shadow-xl z-10 relative ${heroInView ? "animate-fade-slide-up" : "opacity-0"}`}>
            Intelligent Crypto Insights,<br className="hidden md:inline" /> Driven by Next-Level AI
          </h1>
          <p className={`text-lg md:text-xl text-white/80 mb-8 max-w-2xl z-10 relative ${heroInView ? "animate-fade-slide-up delay-200" : "opacity-0"}`}>
            Where Artificial Intelligence Meets Financial Precision.
          </p>
          <div className="flex flex-row flex-wrap gap-3 mb-12 z-10 relative w-full justify-center md:justify-start">
            <Link href="/waitlist" className="flex-1 min-w-[120px] max-w-[180px] md:flex-none md:min-w-0 md:max-w-none flex justify-center md:block" scroll={true}>
              <button className="w-full md:w-auto px-4 py-2 md:px-7 md:py-3 rounded-xl font-semibold text-sm md:text-base bg-gradient-to-r from-[#0026FF] to-[#0026FF] text-white shadow-lg border-2 border-white/20 hover:from-[#0026FF] hover:to-blue-500 transition">
                Join Waitlist
              </button>
            </Link>
            <button className="flex-1 min-w-[120px] max-w-[180px] md:flex-none md:min-w-0 md:max-w-none w-full md:w-auto px-4 py-2 md:px-7 md:py-3 rounded-xl font-semibold text-sm md:text-base bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 transition flex items-center gap-2">
              Explore Products <span className="text-lg">›</span>
            </button>
          </div>
        </div>
        {/* Mobile rolling coin below hero content */}
        <div className="block md:hidden relative pointer-events-none" style={{ height: '400px', overflow: 'visible' }}>
          <Image
            src="/images/rollingcoin.gif"
            alt="Rolling coin"
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
      <section ref={valueRef} className="w-full px-4 flex flex-col items-center -mt-6 md:mt-52 mx-auto">
        <span className="mb-2 px-4 py-1 rounded-full border border-blue-400 text-blue-300 text-sm font-medium bg-[#0a0a1a]">Value</span>
        <h2 className={`text-3xl md:text-5xl font-normal mb-2 text-white text-center ${valueInView ? "animate-fade-slide-up" : "opacity-0"}`}>Crypto Made Simple. Safe. Smart.</h2>
        <p className={`text-base md:text-lg text-white/70 mb-8 text-center max-w-xl ${valueInView ? "animate-fade-slide-up delay-200" : "opacity-0"}`}>
          Manage, protect, and grow your digital assets with AI-powered insights, robust security, and seamless spending all in one platform.
        </p>
        <div className="flex flex-row md:grid md:grid-cols-3 gap-3 md:gap-6 w-full max-w-5xl mx-auto">
          <div className="rounded-lg md:rounded-2xl bg-[linear-gradient(180deg,_#3F3C4B_0%,_#0B111E_100%)] p-3 md:p-8 flex flex-col items-center justify-center shadow-lg min-h-20 md:min-h-48 w-1/3 md:w-auto">
            <span className="text-base md:text-3xl font-medium mb-1 md:mb-2">Confidence</span>
          </div>
          <div className="rounded-lg md:rounded-2xl bg-[linear-gradient(180deg,_#3F3C4B_0%,_#0B111E_100%)] p-3 md:p-8 flex flex-col items-center justify-center shadow-lg min-h-20 md:min-h-48 w-1/3 md:w-auto">
            <span className="text-base md:text-3xl font-medium mb-1 md:mb-2">Clarity</span>
          </div>
          <div className="rounded-lg md:rounded-2xl bg-[linear-gradient(180deg,_#3F3C4B_0%,_#0B111E_100%)] p-3 md:p-8 flex flex-col items-center justify-center shadow-lg min-h-20 md:min-h-48 w-1/3 md:w-auto">
            <span className="text-base md:text-3xl font-medium mb-1 md:mb-2">Convenience</span>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section ref={featuresRef} className="w-full px-4 py-20 flex flex-col items-start bg-white md:mt-52 mt-10">
        {/* Mobile Features Section */}
        <div className="block md:hidden w-full">
          <span className="px-4 py-1 rounded-full border border-blue-400 text-blue-500 text-sm font-medium bg-transparent mb-6 inline-block">Features</span>
          <h2 className={`text-4xl font-normal text-black mb-4 ${featuresInView ? "animate-fade-slide-up" : "opacity-0"}`}>Crypto Made Simple.<br/>Safe. Smart.</h2>
          <p className={`text-base text-black mb-6 ${featuresInView ? "animate-fade-slide-up delay-200" : "opacity-0"}`}>Manage, protect, and grow your digital assets with AI-powered insights, robust security, and seamless spending all in one platform.</p>
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
          <div className="flex w-full md:justify-start md:ml-40">
            <span className="px-4 py-1 rounded-full border border-blue-400 text-blue-500 text-sm font-medium bg-transparent mb-20 inline-block">Features</span>
          </div>
          <div className="w-full flex flex-row items-center mb-8" style={{marginTop: '-1.5rem'}}>
            <h2 className={`text-3xl md:text-5xl font-medium text-black text-left max-w-2xl ml-40 ${featuresInView ? "animate-fade-slide-up" : "opacity-0"}`}>Crypto Made Simple. Safe. Smart.</h2>
            <div className="flex-1"></div>
            <p className={`text-lg md:text-2xl text-gray-600 text-left max-w-2xl mr-10 ${featuresInView ? "animate-fade-slide-up delay-200" : "opacity-0"}`}>
              Manage, protect, and grow your digital assets with AI-powered insights, robust security, and seamless spending all in one platform.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
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
    </main>
  );
}
