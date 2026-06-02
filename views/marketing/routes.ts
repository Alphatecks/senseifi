import type { ComponentType } from 'react';

export type MarketingRoutePath = '/' | '/about' | '/features' | '/pricing' | '/privacy' | '/contact';

export const MARKETING_ROUTE_PATHS: MarketingRoutePath[] = [
  '/',
  '/about',
  '/features',
  '/pricing',
  '/privacy',
  '/contact',
];

export function normalizeMarketingPath(path: string): MarketingRoutePath | string {
  const withoutQuery = (path || '/').split('?')[0]?.split('#')[0] ?? '/';
  const normalized =
    withoutQuery !== '/' && withoutQuery.endsWith('/')
      ? withoutQuery.slice(0, -1)
      : withoutQuery || '/';
  return normalized;
}

export function isMarketingRoute(path: string): path is MarketingRoutePath {
  const normalized = normalizeMarketingPath(path);
  return MARKETING_ROUTE_PATHS.includes(normalized as MarketingRoutePath);
}

export type MarketingRouteLoader = () => Promise<{ default: ComponentType }>;

export const MARKETING_ROUTE_LOADERS: Record<MarketingRoutePath, MarketingRouteLoader> = {
  '/': () => import('@/views/HomeScreen'),
  '/about': () => import('@/views/AboutScreen'),
  '/features': () => import('@/views/marketing/FeaturesPageContent'),
  '/pricing': () => import('@/views/marketing/PricingPageContent'),
  '/privacy': () => import('@/views/PrivacyPolicyScreen'),
  '/contact': () => import('@/views/ContactScreen'),
};
