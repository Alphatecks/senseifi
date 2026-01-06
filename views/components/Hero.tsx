"use client";

import { useEffect, useState } from 'react';

export default function Hero() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);
  const users = [
    { id: 1, avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 3, avatar: 'https://i.pravatar.cc/150?img=8' },
  ];

  return (
    <section className="min-h-[75vh] md:min-h-screen flex items-center justify-center relative overflow-hidden pt-4 md:pt-0 pb-8 md:pb-10 bg-[#0a0a1a]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('/images/rollingcoin.gif')] bg-[length:140%] md:bg-[length:55%] bg-center bg-no-repeat opacity-10 md:opacity-20"
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

      <div className="relative z-30 max-w-4xl mx-auto px-6 text-center mt-6 md:-mt-12">
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
        <form
          className="relative w-full max-w-2xl mx-auto mb-12"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const email = formData.get('email');
            if (!email || typeof email !== 'string') return;
            setLoading(true);
            setToast(null);
            try {
              const res = await fetch('https://formspree.io/f/mvzgnqge', {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: formData,
              });
              if (res.ok) {
                form.reset();
                setToast({ message: 'Successfully joined the waitlist!', type: 'success' });
              } else {
                setToast({ message: 'Unable to submit right now. Please try again.', type: 'error' });
              }
            } catch (err) {
              setToast({ message: 'Network error. Please try again.', type: 'error' });
            } finally {
              setLoading(false);
            }
          }}
        >
          <input 
            type="email" 
            name="email"
            placeholder="Enter email" 
            required
            className="w-full min-w-64 h-16 px-6 pr-44 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/25 shadow-[0_8px_30px_rgba(0,0,0,0.35)] text-white placeholder-white/75 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 md:px-7 py-3 rounded-2xl font-medium transition shadow-lg border-2 border-white whitespace-nowrap flex items-center gap-2"
          >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" aria-hidden />}
            Join wait list
          </button>
        </form>

        {toast && (
          <div className="fixed top-20 left-0 right-0 z-50 px-4 flex justify-center" role="status" aria-live="polite">
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-2xl border backdrop-blur-sm transition duration-500 ease-out ${toast.type === 'success' ? 'bg-blue-500/25 border-blue-300/50' : 'bg-blue-500/25 border-blue-300/50'}`}
            >
              {toast.message}
            </div>
          </div>
        )}

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
