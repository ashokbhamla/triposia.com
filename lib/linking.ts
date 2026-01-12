import { getRoutesFromAirport, getRoutesToAirport, getAirline, getAllAirlines, getRoute } from './queries';
import { Route, AirportSummary, Airline } from './queries';
import { shouldIndexRoute, shouldIndexAirport, shouldIndexAirlineRoute } from './indexing';
import { getEntityRole, getRoleInfo, getLinkingStrategy, EntityRole } from './entityRoles';

/**
 * Link limits per page type (STRICT SEO SAFETY)
 * Maximum total internal links per page type:
 * - Blog pages: max 12 internal links
 * - Airport pages: max 20 internal links (hubs)
 * - Route pages: max 8 internal links (leaves)
 * - Airline pages: max 15 internal links (hubs)
 */
export const LINK_LIMITS = {
  airport: {
    routes: 6,
    airlines: 6,
    blogs: 3,
    maxTotal: 20, // Airport pages as hubs
  },
  route: {
    airports: 2, // origin + destination only
    airlines: 4,
    blogs: 1, // Only one related blog
    maxTotal: 8, // Route pages are leaves - minimal linking
  },
  airline: {
    routes: 8,
    airports: 5,
    blogs: 3,
    maxTotal: 15, // Airline pages as hubs
  },
  blog: {
    routes: 3,
    airports: 3,
    airlines: 3,
    blogs: 3,
    maxTotal: 12, // Blog pages - contextual linking
  },
} as const;

/**
 * Get link limits based on entity role
 */
export function getLinkLimitsByRole(role: EntityRole) {
  const strategy = getLinkingStrategy(role);
  return {
    routes: strategy.includeRoutes ? strategy.maxPerCategory : 0,
    airports: strategy.includeAirports ? strategy.maxPerCategory : 0,
    airlines: strategy.includeAirlines ? strategy.maxPerCategory : 0,
    blogs: strategy.includeBlogs ? strategy.maxPerCategory : 0,
  };
}

/**
 * Get related routes for an airport (top routes by frequency)
 * Filters out noindex routes
 */
export async function getRelatedRoutes(
  airportIata: string,
  limit: number = LINK_LIMITS.airport.routes
): Promise<Array<Route & { shouldIndex: boolean }>> {
  const routesFrom = await getRoutesFromAirport(airportIata);
  
  // Check indexing eligibility for each route
  const routesWithIndexing = await Promise.all(
    routesFrom.slice(0, limit * 2).map(async (route) => {
      // We need flights to check indexing, but for linking purposes,
      // we'll accept routes that have flight data flag set
      const shouldIndex = route.has_flight_data === true;
      return { ...route, shouldIndex };
    })
  );
  
  // Filter to only indexable routes and limit
  return routesWithIndexing
    .filter(r => r.shouldIndex)
    .slice(0, limit);
}

/**
 * Get related airports from routes
 * Filters out noindex airports
 */
export async function getRelatedAirports(
  routeIatas: string[],
  excludeIatas: string[] = [],
  limit: number = LINK_LIMITS.route.airports
): Promise<Array<{ iata: string; shouldIndex: boolean }>> {
  const unique = Array.from(new Set(routeIatas)).filter(iata => !excludeIatas.includes(iata));
  
  // For simplicity, we'll assume airports are indexable if they're referenced in routes
  // In production, you might want to check airport data
  return unique
    .slice(0, limit)
    .map(iata => ({ iata, shouldIndex: true }));
}

/**
 * Get related airlines for an airport or route
 * All airlines are considered indexable for linking purposes
 */
export async function getRelatedAirlines(
  airlineCodes: string[],
  limit: number = LINK_LIMITS.airline.routes
): Promise<Airline[]> {
  const allAirlines = await getAllAirlines();
  const airlineMap = new Map(allAirlines.map(a => [a.code.toLowerCase(), a]));
  
  return airlineCodes
    .slice(0, limit)
    .map(code => airlineMap.get(code.toLowerCase()))
    .filter((airline): airline is Airline => airline !== undefined);
}

/**
 * Get related airlines from the same country
 */
export async function getRelatedAirlinesByCountry(
  country: string,
  excludeCode: string,
  limit: number = 6
): Promise<Airline[]> {
  const allAirlines = await getAllAirlines();
  return allAirlines
    .filter(airline => 
      airline.country?.toLowerCase() === country?.toLowerCase() &&
      airline.code?.toLowerCase() !== excludeCode.toLowerCase() &&
      (airline.iata || airline.code)
    )
    .slice(0, limit);
}

/**
 * Get related blogs for a page (placeholder for future blog system)
 * Currently returns empty array as blog system is not yet implemented
 */
export async function getRelatedBlogs(
  entityType: 'airport' | 'route' | 'airline',
  entityId: string,
  limit: number = 3
): Promise<Array<{ slug: string; title: string; shouldIndex: boolean }>> {
  // Placeholder: Blog system not yet implemented
  // When implemented, this should:
  // 1. Query blogs collection for blogs linked to the entity
  // 2. Filter by status === 'published'
  // 3. Check indexing eligibility
  // 4. Sort by relevance or recency
  // 5. Return limited results
  return [];
}

/**
 * Get airlines operating on a route
 */
export async function getAirlinesForRoute(
  origin: string,
  destination: string,
  flights: any[]
): Promise<Airline[]> {
  const airlineCodes = Array.from(new Set(flights.map(f => f.airline_iata).filter(Boolean)));
  return getRelatedAirlines(airlineCodes, LINK_LIMITS.route.airlines);
}

/**
 * Natural anchor text variations for routes
 * Rotates between different formats to avoid repetition
 */
const routeAnchorVariations = [
  (route: Route) => `${route.origin_iata} to ${route.destination_iata}`,
  (route: Route) => `${route.origin_iata}-${route.destination_iata}`,
  (route: Route) => `${route.origin_iata} → ${route.destination_iata}`,
  (route: Route) => `${route.origin_iata} to ${route.destination_iata} (${route.destination_city})`,
  (route: Route) => `Flights from ${route.origin_iata} to ${route.destination_iata}`,
];

/**
 * Format route link anchor text naturally with variation
 */
export function formatRouteAnchor(route: Route, index: number = 0): string {
  const variation = routeAnchorVariations[index % routeAnchorVariations.length];
  return variation(route);
}

/**
 * Natural anchor text variations for airports
 */
const airportAnchorVariations = [
  (iata: string, city?: string) => city ? `${city} (${iata})` : iata,
  (iata: string, city?: string) => city ? `${city} Airport (${iata})` : `${iata} Airport`,
  (iata: string, city?: string) => `${iata} Airport`,
  (iata: string, city?: string) => city ? `${city}` : iata,
];

/**
 * Format airport link anchor text naturally with variation
 * Format: "City Name (IATA)" or just "IATA" if no city
 */
export function formatAirportAnchor(iata: string, city?: string, index: number = 0): string {
  const variation = airportAnchorVariations[index % airportAnchorVariations.length];
  return variation(iata, city);
}

/**
 * Natural anchor text variations for airlines
 */
const airlineAnchorVariations = [
  (airline: Airline) => {
    const code = airline.iata || airline.code || '';
    return code ? `${airline.name} (${code})` : airline.name;
  },
  (airline: Airline) => airline.name,
  (airline: Airline) => {
    const code = airline.iata || airline.code || '';
    return code ? `${airline.name}` : airline.name;
  },
  (airline: Airline) => {
    const code = airline.iata || airline.code || '';
    return code ? `${code} - ${airline.name}` : airline.name;
  },
];

/**
 * Format airline link anchor text naturally with variation
 * Format: "Airline Name (IATA)"
 */
export function formatAirlineAnchor(airline: Airline, index: number = 0): string {
  const variation = airlineAnchorVariations[index % airlineAnchorVariations.length];
  return variation(airline);
}

/**
 * Natural anchor text variations for blogs (placeholder)
 */
export function formatBlogAnchor(blog: { slug: string; title: string }, index: number = 0): string {
  // Simple implementation - can be enhanced when blog system is added
  return blog.title;
}

/**
 * Check if a route URL should be linked (not noindex)
 */
export async function shouldLinkRoute(origin: string, destination: string): Promise<boolean> {
  const route = await getRoute(origin, destination);
  if (!route) return false;
  return route.has_flight_data === true;
}

/**
 * Check if an airport URL should be linked (not noindex)
 * Simplified check - in production you might want to check actual airport data
 */
export async function shouldLinkAirport(iata: string): Promise<boolean> {
  // For now, assume all airports are linkable if they exist
  // In production, integrate with shouldIndexAirport checks
  return true;
}
