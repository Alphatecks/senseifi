'use client';

import type { ComponentType, ReactNode } from 'react';
import { useMarketingNav } from '@/views/marketing/MarketingNavContext';
import {
  MARKETING_ROUTE_PATHS,
  isMarketingRoute,
  normalizeMarketingPath,
  type MarketingRoutePath,
} from '@/views/marketing/routes';
import HomeScreen from '@/views/HomeScreen';
import AboutScreen from '@/views/AboutScreen';
import FeaturesPageContent from '@/views/marketing/FeaturesPageContent';
import PricingPageContent from '@/views/marketing/PricingPageContent';
import PrivacyPolicyScreen from '@/views/PrivacyPolicyScreen';
import ContactScreen from '@/views/ContactScreen';

const MARKETING_VIEWS: Record<MarketingRoutePath, ComponentType> = {
  '/': HomeScreen,
  '/about': AboutScreen,
  '/features': FeaturesPageContent,
  '/pricing': PricingPageContent,
  '/privacy': PrivacyPolicyScreen,
  '/contact': ContactScreen,
};

export default function MarketingViewCache({ fallback }: { fallback: ReactNode }) {
  const { activePath } = useMarketingNav();
  const displayPath = normalizeMarketingPath(activePath);
  const showFallback = !isMarketingRoute(displayPath);

  return (
    <>
      {MARKETING_ROUTE_PATHS.map((path) => {
        const View = MARKETING_VIEWS[path];
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
