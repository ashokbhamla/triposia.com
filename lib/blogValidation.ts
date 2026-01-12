/**
 * Blog Validation - Ensures blogs are linked to at least one entity
 * 
 * Rules:
 * - Blogs cannot be published unless linked to at least one:
 *   - Route (origin-destination pair)
 *   - Airport (IATA code)
 *   - Airline (IATA/code)
 */

export interface BlogEntityLinks {
  routes?: Array<{ origin_iata: string; destination_iata: string }>;
  airports?: string[]; // IATA codes
  airlines?: string[]; // Airline codes
}

export interface BlogValidationResult {
  isValid: boolean;
  canPublish: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate that a blog has at least one entity link
 * 
 * @param entityLinks - The linked entities for the blog
 * @returns Validation result
 */
export function validateBlogEntityLinks(entityLinks: BlogEntityLinks): BlogValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const routesCount = entityLinks.routes?.length || 0;
  const airportsCount = entityLinks.airports?.length || 0;
  const airlinesCount = entityLinks.airlines?.length || 0;

  const totalLinks = routesCount + airportsCount + airlinesCount;

  // Core requirement: Must have at least one link
  if (totalLinks === 0) {
    errors.push(
      'Blog must be linked to at least one entity (route, airport, or airline) before publishing.'
    );
  }

  // Validation: Ensure IATA codes are uppercase
  if (entityLinks.airports) {
    entityLinks.airports.forEach((iata, idx) => {
      if (iata !== iata.toUpperCase()) {
        warnings.push(`Airport IATA code "${iata}" should be uppercase (row ${idx + 1})`);
      }
      if (iata.length !== 3) {
        errors.push(`Invalid airport IATA code: "${iata}" (must be 3 characters)`);
      }
    });
  }

  // Validation: Ensure route pairs are valid
  if (entityLinks.routes) {
    entityLinks.routes.forEach((route, idx) => {
      if (!route.origin_iata || !route.destination_iata) {
        errors.push(`Route ${idx + 1} must have both origin and destination IATA codes`);
      }
      if (route.origin_iata && route.origin_iata.length !== 3) {
        errors.push(`Invalid origin IATA code: "${route.origin_iata}" (must be 3 characters)`);
      }
      if (route.destination_iata && route.destination_iata.length !== 3) {
        errors.push(`Invalid destination IATA code: "${route.destination_iata}" (must be 3 characters)`);
      }
      if (route.origin_iata === route.destination_iata) {
        errors.push(`Route ${idx + 1} cannot have the same origin and destination (${route.origin_iata})`);
      }
    });
  }

  // Validation: Ensure airline codes are valid
  if (entityLinks.airlines) {
    entityLinks.airlines.forEach((code, idx) => {
      if (!code || code.length === 0) {
        errors.push(`Airline code at index ${idx + 1} is empty`);
      }
      // Airline codes can be 2-3 characters (IATA) or longer (ICAO/custom)
      if (code.length < 2) {
        errors.push(`Invalid airline code: "${code}" (must be at least 2 characters)`);
      }
    });
  }

  const isValid = errors.length === 0;
  const canPublish = isValid && totalLinks > 0;

  return {
    isValid,
    canPublish,
    errors,
    warnings,
  };
}

/**
 * Check if a blog has links to a specific airport
 */
export function blogLinksToAirport(
  entityLinks: BlogEntityLinks,
  airportIata: string
): boolean {
  const normalizedIata = airportIata.toUpperCase();
  
  // Check direct airport links
  if (entityLinks.airports?.includes(normalizedIata)) {
    return true;
  }

  // Check route links (origin or destination)
  if (entityLinks.routes) {
    return entityLinks.routes.some(
      route =>
        route.origin_iata?.toUpperCase() === normalizedIata ||
        route.destination_iata?.toUpperCase() === normalizedIata
    );
  }

  return false;
}

/**
 * Check if a blog has links to a specific route
 */
export function blogLinksToRoute(
  entityLinks: BlogEntityLinks,
  originIata: string,
  destinationIata: string
): boolean {
  const normalizedOrigin = originIata.toUpperCase();
  const normalizedDestination = destinationIata.toUpperCase();

  if (!entityLinks.routes) {
    return false;
  }

  return entityLinks.routes.some(
    route =>
      route.origin_iata?.toUpperCase() === normalizedOrigin &&
      route.destination_iata?.toUpperCase() === normalizedDestination
  );
}

/**
 * Check if a blog has links to a specific airline
 */
export function blogLinksToAirline(
  entityLinks: BlogEntityLinks,
  airlineCode: string
): boolean {
  const normalizedCode = airlineCode.toUpperCase();

  if (!entityLinks.airlines) {
    return false;
  }

  return entityLinks.airlines.some(
    code => code.toUpperCase() === normalizedCode
  );
}

/**
 * Extract all unique airport IATA codes from blog entity links
 * (includes airports from direct links and route origins/destinations)
 */
export function extractAirportIatasFromBlog(entityLinks: BlogEntityLinks): string[] {
  const airports = new Set<string>();

  // Direct airport links
  if (entityLinks.airports) {
    entityLinks.airports.forEach(iata => airports.add(iata.toUpperCase()));
  }

  // Airport codes from routes
  if (entityLinks.routes) {
    entityLinks.routes.forEach(route => {
      if (route.origin_iata) {
        airports.add(route.origin_iata.toUpperCase());
      }
      if (route.destination_iata) {
        airports.add(route.destination_iata.toUpperCase());
      }
    });
  }

  return Array.from(airports);
}

/**
 * Extract all unique airline codes from blog entity links
 */
export function extractAirlineCodesFromBlog(entityLinks: BlogEntityLinks): string[] {
  if (!entityLinks.airlines) {
    return [];
  }

  return Array.from(new Set(entityLinks.airlines.map(code => code.toUpperCase())));
}

/**
 * Extract all routes from blog entity links
 */
export function extractRoutesFromBlog(entityLinks: BlogEntityLinks): Array<{ origin_iata: string; destination_iata: string }> {
  if (!entityLinks.routes) {
    return [];
  }

  return entityLinks.routes.map(route => ({
    origin_iata: route.origin_iata.toUpperCase(),
    destination_iata: route.destination_iata.toUpperCase(),
  }));
}

