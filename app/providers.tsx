'use client';

import { WagmiProvider, type Config } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getWagmiConfig } from '../config/wagmi';
import { useEffect, useState } from 'react';
import ReferralRefPersist from '@/views/components/ReferralRefPersist';
import { DashboardUserProvider } from '@/context/DashboardUserContext';
import { WaitlistXpProvider } from '@/context/WaitlistXpContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [config, setConfig] = useState<Config | undefined>(undefined);

  useEffect(() => {
    setConfig(getWagmiConfig());
  }, []);

  if (!config) {
    return <div className="min-h-screen bg-[#0a0a1a]" aria-hidden />;
  }

  return (
    <WagmiProvider config={config} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <DashboardUserProvider>
          <WaitlistXpProvider>
            <ReferralRefPersist />
            {children}
          </WaitlistXpProvider>
        </DashboardUserProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
