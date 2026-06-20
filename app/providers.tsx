'use client';

import { WagmiProvider, type Config } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWagmiConfig, setWagmiConfig } from '../config/wagmi';
import { isWalletConnectConfigured } from '@/config/appkit';
import { useEffect, useState } from 'react';
import ReferralRefPersist from '@/views/components/ReferralRefPersist';
import { DashboardUserProvider } from '@/context/DashboardUserContext';
import { WaitlistXpProvider } from '@/context/WaitlistXpContext';
import { WalletStackProvider } from '@/context/WalletStackContext';
import ExtensionWalletSync from '@/views/components/ExtensionWalletSync';
import WalletAccountSync from '@/views/components/WalletAccountSync';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [config, setConfig] = useState<Config | undefined>(undefined);
  const [walletConnectEnabled, setWalletConnectEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapWalletStack() {
      if (isWalletConnectConfigured()) {
        try {
          const { initClientWalletStack } = await import('@/config/appkit.client');
          const walletConfig = await initClientWalletStack();
          if (!cancelled) {
            setWagmiConfig(walletConfig);
            setConfig(walletConfig);
            setWalletConnectEnabled(true);
          }
          return;
        } catch (error) {
          console.error('WalletConnect init failed, falling back to injected connectors:', error);
        }
      }

      const fallbackConfig = createWagmiConfig();
      if (!cancelled) {
        setWagmiConfig(fallbackConfig);
        setConfig(fallbackConfig);
        setWalletConnectEnabled(false);
      }
    }

    void bootstrapWalletStack();

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
              <WalletAccountSync />
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
