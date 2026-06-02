"use client";

import Image from "next/image";

const FEATURE_CARDS = [
  {
    title: "SenseiTrade",
    badge: "Trade",
    image: "/images/senseitrade.gif",
    description:
      "AI-powered signals, trend alerts, on-chain analysis and portfolio insights tailored to how you trade.",
  },
  {
    title: "SenseiGuard",
    badge: "Guard",
    image: "/images/senseiguard.gif",
    description:
      "Block threats, flag scam contracts, and monitor your wallet in real time before attacks happen",
  },
  {
    title: "SenseiCard",
    badge: "Card",
    image: "/images/senseicard.gif",
    description: "Spend crypto anywhere online without friction and smart spending analytics.",
  },
] as const;

function FeatureBadge({ label }: { label: string }) {
  return (
    <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-[#0026FF] bg-black/40 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
      <span>{label}</span>
      <Image src="/images/scaled_logo.png" alt="" width={14} height={14} className="h-3.5 w-3.5 object-contain" />
    </div>
  );
}

export default function FeaturesScreen() {
  return (
    <div className="relative w-full overflow-hidden bg-black text-white pb-16 md:pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-0 h-[28rem] w-[28rem] md:-right-24 md:h-[36rem] md:w-[36rem] bg-[radial-gradient(circle_at_center,rgba(0,38,255,0.55),rgba(0,38,255,0.08)_45%,transparent_72%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-[22rem] w-[22rem] md:h-[28rem] md:w-[28rem] opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(circle at top right, black 20%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle at top right, black 20%, transparent 72%)",
        }}
      />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-32 md:px-8 md:pt-40 lg:px-12">
        <div className="flex flex-col items-center text-center">
          <span className="mb-6 inline-flex items-center rounded-full border border-[#0026FF] px-4 py-1 text-sm font-medium text-white">
            Features
          </span>
          <h1 className="max-w-4xl text-4xl font-normal leading-tight md:text-5xl lg:text-6xl">
            Crypto Made Simple. Safe. Smart.
          </h1>
          <p className="mt-6 max-w-3xl text-base text-white/70 md:text-lg lg:text-xl">
            Manage, protect, and grow your digital assets with AI-powered insights, robust security,
            and seamless spending all in one platform.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-3 md:gap-8">
          {FEATURE_CARDS.map((feature) => (
            <article
              key={feature.title}
              className="overflow-hidden rounded-2xl bg-white text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="relative h-[220px] overflow-hidden bg-white sm:h-[240px] md:h-[260px]">
                <FeatureBadge label={feature.badge} />
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={800}
                  height={800}
                  className="absolute inset-0 h-full w-full translate-y-12 scale-[1.35] object-cover object-[center_42%]"
                  unoptimized
                />
              </div>
              <div className="px-6 pb-8 pt-5 md:px-7">
                <h2 className="text-2xl font-semibold text-black">{feature.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
