import { getDatabase } from './mongodb';
import { AirportSummary, Airline } from './queries';

/**
 * Check if multiple airports exist in the same city
 */
async function hasMultipleAirportsInCity(city: string, country?: string): Promise<boolean> {
  const db = await getDatabase();
  const airportsCollection = db.collection<any>('airports');
  const query: any = { city };
  if (country) {
    query.country = country;
  }
  const count = await airportsCollection.countDocuments(query);
  return count > 1;
}

/**
 * Format airport name with city and IATA code
 * Format: "City Name (IATA)" or "Airport Name (IATA)" if multiple airports in city
 */
export async function formatAirportName(
  iata: string, 
  airport?: AirportSummary | null,
  cityOverride?: string | null
): Promise<string> {
  // Use cityOverride if provided, otherwise use airport.city
  const city = cityOverride || airport?.city;
  
  if (city) {
    // Check if there are multiple airports in the same city
    const multipleAirports = await hasMultipleAirportsInCity(city, airport?.country);
    
    if (multipleAirports && airport?.name) {
      // Multiple airports in same city - use airport name
      return `${airport.name} (${iata})`;
    } else {
      // Single airport in city - use city name
      return `${city} (${iata})`;
    }
  }
  
  // Fallback to just IATA if no city data
  return iata;
}

/**
 * Format airport display synchronously (for simple cases where we have city data)
 * Format: "City Name (IATA)"
 */
export function formatAirportDisplay(iata: string, city?: string | null): string {
  if (city) {
    return `${city} (${iata})`;
  }
  return iata;
}

/**
 * Format airline name with IATA code
 * Format: "Airline Name (IATA)"
 */
export function formatAirlineName(airline: Airline | null | undefined, code?: string): string {
  if (airline?.name) {
    const iataCode = airline.iata || airline.code || code || '';
    return iataCode ? `${airline.name} (${iataCode})` : airline.name;
  }
  return code || 'Unknown Airline';
}

/**
 * Format airline display for titles and headings
 */
export function formatAirlineDisplay(name: string, code: string): string {
  return `${name} (${code})`;
}

