import React from "react";
import Image from "next/image";

export default function WhyTrustSection() {
  return (
    <section className="w-full py-24 bg-black text-white flex flex-col items-center">
      {/* Mobile Why Section Header - matches screenshot, does NOT affect desktop */}
      <div className="block md:hidden w-full flex flex-col items-center justify-center mb-8 mt-2">
        <span className="px-4 py-1 rounded-full border border-blue-400 text-blue-300 text-sm font-medium bg-transparent mb-4 text-center">Why</span>
        <h2 className="text-2xl font-normal text-center mb-3 leading-snug">Why Traders Trust<br/>SenseiFi</h2>
        <p className="text-xs text-white/70 text-center max-w-xs mb-4">A complete DeFi platform designed to keep your assets secure, your trades smart, and your spending seamless.</p>
        <Image src="/images/frame1.png" alt="Frame 1" width={320} height={160} className="mx-auto mb-4 w-full max-w-xs" />
        <Image src="/images/frame2.png" alt="Frame 2" width={320} height={160} className="mx-auto mb-4 w-full max-w-xs" />
        <Image src="/images/frame3.png" alt="Frame 3" width={320} height={160} className="mx-auto mb-4 w-full max-w-xs" />
        <Image src="/images/frame4.png" alt="Frame 4" width={320} height={160} className="mx-auto mb-4 w-full max-w-xs" />
      </div>
      {/* Desktop Why Section Header - untouched */}
      <div className="hidden md:block w-full">
        <div className="flex justify-center w-full">
          <span className="px-6 py-2 rounded-full border border-blue-400 text-blue-300 text-lg font-medium bg-transparent mt-4 mb-2 text-center">Why</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-normal mb-6 text-center">Why Traders Trust SenseiFi</h2>
        <p className="text-base md:text-lg text-white/70 mb-16 text-center max-w-3xl mx-auto">
          A complete DeFi platform designed to keep your assets secure, your trades smart, and your spending seamless.
        </p>
      </div>
      <div className="relative flex flex-col items-center w-full">
        <div className="hidden md:block">
          <Image src="/images/cross.svg" alt="Cross" width={1200} height={1200} />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 mt-40 md:mt-56 w-full flex flex-col items-center">
            <div className="flex items-center justify-center text-white font-normal text-2xl mb-2 gap-2">
              <Image src="/images/icons/flash.png" alt="Flash" width={28} height={28} />
              <span>Unmatched Speed</span>
            </div>
            <div className="text-white/70 text-base text-center max-w-xs">Quick transactions, instant insights, and rapid access to your assets.</div>
          </div>
          {/* Bottom card inside cross */}
          <div className="absolute left-1/2 bottom-0 translate-x-[-50%] mb-4 md:mb-12 w-[220px] flex flex-col items-center">
            <div className="flex items-center justify-center text-white font-normal text-xl mb-2 gap-2">
              <Image src="/images/icons/flash.png" alt="Flash" width={24} height={24} />
              <span>Smart Automation</span>
            </div>
            <div className="text-white/70 text-base text-center max-w-xs">Automated trading tools and portfolio management for smarter decisions.</div>
          </div>
          {/* Left side card inside cross */}
          <div className="absolute top-1/2 left-0 translate-y-1/4 ml-64 md:ml-96 w-[220px] flex flex-col items-center" style={{ marginRight: '120px' }}>
            <div className="flex items-center justify-center text-white font-normal text-xl mb-2 gap-2">
              <Image src="/images/icons/flash.png" alt="Flash" width={24} height={24} />
              <span>Seamless Spending</span>
            </div>
            <div className="text-white/70 text-base text-center max-w-xs">Instant crypto payments and subscription management.</div>
          </div>
          {/* Right side card inside cross */}
          <div className="absolute top-1/2 right-0 translate-y-1/4 mr-64 md:mr-96 w-[220px] flex flex-col items-center" style={{ marginLeft: '120px' }}>
            <div className="flex items-center justify-center text-white font-normal text-xl mb-2 gap-2">
              <Image src="/images/icons/flash.png" alt="Flash" width={24} height={24} />
              <span>Advanced Security</span>
            </div>
            <div className="text-white/70 text-base text-center max-w-xs">Multi-layered wallet protection and real-time threat alerts.</div>
          </div>
        </div>
      </div>
      {/* Get Started button beneath the cross */}
      <div className="flex justify-center mt-16">
        {/* Desktop button: #0026FF, mobile unchanged */}
        <button className="hidden md:inline-block px-8 py-3 bg-[#0026FF] hover:bg-blue-700 text-white text-lg rounded-md shadow-lg transition-colors duration-200">
          <span className="font-normal">Get Started</span>
        </button>
        <button className="inline-block md:hidden px-8 py-3 bg-[#0026FF] hover:bg-blue-700 text-white text-lg rounded-md shadow-lg transition-colors duration-200">
          <span className="font-normal">Get Started</span>
        </button>
      </div>
    {/* Testimonials Section */}
    {/* Mobile Loved by Users Section */}
    <section className="block md:hidden w-full py-16 bg-black text-white flex flex-col items-start">
      <span className="px-4 py-1 rounded-full border border-blue-400 text-blue-300 text-sm font-medium bg-transparent mb-4 ml-4">Why</span>
      <h2 className="text-2xl font-normal mb-4 leading-snug ml-4 text-left">Loved by Users Around<br/>the World</h2>
      <div className="flex flex-row items-center justify-start gap-4 mb-6 w-full pl-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#181C23] text-white"><span className="text-2xl">&#8592;</span></button>
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0026FF] text-white"><span className="text-2xl">&#8594;</span></button>
      </div>
      <div className="flex flex-row gap-4 overflow-x-auto flex-nowrap hide-scrollbar w-full pl-4 pr-2 mb-4">
        {/* Card 1: Rating and CTA */}
        <div className="bg-[#181C23] rounded-2xl p-6 flex flex-col justify-between min-w-[280px] max-w-xs w-4/5">
          <div>
            <div className="flex items-center text-2xl font-medium mb-2">4.7 <img src="/images/icons/star.png" alt="star" className="ml-2 w-5 h-5 inline-block" /></div>
            <div className="text-white/80 mb-6 text-base">Real feedback from crypto traders and enthusiasts who trust SenseiFi to manage, protect, and grow their digital assets.</div>
          </div>
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=64&h=64&facepad=2" alt="avatar1" className="w-7 h-7 rounded-full border-2 border-white -ml-0 object-cover" />
              <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=64&h=64&facepad=2" alt="avatar2" className="w-7 h-7 rounded-full border-2 border-white -ml-3 object-cover" />
              <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=64&h=64&facepad=2" alt="avatar3" className="w-7 h-7 rounded-full border-2 border-white -ml-3 object-cover" />
              <img src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=64&h=64&facepad=2" alt="avatar4" className="w-7 h-7 rounded-full border-2 border-white -ml-3 object-cover" />
            </div>
            <span className="text-[10px] text-white/60 ml-3">Used by 50,000+ calm souls worldwide</span>
          </div>
          <button className="w-full py-3 bg-white text-[#0026FF] text-base rounded-md transition-colors duration-200 font-medium">Get Started Now</button>
        </div>
        {/* Card 2: Testimonial */}
        <div className="bg-[#181C23] rounded-2xl p-6 flex flex-col justify-between min-w-[280px] max-w-xs w-4/5">
          <div className="text-white/90 text-lg mb-8">“SenseiFi completely changed how I manage my crypto. The AI signals are spot-on, and I feel secure knowing my wallet is protected.”</div>
          <div className="flex items-center mt-auto">
            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=256&h=256&facepad=2" alt="Sofia Melendez" className="w-12 h-12 rounded-full mr-3 object-cover" />
            <span className="text-white/80 text-sm mr-2">Sofia Melendez</span>
            <span className="text-yellow-400 text-base">&#11088;&#11088;&#11088;&#11088;&#11088;</span>
            <span className="ml-auto text-3xl text-white/30">&#10077;</span>
          </div>
        </div>
        {/* Card 3: Testimonial */}
        <div className="bg-[#181C23] rounded-2xl p-6 flex flex-col justify-between min-w-[280px] max-w-xs w-4/5">
          <div className="text-white/90 text-lg mb-8">“I love using the SenseiFi Dashboard together with the AI tracking subscriptions. Nothing is easier or faster.”</div>
          <div className="flex items-center mt-auto">
            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&w=256&h=256&facepad=2" alt="Noah Brunton" className="w-12 h-12 rounded-full mr-3 object-cover" />
            <span className="text-white/80 text-sm mr-2">Noah Brunton</span>
            <span className="text-yellow-400 text-base">&#11088;&#11088;&#11088;&#11088;&#11088;</span>
            <span className="ml-auto text-3xl text-white/30">&#10077;</span>
          </div>
        </div>
      </div>
    </section>
    {/* Desktop Loved by Users Section */}
    <section className="hidden md:flex w-full py-24 bg-black text-white flex-col items-center">
      <div className="w-full flex flex-col items-start mb-6 ml-80">
        <span className="px-6 py-2 rounded-full border border-blue-400 text-blue-300 text-lg font-medium bg-transparent mt-4 mb-6">Why</span>
        <h2 className="text-3xl md:text-5xl font-normal text-left">Loved by Users Around the World</h2>
      </div>
      <div className="flex items-center justify-end w-full max-w-6xl mb-8 gap-2">
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#181C23] text-white"><span className="text-2xl">&#8592;</span></button>
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0026FF] text-white"><span className="text-2xl">&#8594;</span></button>
      </div>
      <div className="flex flex-row gap-6 w-full max-w-6xl">
        {/* Card 1: Rating and CTA */}
        <div className="bg-[#181C23] rounded-xl p-8 flex flex-col justify-between min-h-[440px] w-1/3">
          <div>
            <div className="flex items-center text-3xl font-medium mb-2">4.7 <img src="/images/icons/star.png" alt="star" className="ml-2 w-6 h-6 inline-block" /></div>
            <div className="text-white/80 mb-8">Real feedback from crypto traders and enthusiasts who trust SenseiFi to manage, protect, and grow their digital assets.</div>
          </div>
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=64&h=64&facepad=2" alt="avatar1" className="w-8 h-8 rounded-full border-2 border-white -ml-0 object-cover" />
              <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=64&h=64&facepad=2" alt="avatar2" className="w-8 h-8 rounded-full border-2 border-white -ml-3 object-cover" />
              <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=64&h=64&facepad=2" alt="avatar3" className="w-8 h-8 rounded-full border-2 border-white -ml-3 object-cover" />
              <img src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=64&h=64&facepad=2" alt="avatar4" className="w-8 h-8 rounded-full border-2 border-white -ml-3 object-cover" />
            </div>
            <span className="text-xs text-white/60 ml-4">Used by 50,000+ calm souls worldwide</span>
          </div>
          <button className="w-full py-3 bg-white text-blue-600 text-base rounded-md transition-colors duration-200">Get Started Now</button>
        </div>
        {/* Card 2: Testimonial */}
        <div className="bg-[#181C23] rounded-xl p-8 flex flex-col justify-between min-h-[440px] w-1/3">
          <div className="text-white/90 text-lg mb-8">“SenseiFi completely changed how I manage my crypto. The AI signals are spot-on, and I feel secure knowing my wallet is protected.”</div>
            <div className="flex items-center mt-auto">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=256&h=256&facepad=2" alt="Sofia Melendez" className="w-12 h-12 rounded-full mr-3 object-cover" />
              <span className="text-white/80 text-sm mr-2">Sofia Melendez</span>
              <span className="text-yellow-400 text-base">&#11088;&#11088;&#11088;&#11088;&#11088;</span>
              <span className="ml-auto text-3xl text-white/30">&#10077;</span>
            </div>
        </div>
        {/* Card 3: Testimonial */}
        <div className="bg-[#181C23] rounded-xl p-8 flex flex-col justify-between min-h-[440px] w-1/3">
          <div className="text-white/90 text-lg mb-8">“I love using the SenseiFi Dashboard together with the AI tracking subscriptions. Nothing is easier or faster.”</div>
            <div className="flex items-center mt-auto">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&w=256&h=256&facepad=2" alt="Noah Brunton" className="w-12 h-12 rounded-full mr-3 object-cover" />
              <span className="text-white/80 text-sm mr-2">Noah Brunton</span>
              <span className="text-yellow-400 text-base">&#11088;&#11088;&#11088;&#11088;&#11088;</span>
              <span className="ml-auto text-3xl text-white/30">&#10077;</span>
            </div>
        </div>
      </div>
    </section>
    {/* Pricing Section */}
    <section className="w-full py-24 bg-black text-white flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-normal mb-16 text-center">Pick your perfect plan</h2>
          <div className="flex flex-col md:flex-row gap-y-6 md:gap-y-0 md:gap-8 w-full max-w-6xl justify-center">
            {/* PRO PLAN */}
            <div className="bg-[#181C23] rounded-xl flex flex-col max-w-sm w-10/12 md:min-w-[380px] md:max-w-[400px] min-h-[600px] md:w-full shadow-lg mx-auto">
                  <div className="flex items-center justify-between mb-0 p-8 pb-0">
                <span className="text-lg font-semibold">PRO PLAN</span>
                <img src="/images/icons/pro.png" alt="Pro" className="w-16 h-16" />
              </div>
                  <hr className="border-t border-white/10 w-full mb-0 mt-4" />
              <ul className="mb-8 space-y-4 text-white/80 text-base px-8 mt-8">
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Full wallet security scan</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Real-time threat & scam alerts</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />AI trading signals (standard)</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Portfolio health score</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Basic spending analytics</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Access to SenseiCard (limited transactions)</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Full Chrome Extension features</li>
              </ul>
              <div className="mt-auto">
                    <div className="bg-[#11131A] rounded-t-xl w-full flex flex-col items-start pl-8">
                      <span className="text-3xl font-normal text-white mt-6">$30USD<span className="text-base font-normal text-white/70">/month</span></span>
                     <button className="w-11/12 py-3 mt-6 mb-6 text-white text-base font-normal rounded-full transition-colors duration-200 border-2 border-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-origin-border hover:from-blue-500 hover:to-indigo-600" style={{background: 'linear-gradient(#181C23, #181C23) padding-box, linear-gradient(90deg, #7F5FFF, #01C8FF, #FFB86C) border-box', border: '2px solid transparent'}}>
                    Go Pro
                  </button>
                </div>
              </div>
            </div>
            {/* PRO+ PLAN */}
            <div className="bg-[#181C23] rounded-xl flex flex-col max-w-sm w-10/12 md:min-w-[380px] md:max-w-[400px] min-h-[600px] md:w-full shadow-lg border-2 border-blue-600 mx-auto">
                  <div className="flex items-center justify-between mb-0 p-8 pb-0">
                <span className="text-lg font-semibold">PRO+ PLAN <span className="text-xs text-blue-400 ml-2">(Recommended)</span></span>
                <img src="/images/icons/proplus.png" alt="Pro+" className="w-16 h-16" />
              </div>
                  <hr className="border-t border-white/10 w-full mb-0 mt-4" />
              <ul className="mb-8 space-y-4 text-white/80 text-base px-8 mt-8">
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Everything in Pro</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Advanced AI trading predictions</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Trend, momentum & sentiment analysis</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Portfolio optimization engine</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Priority conversion rates on SenseiCard</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Subscription management tools</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Multi-chain asset monitoring</li>
              </ul>
              <div className="mt-auto">
                    <div
                      className="rounded-t-xl w-full flex flex-col items-start pl-8 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #11131A 60%, #425EFF 100%)',
                      }}
                    >
                      <span className="text-3xl font-normal text-white mt-6">$50USD<span className="text-base font-normal text-white/70">/month</span></span>
                      <button
                        className="w-11/12 py-3 mt-6 mb-6 text-white text-base font-normal rounded-full shadow-lg transition-colors duration-200 border-none"
                        style={{
                          background: 'linear-gradient(135deg, #425EFF 40%, #7F5FFF 100%)',
                        }}
                      >
                        Go Pro+
                      </button>
                    </div>
              </div>
            </div>
            {/* PREMIUM PLAN */}
            <div className="bg-[#181C23] rounded-xl flex flex-col max-w-sm w-10/12 md:min-w-[380px] md:max-w-[400px] min-h-[600px] md:w-full shadow-lg mx-auto">
                  <div className="flex items-center justify-between mb-0 p-8 pb-0">
                <span className="text-lg font-semibold">PREMIUM PLAN</span>
                <img src="/images/icons/premium.png" alt="Premium" className="w-16 h-16" />
              </div>
                  <hr className="border-t border-white/10 w-full mb-0 mt-4" />
              <ul className="mb-8 space-y-4 text-white/80 text-base px-8 mt-8">
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Everything in Pro+</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Unlimited spending with SenseiCard</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Smart budgeting & auto-analytics</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />High-frequency AI alerts</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Wallet risk logs + breach history</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Instant multi-chain insights</li>
                <li className="flex items-center gap-3"><img src="/images/icons/check-circle.png" alt="check" className="w-5 h-5" />Priority customer support</li>
              </ul>
              <div className="mt-auto">
                    <div className="bg-[#11131A] rounded-t-xl w-full flex flex-col items-start pl-8">
                      <span className="text-3xl font-normal text-white mt-6">$200USD<span className="text-base font-normal text-white/70">/month</span></span>
                     <button className="w-11/12 py-3 mt-6 mb-6 text-white text-base font-normal rounded-full transition-colors duration-200 border-2 border-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-origin-border hover:from-blue-500 hover:to-indigo-600" style={{background: 'linear-gradient(#181C23, #181C23) padding-box, linear-gradient(90deg, #7F5FFF, #01C8FF, #FFB86C) border-box', border: '2px solid transparent'}}>
                    Get Premium
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
    </section>
  );
}
