'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';
import { useMarketingNav } from '@/views/marketing/MarketingNavContext';
import { isMarketingRoute } from '@/views/marketing/routes';

type MarketingNavLinkProps = ComponentProps<typeof Link> & {
  href: string;
};

export default function MarketingNavLink({
  href,
  onClick,
  prefetch = true,
  ...props
}: MarketingNavLinkProps) {
  const { navigate } = useMarketingNav();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!isMarketingRoute(href)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    event.preventDefault();
    navigate(href);
  };

  return <Link href={href} prefetch={prefetch} onClick={handleClick} {...props} />;
}
