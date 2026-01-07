import Image from 'next/image';

export default function CenteredAppDownload() {
  return (
    <section className="w-full flex justify-center items-center py-16 bg-black" style={{ background: '#000' }}>
      <div className="relative w-full max-w-6xl rounded-2xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#0c1026]/90 via-[#0a1c4f]/80 to-[#0c1435]/80">
        {/* Left: Text and buttons */}
        <div className="flex-1 flex flex-col justify-center items-start px-8 py-10 md:py-16 md:ml-6 lg:ml-10 mt-4">
          <h2 className="text-3xl md:text-4xl font-medium text-white mb-6 leading-snug">
            Download for seamless<br />web3 experience
          </h2>
          <div className="flex gap-4 mt-2">
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
        {/* Right: Coin graphic */}
        <div className="hidden md:flex flex-1 justify-end items-start pr-8 relative" style={{ zIndex: 2, height: '100%' }}>
          <div className="absolute -top-64 right-0">
            <Image
              src="/images/footer%20coin.png"
              alt="SenseiFi coin"
              width={420}
              height={600}
              className="drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
