import Link from "next/link";
import Image from "next/image";

type BillingSuccessPageProps = {
  searchParams?: {
    session_id?: string | string[];
  };
};

export default function BillingSuccessPage({ searchParams }: BillingSuccessPageProps) {
  const sessionIdRaw = searchParams?.session_id;
  const sessionId = Array.isArray(sessionIdRaw) ? sessionIdRaw[0] : sessionIdRaw;

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        <div className="absolute -left-24 -top-16 h-[28rem] w-[28rem] bg-[radial-gradient(circle_at_center,_rgba(0,38,255,0.55),_rgba(0,38,255,0)_70%)] blur-3xl" />
        <div className="absolute -right-20 -bottom-16 h-[26rem] w-[26rem] bg-[radial-gradient(circle_at_center,_rgba(127,95,255,0.45),_rgba(127,95,255,0)_72%)] blur-3xl" />
      </div>

      <section className="relative z-10 max-w-3xl mx-auto px-4 py-10 md:py-16">
        <div className="flex items-center justify-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition">
            <Image
              src="/images/scaled_logo.png"
              alt="SenseiFi"
              width={130}
              height={34}
              className="h-8 w-auto"
            />
            <span className="text-lg font-medium">SenseiFi</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-white/15 bg-[#12162a]/90 backdrop-blur-xl shadow-[0_10px_50px_rgba(0,0,0,0.45)] p-7 md:p-10">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-[#0026FF]/20 border border-[#0026FF]/50 flex items-center justify-center">
            <span className="text-3xl">✓</span>
          </div>

          <h1 className="text-3xl md:text-4xl text-center font-medium mb-3">
            Billing Successful
          </h1>
          <p className="text-center text-white/75 text-base md:text-lg mb-8">
            Your subscription is now active. You can manage your plan anytime from billing settings.
          </p>

          {sessionId && (
            <p className="text-center text-xs md:text-sm text-white/55 mb-8">
              Session: <span className="font-mono">{sessionId}</span>
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href="/guard"
              className="px-5 py-3 rounded-xl bg-[#0026FF] hover:bg-blue-600 text-white text-center font-medium transition"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-center font-medium border border-white/20 transition"
            >
              Back to Home
            </Link>
            <Link
              href="/#pricing"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-center font-medium border border-white/20 transition"
            >
              Manage Plan
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

