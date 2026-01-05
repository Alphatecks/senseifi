export default function Hero() {
  const users = [
    { id: 1, avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 3, avatar: 'https://i.pravatar.cc/150?img=8' },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-0 md:pt-0 pb-10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('/images/rollingcoin.gif')] bg-[length:55%] bg-center bg-no-repeat opacity-10 md:opacity-20"
          aria-hidden
        />
        <div className="absolute inset-0 starfield opacity-100 z-0" aria-hidden />
        <div className="absolute inset-0 md:hidden flex items-center justify-center pointer-events-none translate-y-10 -z-20">
          <div className="relative w-40 h-40">
            <img
              src="/images/footer%20coin.png"
              alt="SenseiFi coin backdrop"
              className="absolute inset-0 w-full h-full object-contain opacity-20"
              loading="lazy"
            />
          </div>
        </div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#0026FF]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-10 right-1/4 w-[36rem] h-[36rem] bg-[radial-gradient(circle_at_center,_rgba(0,38,255,0.24),_rgba(0,38,255,0)_68%)] blur-3xl -z-20"></div>
      </div>

      <div className="relative z-30 max-w-4xl mx-auto px-6 text-center -mt-28 md:-mt-12">
        {/* Main heading */}
        <h1
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-medium text-white mb-6 tracking-tight leading-tight mix-blend-normal drop-shadow-[0_3px_16px_rgba(255,255,255,0.5)] relative z-40"
          style={{ color: '#ffffff' }}
        >
          Be First. <span className="text-white mix-blend-normal">Move Smarter.</span>
        </h1>

        {/* Description */}
        <p className="text-white text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
          SenseiFi is launching in limited waves. Join the waiting list to unlock early access to AI-powered trading intelligence, security tools, and exclusive launch benefits.
        </p>

        {/* Email input and CTA */}
        <div className="relative w-full max-w-2xl mx-auto mb-12">
          <input 
            type="email" 
            placeholder="Enter email" 
            className="w-full min-w-64 h-16 px-6 pr-44 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/25 shadow-[0_8px_30px_rgba(0,0,0,0.35)] text-white placeholder-white/75 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition"
          />
          <button className="absolute top-1/2 right-2 -translate-y-1/2 bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 text-white px-6 md:px-7 py-3 rounded-2xl font-medium transition shadow-lg border-2 border-white whitespace-nowrap">
            Join wait list
          </button>
        </div>

        {/* User avatars and count */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex -space-x-3">
            {users.map((user) => (
              <img
                key={user.id}
                src={user.avatar}
                alt="User avatar"
                className="w-10 h-10 rounded-full border-2 border-[#0a0a1a]"
              />
            ))}
          </div>
          <div className="text-left">
            <p className="text-white font-semibold">2k+</p>
            <p className="text-gray-400 text-sm">Registered Users</p>
          </div>
        </div>
      </div>
    </section>
  );
}
