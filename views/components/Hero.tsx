"use client";

import { useEffect, useRef, useState } from 'react';

export default function Hero() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showAlreadyOnWaitlistModal, setShowAlreadyOnWaitlistModal] = useState(false);
  const [showReferralScoreModal, setShowReferralScoreModal] = useState(false);
  const [submittedEmails, setSubmittedEmails] = useState<string[]>([]);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [referralLink, setReferralLink] = useState('');
  const [xpValue, setXpValue] = useState<number | null>(null);
  const [xpProgressPercent, setXpProgressPercent] = useState(0);
  const [xpProgressAnimated, setXpProgressAnimated] = useState(0);
  const [successfulReferralsCount, setSuccessfulReferralsCount] = useState(0);
  const [referralScoreLoading, setReferralScoreLoading] = useState(false);
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref')?.trim();
    if (ref) {
      setReferralCodeFromUrl(ref);
      try {
        sessionStorage.setItem('senseifi_ref', ref);
      } catch { /* ignore */ }
    } else {
      try {
        const stored = sessionStorage.getItem('senseifi_ref');
        if (stored) setReferralCodeFromUrl(stored);
      } catch { /* ignore */ }
    }
  }, []);

  const openReferralScoreModal = async () => {
    const email = emailInputRef.current?.value?.trim();
    if (!email) {
      setToast({ message: 'Enter your email to view referral score.', type: 'error' });
      return;
    }
    setReferralScoreLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_WAITLIST_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://waitlist-82co.onrender.com';
      const res = await fetch(`${baseUrl}/referrals/by-email?email=${encodeURIComponent(email)}`);
      const data = await res.json().catch(() => ({}));
      console.log('[Referral score] API response', data);
      console.log('[Referral achievement] response', { status: res.status, statusText: res.statusText, data });
      if (res.ok && data) {
        const code = data.code ?? data.referral_code ?? null;
        let ref = code;
        if (!ref && data.referral_link) {
          try {
            if (data.referral_link.startsWith('?')) {
              ref = new URLSearchParams(data.referral_link.slice(1)).get('ref');
            } else {
              ref = new URL(data.referral_link).searchParams.get('ref');
            }
          } catch { /* ignore */ }
        }
        if (ref) setReferralLink(`https://senseifi.io?ref=${ref}`);
        setSuccessfulReferralsCount(typeof data.successfulCount === 'number' ? data.successfulCount : 0);
        if (typeof data.xp === 'number') {
          setXpValue(data.xp);
          // 1 referral = 100 XP; full bar = 20 referrals = 2000 XP
          const XP_PER_REFERRAL = 100;
          const XP_FULL_BAR = XP_PER_REFERRAL * 20;
          setXpProgressPercent(Math.min(100, Math.max(0, (data.xp / XP_FULL_BAR) * 100)));
        } else {
          setXpValue(null);
          setXpProgressPercent(0);
        }
        setXpProgressAnimated(0);
        setShowReferralScoreModal(true);
      } else {
        setToast({ message: data?.message || 'Could not load referral data.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setReferralScoreLoading(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Animate XP bar from 0 to current when modal is shown
  useEffect(() => {
    if (!showReferralScoreModal && !showSocialModal) return;
    const t = setTimeout(() => setXpProgressAnimated(xpProgressPercent), 80);
    return () => clearTimeout(t);
  }, [showReferralScoreModal, showSocialModal, xpProgressPercent]);

  useEffect(() => {
    const stored = localStorage.getItem('submittedEmails');
    if (stored) {
      try {
        setSubmittedEmails(JSON.parse(stored));
      } catch (e) {
        // ignore invalid data
      }
    }
  }, []);

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

      <div className="relative z-30 max-w-4xl mx-auto px-5 text-center mt-8 md:-mt-12">
        {/* Main heading */}
        <h1
          className="text-[26px] sm:text-4xl md:text-6xl lg:text-7xl font-medium text-white mb-4 sm:mb-6 tracking-tight leading-tight mix-blend-normal drop-shadow-[0_3px_16px_rgba(255,255,255,0.5)] relative z-40"
          style={{ color: '#ffffff' }}
        >
          Be First. <span className="text-white mix-blend-normal">Move Smarter.</span>
        </h1>

        {/* Description */}
        <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed">
          SenseiFi is launching in limited waves. Join the waiting list to unlock early access to AI-powered trading intelligence, security tools, and exclusive launch benefits.
        </p>

        {/* Email input and CTA */}
        <form
          className="relative w-full max-w-2xl mx-auto mb-8 sm:mb-12"
            onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const email = (formData.get('email') as string)?.trim();
            if (!email) return;
            setLoading(true);
            setShowSocialModal(false);
            setShowAlreadyOnWaitlistModal(false);
            setToast(null);
            try {
              const waitlistBaseUrl = process.env.NEXT_PUBLIC_WAITLIST_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://waitlist-82co.onrender.com';
              const refAtSubmit =
                (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('ref')?.trim()) ||
                (typeof window !== 'undefined' && (() => { try { return sessionStorage.getItem('senseifi_ref'); } catch { return null; } })()) ||
                '';
              const body: { email: string; ref?: string } = { email };
              if (refAtSubmit) body.ref = refAtSubmit;
              const res = await fetch(`${waitlistBaseUrl}/waitlist`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                  body: JSON.stringify(body),
                });

              const data = await res.json().catch(() => ({}));
              console.log('[Waitlist] API response', data);
              console.log('[Waitlist] Joined waitlist', {
                email,
                extractedRefCode: refAtSubmit || null,
                requestBody: body,
                response: { status: res.status, statusText: res.statusText, data },
              });
                const responseText = JSON.stringify(data).toLowerCase();
                const isEmailAlreadyUsed =
                  (responseText.includes('already') && responseText.includes('waitlist')) ||
                  responseText.includes('already exists') ||
                  responseText.includes('duplicate') ||
                  responseText.includes('already registered') ||
                  res.status === 409;

                if (isEmailAlreadyUsed) {
                  setShowAlreadyOnWaitlistModal(true);
                  setShowSocialModal(false);
                } else if (res.ok) {
                  form.reset();
                  let ref = data.referral_code || null;
                  if (!ref && data.referral_link) {
                    try {
                      if (data.referral_link.startsWith('?')) {
                        ref = new URLSearchParams(data.referral_link.slice(1)).get('ref');
                      } else {
                        ref = new URL(data.referral_link).searchParams.get('ref');
                      }
                    } catch { /* ignore */ }
                  }
                  const fullReferralUrl = ref ? `https://senseifi.io?ref=${ref}` : '';
                  if (fullReferralUrl) setReferralLink(fullReferralUrl);
                  setXpProgressAnimated(0);
                  setShowSocialModal(true);
                  setShowAlreadyOnWaitlistModal(false);
                  const newEmails = [...submittedEmails, email];
                  setSubmittedEmails(newEmails);
                  localStorage.setItem('submittedEmails', JSON.stringify(newEmails));
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
            ref={emailInputRef}
            type="email"
            name="email"
            placeholder="Enter email"
            required
            className="w-full min-w-64 h-16 px-6 pr-44 md:pr-[18rem] rounded-2xl bg-white/10 backdrop-blur-sm border border-white/25 shadow-[0_8px_30px_rgba(0,0,0,0.35)] text-white placeholder-white/75 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition"
          />
          <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={openReferralScoreModal}
              disabled={referralScoreLoading}
              className="hidden md:inline-flex bg-white/10 hover:bg-white/15 text-white px-4 md:px-5 py-3 rounded-2xl font-medium transition border border-white/25 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {referralScoreLoading ? 'Loading…' : 'View referral score'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-radial from-[#0026FF] to-blue-400 hover:from-[#0026FF] hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 md:px-7 py-3 rounded-2xl font-medium transition shadow-lg border-2 border-white whitespace-nowrap flex items-center gap-2"
            >
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" aria-hidden />}
              Join wait list
            </button>
          </div>
        </form>
        <button
          type="button"
          onClick={openReferralScoreModal}
          disabled={referralScoreLoading}
          className="mt-3 w-full md:hidden bg-white/10 hover:bg-white/15 text-white px-4 py-3 rounded-2xl font-medium transition border border-white/25 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {referralScoreLoading ? 'Loading…' : 'View referral score'}
        </button>


        {/* Referral achievement mini dialog – only when email is entered */}
        {showReferralScoreModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-sm rounded-xl bg-[#020617] border border-blue-500/50 shadow-[0_24px_80px_rgba(15,23,42,0.95)] p-5 text-left">
              <button
                type="button"
                onClick={() => setShowReferralScoreModal(false)}
                className="absolute right-3 top-3 h-8 w-8 flex items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
                aria-label="Close"
              >
                ✕
              </button>
              <h3 className="text-lg font-semibold text-white pr-8 mb-1">
                Referral achievement
              </h3>
              <p className="text-xs text-blue-100/70 mb-4">
                Track your referrals and XP
              </p>
              {referralLink ? (
                <div className="rounded-lg bg-white/5 p-3 mb-4">
                  <p className="text-xs text-blue-100/60 mb-1.5">Referral link</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={referralLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-blue-300 hover:text-blue-200 truncate"
                    >
                      {referralLink}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(referralLink);
                        setToast({ message: 'Referral link copied', type: 'success' });
                      }}
                      className="shrink-0 p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition"
                      aria-label="Copy link"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="rounded-lg bg-white/5 p-3 mb-4">
                <p className="text-xs text-blue-100/60 mb-2">XP progress</p>
                <div className="relative h-2.5 rounded-full bg-white/10 overflow-visible xp-bar-track">
                  <div
                    className="xp-bar-fill absolute inset-y-0 left-0 rounded-full bg-[#0026FF]"
                    style={{ width: `${Math.min(100, Math.max(0, xpProgressAnimated))}%` }}
                  />
                  <div
                    className="xp-bar-spark absolute top-1/2 w-3 h-3 -translate-y-1/2 rounded-full bg-white border border-white/80 -translate-x-1/2"
                    style={{ left: `${Math.min(100, Math.max(0, xpProgressAnimated))}%` }}
                  />
                </div>
                <p className="text-sm text-white mt-1.5">{xpValue != null ? `${xpValue} XP` : '— XP'}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5">
                <span className="text-xs text-blue-100/70">Successful referrals</span>
                <span className="text-sm font-medium text-white">{successfulReferralsCount}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowReferralScoreModal(false)}
                className="mt-4 w-full rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-2.5 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed top-20 left-0 right-0 z-50 px-4 flex justify-center" role="status" aria-live="polite">
            <div className={`rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-2xl border backdrop-blur-sm transition duration-500 ease-out ${
              toast.type === 'error' ? 'bg-blue-500/25 border-blue-300/50' : 'bg-emerald-500/25 border-emerald-300/50'
            }`}>
              {toast.message}
            </div>
          </div>
        )}

        {/* Social follow modal after join */}
        {showSocialModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 rounded-xl bg-[#020617] border border-blue-500/50 shadow-[0_24px_80px_rgba(15,23,42,0.95)] p-6 md:p-8">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowSocialModal(false)}
                className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
                aria-label="Close"
              >
                ✕
              </button>

              <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
                You&apos;re on the waitlist 🎉
              </h2>
              <p className="text-sm text-amber-200/90 mb-2">
                Please ensure the email you used is correct. Spam or invalid emails will be disqualified.
              </p>
              <p className="text-sm md:text-base text-blue-100/80 mb-6">
                While we get your spot secured, stay close to the SenseiFi community:
              </p>

              <div className="space-y-3">
                {/* Discord */}
                <button
                  type="button"
                  onClick={() => window.open('https://discord.gg/gW9hezfk', '_blank')}
                  className="w-full flex items-center justify-between rounded-lg bg-[#020617] hover:bg-[#020617]/80 px-4 py-3 md:px-5 md:py-3.5 transition emboss-internal-3d-dark"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#5865F2] flex items-center justify-center">
                      <img
                        src="https://static.vecteezy.com/system/resources/thumbnails/018/930/718/small_2x/discord-logo-discord-icon-transparent-free-png.png"
                        alt="Discord"
                        className="h-9 w-9"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm md:text-base font-medium">Join our Discord community</p>
                      <p className="text-xs text-blue-200/80">Deep dives, feedback, and product channels.</p>
                    </div>
                  </div>
                </button>

                {/* Telegram */}
                <button
                  type="button"
                  onClick={() => window.open('https://t.me/senseifinance', '_blank')}
                  className="w-full flex items-center justify-between rounded-lg bg-[#0f172a] hover:bg-[#020617] px-4 py-3 md:px-5 md:py-3.5 transition emboss-internal-3d-dark"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-sky-500/10 flex items-center justify-center overflow-hidden">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                        alt="Telegram"
                        className="h-6 w-6"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm md:text-base font-medium">Join our Telegram community</p>
                      <p className="text-xs text-blue-200/80">Get Live updates on SenseiFi</p>
                    </div>
                  </div>
                </button>

                {/* X / Twitter */}
                <button
                  type="button"
                  onClick={() => window.open('https://x.com/SenseiFi_', '_blank')}
                  className="w-full flex items-center justify-between rounded-lg bg-[#020617] hover:bg-[#020617]/80 px-4 py-3 md:px-5 md:py-3.5 transition emboss-internal-3d-dark"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/5/5a/X_icon_2.svg"
                      alt="X (Twitter)"
                      className="h-5 w-5 shrink-0"
                    />
                    <div className="text-left">
                      <p className="text-white text-sm md:text-base font-medium">Follow us on X</p>
                      <p className="text-xs text-blue-200/80">Real-time updates, threads, and announcements.</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Refer & Earn Together */}
              <div className="mt-6">
                <div className="rounded-lg bg-white/5 p-4 md:p-5 text-left">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-1">
                    Refer & Earn Together
                  </h3>
                  <p className="text-sm text-blue-100/70 mb-4">
                    Earn 1 XP for every successful referral and level up.
                  </p>
                  {referralLink ? (
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/25 bg-white/5 px-3 py-2.5 mb-4">
                      <a
                        href={referralLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-blue-300 hover:text-blue-200 truncate"
                      >
                        {referralLink}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(referralLink);
                          setToast({ message: 'Referral link copied', type: 'success' });
                        }}
                        className="shrink-0 p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition"
                        aria-label="Copy referral link"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  ) : null}
                  {/* XP progress bar – animates from 0 with welding spark at leading edge */}
                  <div className="relative h-3 rounded-full bg-white/10 overflow-visible mb-6 xp-bar-track">
                    <div
                      className="xp-bar-fill absolute inset-y-0 left-0 rounded-full bg-[#0026FF]"
                      style={{ width: `${Math.min(100, Math.max(0, xpProgressAnimated))}%` }}
                    />
                    <div
                      className="xp-bar-spark absolute top-1/2 w-3.5 h-3.5 -translate-y-1/2 rounded-full bg-white border border-white/80 -translate-x-1/2"
                      style={{ left: `${Math.min(100, Math.max(0, xpProgressAnimated))}%` }}
                    />
                    <span
                      className="absolute top-full left-0 text-sm text-white whitespace-nowrap -translate-x-1/2 mt-1.5 transition-all duration-[900ms] ease-out"
                      style={{ left: `${Math.min(100, Math.max(0, xpProgressAnimated))}%` }}
                    >
                      {xpValue != null ? `${xpValue} XP` : '— XP'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSocialModal(false)}
                  className="mt-4 w-full rounded-lg bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] text-white text-sm font-medium py-2.5 transition shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>)}

        {/* Already on waitlist modal */}
        {showAlreadyOnWaitlistModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 rounded-xl bg-[#020617] border border-blue-500/50 shadow-[0_24px_80px_rgba(15,23,42,0.95)] p-6 md:p-8">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowAlreadyOnWaitlistModal(false)}
                className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
                aria-label="Close"
              >
                ✕
              </button>

              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
                  You are already on the waitlist
                </h2>
                <p className="text-sm md:text-base text-blue-100/80 mb-6">
                  Your email has already been registered. We&apos;ll notify you when SenseiFi launches!
                </p>

                <button
                  type="button"
                  onClick={() => setShowAlreadyOnWaitlistModal(false)}
                  className="w-full rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm md:text-base font-medium py-2.5 transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),inset_0_-1px_2px_rgba(255,255,255,0.06)]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
