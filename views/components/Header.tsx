import Image from 'next/image';

export default function Header() {
  return (
    <header className="fixed w-full top-0 z-50 bg-gradient-to-b from-[#0a0a1a] via-[#0a0a1a] to-transparent">
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-white font-bold text-lg">SenseiFi</span>
        </div>
        
        <ul className="hidden md:flex items-center gap-8 text-gray-300">
          <li><a href="#" className="hover:text-white transition">Home</a></li>
          <li><a href="#" className="hover:text-white transition">About</a></li>
          <li><a href="#" className="hover:text-white transition">Pricing</a></li>
          <li><a href="#" className="hover:text-white transition">Features</a></li>
          <li><a href="#" className="hover:text-white transition">Contact</a></li>
        </ul>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
          Get started
        </button>
      </nav>
    </header>
  );
}
