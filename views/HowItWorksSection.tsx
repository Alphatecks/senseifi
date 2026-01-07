import React from "react";
import Image from "next/image";

export default function HowItWorksSection() {
  return (
    <section className="w-full py-24 bg-black text-white flex flex-col items-center">
      <div className="w-full flex flex-row justify-between items-start mb-16">
        <div className="flex flex-col items-start ml-40">
          <span className="px-4 py-1 rounded-full border border-blue-400 text-blue-300 text-sm font-medium bg-transparent mb-8">How it works</span>
          <h2 className="text-4xl md:text-5xl font-normal mb-4 leading-tight">From Secure to Smart<br />to Seamless</h2>
        </div>
        <div className="max-w-xl text-white/70 text-xl md:text-2xl mt-2 mr-20">
          Protect your crypto, trade with intelligence, and spend effortlessly.<br />SenseiFi guides you every step of the way.
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="rounded-2xl bg-[#181c2a] p-8 flex flex-col items-start justify-start shadow-lg min-h-80 border border-white/10 w-full max-w-[420px]">
          <Image src="/images/why01.png" alt="Secure Wallet" width={320} height={210} className="mb-12" />
          <div className="flex items-center mb-2">
            <span className="text-base text-blue-300 font-medium mr-2">01</span>
            <span className="text-xl font-semibold">Secure Your Wallet</span>
          </div>
          <p className="text-white/70 text-base mt-2">Activate SenseiGuard to monitor your assets, detect threats, and protect your crypto in real time.</p>
        </div>
        <div className="rounded-2xl bg-[#181c2a] p-8 flex flex-col items-start justify-start shadow-lg min-h-80 border border-white/10 w-full max-w-[420px]">
          <Image src="/images/why02.png" alt="Trade Smarter" width={320} height={210} className="mb-12" />
          <div className="flex items-center mb-2">
            <span className="text-base text-blue-300 font-medium mr-2">02</span>
            <span className="text-xl font-semibold">Trade Smarter with AI</span>
          </div>
          <p className="text-white/70 text-base mt-2">Use SenseiTrade for AI-powered signals, trend alerts, and portfolio optimization tailored to your strategy.</p>
        </div>
        <div className="rounded-2xl bg-[#181c2a] p-8 flex flex-col items-start justify-start shadow-lg min-h-80 border border-white/10 w-full max-w-[420px]">
          <Image src="/images/why03.png" alt="Spend & Manage" width={320} height={210} className="mb-12" />
          <div className="flex items-center mb-2">
            <span className="text-base text-blue-300 font-medium mr-2">03</span>
            <span className="text-xl font-semibold">Spend & Manage Seamlessly</span>
          </div>
          <p className="text-white/70 text-base mt-2">Pay anywhere online, track subscriptions, and monitor your spending with SenseiCard and SenseiDashboard.</p>
        </div>
      </div>
    </section>
  );
}
