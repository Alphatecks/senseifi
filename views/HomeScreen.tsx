"use client";
import FAQSection from "./FAQSection";
import React from "react";
import Image from "next/image";
import HowItWorksSection from "./HowItWorksSection";
import WhyTrustSection from "./WhyTrustSection";
import CenteredAppDownload from "./CenteredAppDownload";

export default function HomeScreen() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0a0a1a] to-[#181c2a] text-white flex flex-col">
      {/* Header spacing */}
      <div className="h-20" />
      {/* Additional spacing */}
      <div className="h-20" />
      {/* Hero Section */}
      <section className="w-full flex flex-col items-start text-left relative overflow-visible pl-9 md:pl-40">
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
        {/* Rolling coin on extreme right */}
        <div className="absolute right-0 -top-20 md:-top-48 w-[28rem] h-[28rem] md:w-[64rem] md:h-[64rem] z-50 pointer-events-none">
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
        <h1 className="text-4xl md:text-6xl font-normal leading-tight mb-4 mt-36 text-white drop-shadow-xl z-10 relative">
          Intelligent Crypto Insights,<br className="hidden md:inline" /> Driven by Next-Level AI
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl z-10 relative">
          Where Artificial Intelligence Meets Financial Precision.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-12 z-10 relative">
          <a href="/waitlist">
            <button className="px-7 py-3 rounded-xl font-semibold text-base bg-gradient-to-r from-[#0026FF] to-blue-400 text-white shadow-lg border-2 border-white/20 hover:from-[#0026FF] hover:to-blue-500 transition">
              Join Waitlist
            </button>
          </a>
          <button className="px-7 py-3 rounded-xl font-semibold text-base bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 transition flex items-center gap-2">
            Explore Products <span className="text-lg">›</span>
          </button>
        </div>
      </section>
      {/* Value Section */}
      <section className="w-full px-4 flex flex-col items-center mt-52 mx-auto">
        <span className="mb-2 px-4 py-1 rounded-full border border-blue-400 text-blue-300 text-sm font-medium bg-[#0a0a1a]">Value</span>
        <h2 className="text-2xl md:text-4xl font-normal mb-2 text-white text-center">Crypto Made Simple. Safe. Smart.</h2>
        <p className="text-base md:text-lg text-white/70 mb-8 text-center max-w-xl">
          Manage, protect, and grow your digital assets with AI-powered insights, robust security, and seamless spending all in one platform.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
          <div className="rounded-2xl bg-[#23263a]/80 p-8 flex flex-col items-center justify-center shadow-lg min-h-48">
            <span className="text-3xl font-semibold mb-2">Confidence</span>
          </div>
          <div className="rounded-2xl bg-[#23263a]/80 p-8 flex flex-col items-center justify-center shadow-lg min-h-48">
            <span className="text-3xl font-semibold mb-2">Clarity</span>
          </div>
          <div className="rounded-2xl bg-[#23263a]/80 p-8 flex flex-col items-center justify-center shadow-lg min-h-48">
            <span className="text-3xl font-semibold mb-2">Convenience</span>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="w-full px-4 py-20 flex flex-col items-start bg-white mt-52">
        <div className="ml-40">
          <span className="px-4 py-1 rounded-full border border-blue-400 text-blue-500 text-sm font-medium bg-transparent mb-20 block">Features</span>
        </div>
        <div className="w-full flex flex-row items-center mb-8" style={{marginTop: '-1.5rem'}}>
          <h2 className="text-3xl md:text-5xl font-medium text-black text-left max-w-2xl ml-40">Crypto Made Simple. Safe. Smart.</h2>
          <div className="flex-1"></div>
          <p className="text-lg md:text-2xl text-gray-600 text-left max-w-2xl mr-10">
            Manage, protect, and grow your digital assets with AI-powered insights, robust security, and seamless spending all in one platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          <div className="w-full flex justify-center items-center">
            <Image
              src="/images/senseitrade.gif"
              alt="Sensei Trade"
              width={800}
              height={800}
              className="object-contain w-[22rem] h-[22rem] md:w-[28rem] md:h-[28rem]"
              unoptimized
            />
          </div>
          <div className="w-full flex justify-center items-center">
            <Image
              src="/images/senseiguard.gif"
              alt="Sensei Guard"
              width={800}
              height={800}
              className="object-contain w-[22rem] h-[22rem] md:w-[28rem] md:h-[28rem]"
              unoptimized
            />
          </div>
          <div className="w-full flex justify-center items-center">
            <Image
              src="/images/senseicard.gif"
              alt="Sensei Card"
              width={800}
              height={800}
              className="object-contain w-[22rem] h-[22rem] md:w-[28rem] md:h-[28rem]"
              unoptimized
            />
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
