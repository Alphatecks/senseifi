import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#060812] text-white px-0 py-10 md:py-14">
      <div className="w-full flex flex-col md:flex-row md:items-start md:justify-between gap-8 pl-9 pr-6 md:pl-40 md:pr-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Image src="/images/logowhite.png" alt="SenseiFi" width={36} height={36} />
            <span className="text-xl font-semibold">SenseiFi</span>
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-[0.18em] text-white/70 mb-4">Explore</h3>
            <ul className="space-y-3 text-white/80 text-sm">
              <li><a href="#" className="hover:text-white transition">Home</a></li>
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 md:items-start md:text-left flex flex-col md:justify-start">
          <div>
            <h3 className="text-sm uppercase tracking-[0.18em] text-white/70 mb-4">Follow Us</h3>
            <div className="flex gap-3 justify-start items-center">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent">
                <Image src="/images/x.svg" alt="X" width={20} height={20} />
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent">
                <Image src="/images/instagram-white.svg" alt="Instagram" width={20} height={20} />
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent">
                <Image src="/images/linkedin-white.svg" alt="LinkedIn" width={20} height={20} />
              </span>
            </div>
          </div>

          <div className="flex w-full md:w-[320px] items-center gap-2 bg-white/05 border border-white/10 rounded-full px-3 py-2">
            <input
              type="email"
              placeholder="Enter your Email"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/60 focus:outline-none"
            />
            <button className="rounded-full bg-white text-[#0a0a1a] text-sm font-semibold px-4 py-2 hover:bg-white/90 transition">
              Sign up
            </button>
          </div>
        </div>
      </div>

      <div className="w-full mt-10 border-t border-white/10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/60 pl-9 pr-6 md:pl-40 md:pr-8">
        <span>©2025 SenseiFi. All Rights Reserved.</span>
        <a href="#" className="hover:text-white transition">Terms &amp; Condition</a>
      </div>
    </footer>
  );
}
