'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../config/wagmi';
import { useState } from 'react';
import ReferralRefPersist from '@/views/components/ReferralRefPersist';
import { DashboardUserProvider } from '@/context/DashboardUserContext';
import { WaitlistXpProvider } from '@/context/WaitlistXpContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

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
