import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ConnectWalletClient = dynamic(() => import('./ConnectWalletClient'), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#0a0a1a] text-blue-100/80"
      aria-busy="true"
    >
      Loading…
    </div>
  ),
});

export default function ConnectWalletPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen w-full flex items-center justify-center bg-[#0a0a1a] text-blue-100/80"
          aria-busy="true"
        >
          Loading…
        </div>
      }
    >
      <ConnectWalletClient />
    </Suspense>
  );
}
