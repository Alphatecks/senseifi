'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  isMarketingRoute,
  normalizeMarketingPath,
  type MarketingRoutePath,
} from '@/views/marketing/routes';

type MarketingNavContextValue = {
  activePath: string;
  readyRoutes: ReadonlySet<MarketingRoutePath>;
  markRouteReady: (path: MarketingRoutePath) => void;
  navigate: (path: string) => void;
  isRouteReady: (path: string) => boolean;
};

const MarketingNavContext = createContext<MarketingNavContextValue | null>(null);

export function MarketingNavProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(() => normalizeMarketingPath(pathname));
  const [readyRoutes, setReadyRoutes] = useState<Set<MarketingRoutePath>>(() => new Set());

  useEffect(() => {
    setActivePath(normalizeMarketingPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const onPopState = () => {
      setActivePath(normalizeMarketingPath(window.location.pathname));
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const markRouteReady = useCallback((path: MarketingRoutePath) => {
    setReadyRoutes((current) => {
      if (current.has(path)) return current;
      const next = new Set(current);
      next.add(path);
      return next;
    });
  }, []);

  const isRouteReady = useCallback(
    (path: string) => {
      const normalized = normalizeMarketingPath(path);
      return isMarketingRoute(normalized) && readyRoutes.has(normalized);
    },
    [readyRoutes],
  );

  const navigate = useCallback(
    (path: string) => {
      const normalized = normalizeMarketingPath(path);

      if (!isMarketingRoute(normalized)) {
        router.push(normalized);
        return;
      }

      if (readyRoutes.has(normalized)) {
        setActivePath(normalized);
        window.history.pushState(null, '', normalized);
        document.querySelector<HTMLElement>('.root-scroll')?.scrollTo(0, 0);
        return;
      }

      router.push(normalized);
    },
    [readyRoutes, router],
  );

  const value = useMemo(
    () => ({
      activePath,
      readyRoutes,
      markRouteReady,
      navigate,
      isRouteReady,
    }),
    [activePath, readyRoutes, markRouteReady, navigate, isRouteReady],
  );

  return <MarketingNavContext.Provider value={value}>{children}</MarketingNavContext.Provider>;
}

export function useMarketingNav() {
  const context = useContext(MarketingNavContext);
  if (!context) {
    throw new Error('useMarketingNav must be used within MarketingNavProvider');
  }
  return context;
}

export function useOptionalMarketingNav() {
  return useContext(MarketingNavContext);
}
