export default function Hero() {
  const users = [
    { initials: 'AB', color: 'bg-blue-500' },
    { initials: 'CD', color: 'bg-purple-500' },
    { initials: 'EF', color: 'bg-pink-500' },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Main heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
          Be First. <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Move Smarter.</span>
        </h1>

        {/* Description */}
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
          SenseiFi is launching in limited waves. Join the waiting list to unlock early access to AI-powered trading intelligence, security tools, and exclusive launch benefits.
        </p>

        {/* Email input and CTA */}
        <div className="flex flex-col md:flex-row gap-3 justify-center mb-12">
          <input 
            type="email" 
            placeholder="Enter email" 
            className="px-6 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition min-w-64"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition whitespace-nowrap">
            Join wait list
          </button>
        </div>

        {/* User avatars and count */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex -space-x-3">
            {users.map((user, idx) => (
              <div
                key={idx}
                className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center text-white text-sm font-bold border-2 border-[#0a0a1a]`}
              >
                {user.initials[0]}
              </div>
            ))}
          </div>
          <div>
            <p className="text-white font-semibold">2k+</p>
            <p className="text-gray-400 text-sm">Registered Users</p>
          </div>
        </div>
      </div>
    </section>
  );
}
