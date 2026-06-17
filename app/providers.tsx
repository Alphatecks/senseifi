'use client';

import { WagmiProvider, type Config } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWagmiConfig } from '../config/wagmi';
import { isWalletConnectConfigured } from '@/config/appkit';
import { useEffect, useState } from 'react';
import ReferralRefPersist from '@/views/components/ReferralRefPersist';
import { DashboardUserProvider } from '@/context/DashboardUserContext';
import { WaitlistXpProvider } from '@/context/WaitlistXpContext';
import { WalletStackProvider } from '@/context/WalletStackContext';
import ExtensionWalletSync from '@/views/components/ExtensionWalletSync';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [config, setConfig] = useState<Config | undefined>(undefined);
  const [walletConnectEnabled, setWalletConnectEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setConfig(createWagmiConfig());
    setWalletConnectEnabled(false);

    async function bootstrapWalletConnect() {
      if (!isWalletConnectConfigured()) return;

      try {
        const { initClientWalletStack } = await import('@/config/appkit.client');
        const walletConfig = await initClientWalletStack();
        if (!cancelled) {
          setConfig(walletConfig);
          setWalletConnectEnabled(true);
        }
      } catch (error) {
        console.error('WalletConnect init failed, keeping legacy wagmi connectors:', error);
      }
    }

    void bootstrapWalletConnect();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!config) {
    return <div className="min-h-screen bg-[#0a0a1a]" aria-hidden />;
  }

  return (
    <WalletStackProvider ready walletConnectEnabled={walletConnectEnabled}>
      <WagmiProvider config={config} reconnectOnMount>
        <QueryClientProvider client={queryClient}>
          <DashboardUserProvider>
            <WaitlistXpProvider>
              <ReferralRefPersist />
              <ExtensionWalletSync />
              {children}
            </WaitlistXpProvider>
          </DashboardUserProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </WalletStackProvider>
  );
}
