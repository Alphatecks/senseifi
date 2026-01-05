import Image from 'next/image';

export default function AppDownload() {
  return (
    <section className="relative px-4 pt-0 pb-8 md:pt-3 md:pb-12 -mt-28 md:-mt-40 bg-[#0a0a1a]">
      {/* Mobile redesign */}
      <div className="md:hidden">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b1535] via-[#0f1f5a] to-[#183470] px-5 py-4 shadow-2xl">
          <div className="pointer-events-none absolute -left-10 top-6 h-28 w-28 rounded-full bg-blue-500/35 blur-2xl" />
          <div className="pointer-events-none absolute left-24 -bottom-10 h-24 w-48 rounded-full bg-[#2d5bff]/25 blur-3xl" />
          <div className="flex items-center">
            <div className="flex-1 text-white space-y-4 pr-3">
              <h2 className="text-[18px] font-medium leading-snug max-w-[210px]">
                Download for seamless
                <br />
                web3 experience
              </h2>
              <div className="flex items-center gap-3">
                <a href="#" className="inline-block transition hover:scale-[1.02] active:scale-[0.99]">
                  <Image
                    src="/images/playstore.png"
                    alt="Get it on Google Play"
                    width={140}
                    height={28}
                    className="h-[28px] w-auto"
                  />
                </a>
                <a href="#" className="inline-block transition hover:scale-[1.02] active:scale-[0.99]">
                  <Image
                    src="/images/applestore.png"
                    alt="Download on the App Store"
                    width={140}
                    height={28}
                    className="h-[28px] w-auto"
                  />
                </a>
              </div>
            </div>
            <div className="relative flex-none w-[160px] h-[140px] -mr-8">
              <div className="absolute inset-0 bg-gradient-to-b from-white/12 to-transparent blur-xl" />
              <Image
                src="/images/footer%20coin.png"
                alt="SenseiFi coin"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop unchanged */}
      <div className="hidden md:block">
        <div className="relative mx-auto max-w-6xl md:max-w-7xl overflow-visible rounded-3xl bg-gradient-to-r from-[#0c1026]/90 via-[#0a1c4f]/80 to-[#0c1435]/80 px-5 py-6 md:px-8 md:py-8 shadow-2xl">
          {/* Soft glow accents */}
          <div className="pointer-events-none absolute -right-12 top-6 h-40 w-40 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-10 h-48 w-48 rounded-full bg-[#0026FF]/20 blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Text and store badges */}
            <div className="text-white max-w-xl translate-x-8 md:translate-x-10">
              <h2 className="text-4xl md:text-5xl font-medium leading-tight mb-8">
                Download for seamless
                <br />
                web3 experience
              </h2>

              <div className="flex flex-wrap gap-4">
                <a href="#" className="inline-block transition hover:scale-[1.02]">
                  <Image
                    src="/images/playstore.png"
                    alt="Get it on Google Play"
                    width={170}
                    height={52}
                    className="h-[52px] w-auto"
                  />
                </a>
                <a href="#" className="inline-block transition hover:scale-[1.02]">
                  <Image
                    src="/images/applestore.png"
                    alt="Download on the App Store"
                    width={170}
                    height={52}
                    className="h-[52px] w-auto"
                  />
                </a>
              </div>
            </div>

            {/* Coin graphic */}
            <div className="relative w-full md:w-[380px] h-[240px] md:h-[260px] flex justify-center md:justify-end md:ml-auto overflow-visible">
              <div className="absolute -bottom-16 -left-20 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full" />
              <Image
                src="/images/footer%20coin.png"
                alt="SenseiFi coin"
                width={720}
                height={680}
                className="drop-shadow-2xl absolute -top-28 md:-top-36 right-0 md:right-2"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
