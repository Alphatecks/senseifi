'use client';

import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { useMarketingNav } from '@/views/marketing/MarketingNavContext';
import {
  MARKETING_ROUTE_LOADERS,
  MARKETING_ROUTE_PATHS,
  isMarketingRoute,
  normalizeMarketingPath,
  type MarketingRoutePath,
} from '@/views/marketing/routes';

type CachedViews = Partial<Record<MarketingRoutePath, ComponentType>>;

export default function MarketingViewCache({ fallback }: { fallback: ReactNode }) {
  const { activePath, markRouteReady } = useMarketingNav();
  const [cachedViews, setCachedViews] = useState<CachedViews>({});

  useEffect(() => {
    let cancelled = false;

    void Promise.all(
      MARKETING_ROUTE_PATHS.map(async (path) => {
        const module = await MARKETING_ROUTE_LOADERS[path]();
        if (cancelled) return;

        setCachedViews((current) => ({
          ...current,
          [path]: module.default,
        }));
        markRouteReady(path);
      }),
    );

    return () => {
      cancelled = true;
    };
  }, [markRouteReady]);

  const displayPath = normalizeMarketingPath(activePath);
  const showFallback = !isMarketingRoute(displayPath) || !cachedViews[displayPath];

  return (
    <>
      {MARKETING_ROUTE_PATHS.map((path) => {
        const View = cachedViews[path];
        if (!View) return null;

        const isActive = displayPath === path;

        return (
          <div key={path} hidden={!isActive} aria-hidden={!isActive}>
            <View />
          </div>
        );
      })}
      {showFallback ? fallback : null}
    </>
  );
}
