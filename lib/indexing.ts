/**
 * Indexing eligibility checks for Google Scaled Content Abuse compliance
 * 
 * Rules:
 * - Only index pages with active flights and real schedules
 * - Automatically noindex routes with zero flights
 * - Automatically noindex thin airline-airport combinations
 * - Ensure pages have sufficient data variance
 */

export interface IndexingCheck {
  shouldIndex: boolean;
  reason?: string;
}

/**
 * Check if a route page should be indexed
 */
export function shouldIndexRoute(flights: any[], route: any | null): IndexingCheck {
  // No route data - don't index
  if (!route) {
    return { shouldIndex: false, reason: 'Route not found' };
  }

  // Zero flights - don't index
  if (!flights || flights.length === 0) {
    return { shouldIndex: false, reason: 'No active flights' };
  }

  // Check if route has flight data flag
  if (!route.has_flight_data) {
    return { shouldIndex: false, reason: 'Route has no flight data' };
  }

  // Ensure flights_per_day indicates real activity
  const flightsPerDay = route.flights_per_day;
  if (!flightsPerDay || flightsPerDay === '0 flights' || flightsPerDay === '0-0 flights') {
    return { shouldIndex: false, reason: 'Zero flights per day' };
  }

  return { shouldIndex: true };
}

/**
 * Check if an airport page should be indexed
 */
export function shouldIndexAirport(airport: any | null, flights: any[]): IndexingCheck {
  // No airport data - don't index
  if (!airport) {
    return { shouldIndex: false, reason: 'Airport not found' };
  }

  // Zero departures and arrivals - don't index
  const totalActivity = (airport.departure_count || 0) + (airport.arrival_count || 0);
  if (totalActivity === 0) {
    return { shouldIndex: false, reason: 'No airport activity' };
  }

  // No destinations - don't index
  if (!airport.destinations_count || airport.destinations_count === 0) {
    return { shouldIndex: false, reason: 'No destinations served' };
  }

  // Very low activity - may be thin content
  if (totalActivity < 5 && (!flights || flights.length < 5)) {
    return { shouldIndex: false, reason: 'Insufficient activity (less than 5 flights)' };
  }

  return { shouldIndex: true };
}

/**
 * Check if an airline route page should be indexed
 */
export function shouldIndexAirlineRoute(flights: any[], route: any | null): IndexingCheck {
  // No route data
  if (!route) {
    return { shouldIndex: false, reason: 'Route not found' };
  }

  // Zero flights for this airline on this route
  if (!flights || flights.length === 0) {
    return { shouldIndex: false, reason: 'No airline flights on route' };
  }

  return { shouldIndex: true };
}

/**
 * Check if an airline-airport page should be indexed
 */
export function shouldIndexAirlineAirport(flights: any[], airport: any | null): IndexingCheck {
  // No airport data
  if (!airport) {
    return { shouldIndex: false, reason: 'Airport not found' };
  }

  // Zero flights - thin content
  if (!flights || flights.length === 0) {
    return { shouldIndex: false, reason: 'No airline flights from airport' };
  }

  // Very few flights - may be thin
  if (flights.length < 3) {
    return { shouldIndex: false, reason: 'Insufficient flights (less than 3)' };
  }

  return { shouldIndex: true };
}

