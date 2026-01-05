import Image from 'next/image';

export default function AppDownload() {
  return (
    <section className="relative px-4 pt-0 pb-8 md:pt-3 md:pb-12 -mt-28 md:-mt-40">
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
    </section>
  );
}
