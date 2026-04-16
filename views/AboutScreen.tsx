"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutScreen() {
  return (
    <main className="w-full bg-[#0a0a1a] text-white pt-32 md:pt-36 pb-20">
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
          <div className="rounded-[26px] border border-white/10 bg-[#0e1630] p-6 md:p-8 min-h-[360px] md:min-h-[420px] flex flex-col justify-between">
            <h2 className="text-4xl md:text-5xl font-normal leading-tight max-w-md">
              Built for a Smarter,
              <br />
              Safer Crypto Future
            </h2>
            <div className="mt-8 rounded-2xl overflow-hidden border border-white/10">
              <video
                src="/images/about%20mid%20gif.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-[180px] md:h-[220px] object-cover"
              />
            </div>
          </div>

          <div className="grid grid-rows-2 gap-5">
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
    </main>
  );
}

