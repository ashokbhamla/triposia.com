import { Flight, Route, AirportSummary } from './queries';

export function calculateReliability(flights: Flight[], routes: Route[]): 'Very Stable' | 'Moderate' | 'Seasonal' | 'Limited' {
  if (flights.length === 0) return 'Limited';
  
  const dailyFlights = flights.length;
  if (dailyFlights >= 15) return 'Very Stable';
  if (dailyFlights >= 5) return 'Moderate';
  if (dailyFlights >= 2) return 'Seasonal';
  return 'Limited';
}

export function extractAircraftTypes(flights: Flight[]): string[] {
  const types = new Set<string>();
  flights.forEach((flight) => {
    if (flight.aircraft) {
      types.add(flight.aircraft);
    }
  });
  return Array.from(types).sort();
}

export function categorizeAircraft(flights: Flight[]): { jet: number; turboprop: number } {
  const jetTypes = ['737', '777', '787', 'A320', 'A330', 'A350', 'A380', 'Boeing', 'Airbus'];
  let jet = 0;
  let turboprop = 0;

  flights.forEach((flight) => {
    if (flight.aircraft) {
      const isJet = jetTypes.some((type) => flight.aircraft!.toUpperCase().includes(type.toUpperCase()));
      if (isJet) {
        jet++;
      } else {
        turboprop++;
      }
    }
  });

  return { jet, turboprop };
}

export function getBestTimeToFly(flights: Flight[]): string {
  if (flights.length === 0) return 'Data not available';
  
  const morningFlights = flights.filter((f) => {
    if (!f.departure_time) return false;
    const hour = parseInt(f.departure_time.split(':')[0]);
    return hour >= 6 && hour < 12;
  }).length;

  const afternoonFlights = flights.filter((f) => {
    if (!f.departure_time) return false;
    const hour = parseInt(f.departure_time.split(':')[0]);
    return hour >= 12 && hour < 18;
  }).length;

  const eveningFlights = flights.filter((f) => {
    if (!f.departure_time) return false;
    const hour = parseInt(f.departure_time.split(':')[0]);
    return hour >= 18 || hour < 6;
  }).length;

  if (morningFlights > afternoonFlights && morningFlights > eveningFlights) {
    return 'Morning (6 AM - 12 PM) offers the most flight options';
  }
  if (afternoonFlights > eveningFlights) {
    return 'Afternoon (12 PM - 6 PM) offers the most flight options';
  }
  return 'Evening/Night flights available';
}

export function getBusiestHours(flights: Flight[]): string {
  if (flights.length === 0) return 'Data not available';
  
  const hourCounts: Record<number, number> = {};
  flights.forEach((flight) => {
    if (flight.departure_time) {
      const hour = parseInt(flight.departure_time.split(':')[0]);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  const sortedHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => `${hour}:00`);

  return sortedHours.length > 0 ? sortedHours.join(', ') : 'Data not available';
}

export function getAverageDuration(flights: Flight[]): string {
  if (flights.length === 0) return 'Data not available';
  
  const durations = flights
    .filter((f) => f.duration)
    .map((f) => {
      if (typeof f.duration === 'string') {
        const parts = f.duration.split(' ');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[2]) || 0;
        return hours * 60 + minutes;
      }
      return 0;
    });

  if (durations.length === 0) return 'Data not available';
  
  const avgMinutes = durations.reduce((a, b) => a + b, 0) / durations.length;
  const hours = Math.floor(avgMinutes / 60);
  const mins = Math.round(avgMinutes % 60);
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
}

// Extract insights from destinations collection metadata
export function extractRouteMetadata(destData: any): {
  averageDuration?: string;
  earliestFlight?: string;
  lastFlight?: string;
  distance?: string;
  cheapestMonth?: string;
  flightsPerWeek?: string;
  airlines?: string[];
} {
  if (!destData?.flight_data?.metadata) return {};
  
  const metadata = destData.flight_data.metadata;
  return {
    averageDuration: metadata.flight_time,
    earliestFlight: metadata.earliest_flight,
    lastFlight: metadata.last_flight,
    distance: metadata.distance,
    cheapestMonth: metadata.cheapest_month,
    flightsPerWeek: metadata.flights_per_week,
    airlines: metadata.airlines ? [metadata.airlines] : [],
  };
}

export function getDomesticInternationalSplit(airport: AirportSummary, routes: Route[]): {
  domestic: number;
  international: number;
} {
  if (airport.domestic_count !== undefined && airport.international_count !== undefined) {
    return {
      domestic: airport.domestic_count,
      international: airport.international_count,
    };
  }

  // Calculate from routes if not available
  const domestic = routes.filter((r) => r.is_domestic !== false).length;
  const international = routes.filter((r) => r.is_domestic === false).length;
  
  return { domestic, international };
}

