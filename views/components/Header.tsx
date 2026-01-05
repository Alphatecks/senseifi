import Image from 'next/image';

export default function Header() {
  return (
    <header className="fixed w-full top-0 z-50 bg-gradient-to-b from-[#0a0a1a] via-[#0a0a1a] to-transparent">
      <nav className="relative flex items-center justify-between w-full px-4 md:px-8 py-6">
        <div className="pointer-events-none absolute -left-16 top-0 h-[36rem] w-[36rem] bg-[radial-gradient(circle_at_center,_rgba(0,38,255,0.45),_rgba(0,38,255,0)_70%)] blur-3xl" />
        <div className="pointer-events-none absolute right-0 -top-12 h-[30rem] w-[30rem] bg-[radial-gradient(circle_at_center,_rgba(0,38,255,0.5),_rgba(0,38,255,0)_70%)] blur-3xl" />
        <div className="flex items-center gap-2 ml-9 md:ml-40">
          <Image 
            src="/images/logo.png" 
            alt="SenseiFi Logo" 
            width={32}
            height={32}
          />
          <span className="text-white font-medium text-lg">SenseiFi</span>
        </div>
        
        <ul className="hidden md:flex flex-1 items-center justify-center gap-10 text-gray-300">
          <li><a href="#" className="hover:text-white transition">Home</a></li>
          <li><a href="#" className="hover:text-white transition">About</a></li>
          <li><a href="#" className="hover:text-white transition">Pricing</a></li>
          <li><a href="#" className="hover:text-white transition">Features</a></li>
          <li><a href="#" className="hover:text-white transition">Contact</a></li>
        </ul>
        <div className="flex items-center gap-4 ml-0 mr-6 md:ml-auto md:mr-0">
          <button className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition" aria-label="Open menu">
            <span className="block w-6 h-0.5 bg-white mb-1" />
            <span className="block w-6 h-0.5 bg-white mb-1" />
            <span className="block w-6 h-0.5 bg-white" />
          </button>
          <button className="hidden md:inline-flex flex-none mr-0 md:mr-40 bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 text-white px-8 py-3 rounded-2xl font-medium transition shadow-lg border-2 border-white">
            Get started
          </button>
        </div>
      </nav>
    </header>
  );
}
