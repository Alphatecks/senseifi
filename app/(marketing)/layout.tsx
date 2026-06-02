import Header from '@/views/components/Header';
import Footer from '@/views/components/Footer';
import MarketingViewCache from '@/views/marketing/MarketingViewCache';
import { MarketingNavProvider } from '@/views/marketing/MarketingNavContext';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingNavProvider>
      <main className="min-h-screen bg-[#0a0a1a]">
        <Header />
        <MarketingViewCache fallback={children} />
        <Footer />
      </main>
    </MarketingNavProvider>
  );
}
