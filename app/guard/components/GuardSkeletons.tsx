"use client";

const SKELETON_BASE = "animate-pulse bg-slate-700/60 rounded";

export function SkeletonBar({ className = "" }: { className?: string }) {
  return <div className={`${SKELETON_BASE} ${className}`} aria-hidden />;
}

export function DashboardStatCardSkeleton({ mobile }: { mobile?: boolean }) {
  return (
    <div
      className={`rounded-xl flex flex-col bg-gradient-to-br from-blue-950 to-slate-900 border border-slate-700/40 ${
        mobile ? "p-2.5 min-h-[115px]" : "p-5 min-h-[180px]"
      }`}
      aria-hidden
    >
      <SkeletonBar className={mobile ? "h-3 w-24 mb-2" : "h-4 w-32 mb-3"} />
      <SkeletonBar className={mobile ? "h-7 w-14 mb-auto" : "h-10 w-20 mb-auto"} />
      <div className={`flex items-center justify-between mt-auto ${mobile ? "pt-2" : "pt-4"}`}>
        <SkeletonBar className={mobile ? "h-2.5 w-14" : "h-3 w-20"} />
        <SkeletonBar className={mobile ? "h-7 w-[4.5rem] rounded" : "h-9 w-24 rounded"} />
      </div>
    </div>
  );
}

export function DashboardAssetSkeleton({ mobile }: { mobile?: boolean }) {
  const width = mobile ? "w-[220px]" : "w-[240px]";
  return (
    <div
      className={`shrink-0 ${width} min-h-[120px] rounded-2xl p-4 border border-slate-700/40 bg-slate-800/30 flex flex-col gap-3`}
      aria-hidden
    >
      <div className="flex items-center gap-2">
        <SkeletonBar className="w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBar className="h-3 w-12" />
          <SkeletonBar className="h-2.5 w-20" />
        </div>
      </div>
      <SkeletonBar className="h-6 w-24" />
      <SkeletonBar className="h-5 w-14 rounded-md" />
    </div>
  );
}

export function DashboardActivitySkeleton({ count = 3, compact, inline }: { count?: number; compact?: boolean; inline?: boolean }) {
  const items = Array.from({ length: count }).map((_, i) => (
    <li
      key={i}
      className={`flex items-center gap-3 rounded-lg bg-slate-800/40 border border-slate-700/30 ${
        compact ? "p-3.5" : "p-3"
      }`}
    >
      <SkeletonBar className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBar className="h-3.5 w-3/4" />
        <SkeletonBar className="h-2.5 w-full" />
      </div>
    </li>
  ));
  if (inline) return <>{items}</>;
  return (
    <ul className={compact ? "flex-1 flex flex-col justify-between min-h-0 space-y-2" : "space-y-3"} aria-hidden>
      {items}
    </ul>
  );
}

export function SecurityStatusSkeleton({ mobile }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="flex gap-4" aria-hidden>
        <SkeletonBar className="w-32 h-32 shrink-0 rounded-full" />
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-3">
          <SkeletonBar className="h-4 w-28" />
          <SkeletonBar className="h-3 w-full" />
          <SkeletonBar className="h-3 w-4/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1 pt-8" aria-hidden>
      <SkeletonBar className="w-44 h-44 sm:w-52 sm:h-52 shrink-0 rounded-full mx-auto sm:mx-0" />
      <div className="flex-1 min-w-0 flex flex-col gap-3 sm:mt-16">
        <SkeletonBar className="h-4 w-32" />
        <SkeletonBar className="h-4 w-full max-w-xs" />
        <SkeletonBar className="h-4 w-5/6 max-w-sm" />
      </div>
    </div>
  );
}

export function WalletHealthSkeleton() {
  return (
    <div className="flex-1 flex flex-col items-center min-h-0" aria-hidden>
      <SkeletonBar className="w-56 h-36 rounded-t-full" />
      <SkeletonBar className="h-9 w-16 mt-3" />
      <SkeletonBar className="h-4 w-40 mt-auto pt-2" />
    </div>
  );
}

export function DashboardModalListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg bg-slate-800/80 border border-slate-700/50 p-4 space-y-2">
          <SkeletonBar className="h-4 w-3/4" />
          <SkeletonBar className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

export function GuardOverviewCardBodySkeleton({ withButton }: { withButton?: boolean }) {
  return (
    <div className="space-y-2 py-1 flex-1 flex flex-col" aria-hidden>
      <div className="flex items-center justify-between gap-1">
        <SkeletonBar className="h-8 w-12" />
        <SkeletonBar className="w-[32%] h-8" />
      </div>
      <SkeletonBar className="h-3 w-full" />
      <SkeletonBar className="h-3 w-2/3" />
      {withButton ? <SkeletonBar className="h-8 w-full rounded-lg mt-auto" /> : null}
    </div>
  );
}

export function GuardThreatStatBodySkeleton({ desktop }: { desktop?: boolean }) {
  return (
    <div className="mt-auto space-y-2 flex-1 flex flex-col justify-end" aria-hidden>
      <SkeletonBar className={`rounded-lg shrink-0 ${desktop ? "h-7 w-24" : "h-6 w-20"}`} />
      <div className="flex items-end justify-between gap-2">
        <SkeletonBar className={desktop ? "h-10 w-20" : "h-8 w-14"} />
        <SkeletonBar className={`shrink-0 ${desktop ? "w-[28%] min-w-[70px] h-11" : "w-[26%] min-w-[56px] h-9"}`} />
      </div>
    </div>
  );
}

export function GuardTextBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBar key={i} className={`h-3.5 ${i === lines - 1 ? "w-4/5" : "w-full"}`} />
      ))}
    </div>
  );
}

export function GuardChartSkeleton({ className = "h-40 w-full rounded-lg" }: { className?: string }) {
  return <SkeletonBar className={className} aria-hidden />;
}

export function GuardTableRowsSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} aria-hidden>
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} className="py-3 px-4">
              <SkeletonBar className="h-3.5 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function GuardToggleRowsSkeleton({ count = 4, inline }: { count?: number; inline?: boolean }) {
  const items = Array.from({ length: count }).map((_, i) => (
    <li key={i} className="flex items-center justify-between gap-3 py-2">
      <SkeletonBar className="h-4 w-2/5" />
      <SkeletonBar className="h-6 w-11 rounded-full shrink-0" />
    </li>
  ));
  if (inline) return <>{items}</>;
  return (
    <ul className="space-y-3" aria-hidden>
      {items}
    </ul>
  );
}

export function GuardConnectedGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-700/60 p-4 flex flex-col gap-4 bg-slate-800/30" aria-hidden>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <SkeletonBar className="w-12 h-12 rounded-full shrink-0" />
              <div className="space-y-2">
                <SkeletonBar className="h-4 w-24" />
                <SkeletonBar className="h-3 w-20" />
              </div>
            </div>
            <SkeletonBar className="h-3 w-16" />
          </div>
          <div className="flex gap-2">
            <SkeletonBar className="h-11 flex-1 rounded-lg" />
            <SkeletonBar className="h-11 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </>
  );
}

export function GuardScanHistorySkeleton({ count = 4, inline }: { count?: number; inline?: boolean }) {
  const items = Array.from({ length: count }).map((_, i) => (
    <li key={i} className="rounded-lg border border-slate-700/50 p-3 space-y-2 bg-slate-800/30" aria-hidden>
      <SkeletonBar className="h-4 w-32" />
      <SkeletonBar className="h-3 w-20" />
      <SkeletonBar className="h-3 w-40" />
    </li>
  ));
  if (inline) return <>{items}</>;
  return (
    <ul className="space-y-3" aria-hidden>
      {items}
    </ul>
  );
}

export function GuardConnectedListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-xl p-4 border border-slate-700/40 space-y-3 bg-slate-800/30" aria-hidden>
          <div className="flex items-center gap-3">
            <SkeletonBar className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBar className="h-4 w-32" />
              <SkeletonBar className="h-3 w-24" />
            </div>
          </div>
          <SkeletonBar className="h-9 w-full rounded-lg" />
        </li>
      ))}
    </>
  );
}

export function GuardApprovalRowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg bg-slate-800/40 border border-slate-700/40 p-3 space-y-2">
          <SkeletonBar className="h-4 w-3/4" />
          <SkeletonBar className="h-3 w-1/2" />
          <div className="flex gap-2 pt-1">
            <SkeletonBar className="h-6 w-16 rounded" />
            <SkeletonBar className="h-6 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GuardDetailRowsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-0 divide-y divide-slate-700/40" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex justify-between items-center gap-3 py-3">
          <SkeletonBar className="h-3.5 w-1/3" />
          <SkeletonBar className="h-3.5 w-1/4" />
        </div>
      ))}
    </div>
  );
}
