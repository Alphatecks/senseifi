import Image from 'next/image';

export default function AppDownload() {
  return (
    <section className="relative py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Download for seamless web3 experience
            </h2>
            
            <div className="flex gap-4">
              <a href="#" className="inline-block">
                <img 
                  src="/images/google-play.png" 
                  alt="Get it on Google Play" 
                  className="h-16 hover:opacity-80 transition"
                />
              </a>
              <a href="#" className="inline-block">
                <img 
                  src="/images/app-store.png" 
                  alt="Download on the App Store" 
                  className="h-16 hover:opacity-80 transition"
                />
              </a>
            </div>
          </div>

          {/* Right side - Phone mockup */}
          <div className="relative h-96 md:h-full flex items-center justify-center">
            <div className="absolute w-64 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
            <div className="relative">
              <div className="w-64 h-96 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl shadow-2xl flex items-center justify-center">
                <Image 
                  src="/images/sensei card.svg" 
                  alt="SenseiFi App" 
                  width={240}
                  height={360}
                  className="rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
