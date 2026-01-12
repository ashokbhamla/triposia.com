/**
 * Client-safe formatting utilities
 * These functions don't require server-side dependencies
 */

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
export function formatAirlineName(name: string, iata?: string | null): string {
  if (iata) {
    return `${name} (${iata})`;
  }
  return name;
}

