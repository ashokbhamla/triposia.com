'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/gtag';
import { getPageType, getEntityPrimary, getEntitySecondary } from '@/lib/pageType';

interface PageViewTrackerProps {
  pageType?: string;
  entityPrimary?: string;
  entitySecondary?: string;
  additionalParams?: Record<string, string | number | boolean>;
}

export default function PageViewTracker({
  pageType: propPageType,
  entityPrimary: propEntityPrimary,
  entitySecondary: propEntitySecondary,
  additionalParams = {},
}: PageViewTrackerProps) {
  const pathname = usePathname();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    const pageType = propPageType || getPageType(pathname);
    const entityPrimary = propEntityPrimary || getEntityPrimary(pathname, pageType as any);
    const entitySecondary = propEntitySecondary || getEntitySecondary(pathname, pageType as any);

    const baseParams: Record<string, string | number | boolean> = {
      page_type: pageType,
      ...(entityPrimary && { entity_primary: entityPrimary }),
      ...(entitySecondary && { entity_secondary: entitySecondary }),
      ...additionalParams,
    };

    switch (pageType) {
      case 'flight_route':
        if (entityPrimary) {
          const [origin, destination] = entityPrimary.split('-');
          trackEvent('view_route', {
            ...baseParams,
            route: entityPrimary,
            origin: origin?.toUpperCase(),
            destination: destination?.toUpperCase(),
          });
        }
        break;
      case 'airport':
        trackEvent('view_airport', {
          ...baseParams,
          airport_iata: entityPrimary,
        });
        break;
      case 'airline':
      case 'airline_route':
        trackEvent('view_airline', {
          ...baseParams,
          airline_iata: entityPrimary,
          ...(entitySecondary && { route: entitySecondary }),
        });
        break;
    }
  }, [pathname, propPageType, propEntityPrimary, propEntitySecondary, additionalParams]);

  return null;
}

