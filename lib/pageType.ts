export type PageType = 
  | 'flight_route'
  | 'airport'
  | 'airline'
  | 'airline_route'
  | 'blog'
  | 'home'
  | 'other';

export function getPageType(pathname: string): PageType {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/flights/') && pathname.includes('-')) return 'flight_route';
  if (pathname.startsWith('/airports/')) return 'airport';
  if (pathname.startsWith('/airlines/') && pathname.split('/').length === 3) return 'airline';
  if (pathname.startsWith('/airlines/') && pathname.split('/').length === 4) return 'airline_route';
  if (pathname.startsWith('/blog/')) return 'blog';
  return 'other';
}

export function getEntityPrimary(pathname: string, pageType: PageType): string | undefined {
  switch (pageType) {
    case 'flight_route':
      return pathname.split('/flights/')[1];
    case 'airport':
      return pathname.split('/airports/')[1]?.toUpperCase();
    case 'airline':
      return pathname.split('/airlines/')[1]?.split('/')[0]?.toUpperCase();
    case 'airline_route':
      return pathname.split('/airlines/')[1]?.split('/')[0]?.toUpperCase();
    case 'blog':
      return pathname.split('/blog/')[1];
    default:
      return undefined;
  }
}

export function getEntitySecondary(pathname: string, pageType: PageType): string | undefined {
  if (pageType === 'airline_route') {
    const parts = pathname.split('/airlines/')[1]?.split('/');
    return parts?.[1];
  }
  if (pageType === 'flight_route') {
    const route = pathname.split('/flights/')[1];
    if (route?.includes('-')) {
      const [origin, destination] = route.split('-');
      return destination?.toUpperCase();
    }
  }
  return undefined;
}

