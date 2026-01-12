/**
 * Anti-Duplication Safeguards - Page Quality Evaluation
 * 
 * Prevents indexing of pages with insufficient unique value
 */

import crypto from 'crypto';

export interface PageQualityCheck {
  indexable: boolean; // Renamed from shouldIndex for clarity
  qualityScore: number;
  uniqueDataPoints: string[];
  missingDataPoints: string[];
  allowedSections: string[]; // Renamed from sectionsAllowed
  reason?: string;
}

// Backward compatibility alias
export type PageQualityResult = PageQualityCheck;

export interface PageQualityInput {
  flights_count: number;
  airlines_count: number;
  poi_count?: number;
  unique_data_blocks?: number;
  schedules_count?: number;
  weather_data_available?: boolean;
  // Optional additional metrics
  routes_count?: number;
  terminals_count?: number;
  distance_available?: boolean;
  duration_available?: boolean;
  has_route_data?: boolean;
  has_airport_data?: boolean;
}

export interface RoutePageData {
  flights: any[];
  route: any | null;
  routeMetadata?: any;
  pois: any[];
  airlines: string[];
  distance?: string;
  averageDuration?: string;
  routeType?: 'Domestic' | 'International';
  busiestHours?: string;
  cheapestMonths?: string;
}

export interface AirportPageData {
  airport: any | null;
  flights: any[];
  routesFrom: any[];
  pois: any[];
  terminals?: any[];
  busiestHours?: string;
}

/**
 * Centralized page quality evaluation function
 * 
 * @param input Quality metrics for the page
 * @returns Evaluation result with indexability and allowed sections
 */
/**
 * Centralized page quality evaluation function
 * 
 * STRICT RULES:
 * - Default indexable = false
 * - Indexable = true ONLY IF:
 *   - At least 3 meaningful, unique data blocks exist
 *   - Data is not a clone of another page type
 *   - Page provides real decision-making value
 * 
 * @param input Quality metrics for the page
 * @returns Evaluation result with indexability and allowed sections
 */
export function evaluatePageQuality(input: PageQualityInput): PageQualityCheck {
  const {
    flights_count,
    airlines_count,
    poi_count = 0,
    unique_data_blocks: providedUniqueBlocks,
    schedules_count = 0,
    weather_data_available = false,
    routes_count = 0,
    terminals_count = 0,
    distance_available = false,
    duration_available = false,
    has_route_data = false,
    has_airport_data = false,
  } = input;

  const uniqueDataPoints: string[] = [];
  const missingDataPoints: string[] = [];
  const allowedSections: string[] = [];

  // Core requirement: Must have flights or data
  if (flights_count === 0 && !has_route_data && !has_airport_data) {
    return {
      indexable: false,
      qualityScore: 0,
      uniqueDataPoints: [],
      missingDataPoints: ['flights', 'route_data', 'airport_data'],
      allowedSections: [],
      reason: 'No flights or data available',
    };
  }

  // Count unique data blocks (meaningful data points)
  if (flights_count > 0) {
    uniqueDataPoints.push(`flights:${flights_count}`);
    allowedSections.push('flight_schedule');
  } else {
    missingDataPoints.push('flights');
  }

  if (airlines_count > 0) {
    uniqueDataPoints.push(`airlines:${airlines_count}`);
    allowedSections.push('airlines_list');
  } else {
    missingDataPoints.push('airlines');
  }

  if (poi_count > 0) {
    uniqueDataPoints.push(`pois:${poi_count}`);
    allowedSections.push('pois');
  }

  if (schedules_count > 0) {
    uniqueDataPoints.push(`schedules:${schedules_count}`);
    allowedSections.push('schedule_calendar');
  }

  if (weather_data_available) {
    uniqueDataPoints.push('weather');
    allowedSections.push('weather_info');
  }

  if (routes_count > 0) {
    uniqueDataPoints.push(`routes:${routes_count}`);
    allowedSections.push('routes_list');
  }

  if (terminals_count > 0) {
    uniqueDataPoints.push(`terminals:${terminals_count}`);
    allowedSections.push('terminals_info');
  }

  if (distance_available) {
    uniqueDataPoints.push('distance');
    allowedSections.push('distance_info');
  }

  if (duration_available) {
    uniqueDataPoints.push('duration');
    allowedSections.push('duration_info');
  }

  // Use provided unique_data_blocks if available, otherwise count what we have
  const qualityScore = providedUniqueBlocks !== undefined 
    ? providedUniqueBlocks 
    : uniqueDataPoints.length;

  // STRICT RULE: Default indexable = false
  // Indexable = true ONLY IF at least 3 meaningful, unique data blocks exist
  const MIN_UNIQUE_BLOCKS = 3;
  const hasMinimumData = qualityScore >= MIN_UNIQUE_BLOCKS;

  if (!hasMinimumData) {
    return {
      indexable: false,
      qualityScore,
      uniqueDataPoints,
      missingDataPoints,
      allowedSections,
      reason: `Insufficient unique data blocks: ${qualityScore}/${MIN_UNIQUE_BLOCKS} required`,
    };
  }

  // Additional sections that can be shown if data exists
  if (flights_count > 10) {
    allowedSections.push('statistics');
  }

  if (airlines_count > 1) {
    allowedSections.push('airline_comparison');
  }

  if (schedules_count > 0) {
    allowedSections.push('calendar_view');
  }

  return {
    indexable: true,
    qualityScore,
    uniqueDataPoints,
    missingDataPoints,
    allowedSections,
  };
}

/**
 * Generate content hash for duplicate detection (Rule 4)
 */
export function generateContentHash(textContent: string): string {
  // Remove numeric values and normalize whitespace for hashing
  const normalized = textContent
    .replace(/\d+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  
  return crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 16);
}

/**
 * Evaluate route page quality (Rules 1, 3, 6)
 * Converts RoutePageData to PageQualityInput and evaluates
 */
export function evaluateRoutePageQuality(data: RoutePageData): PageQualityCheck {
  const flights_count = data.flights?.length || 0;
  const airlines_count = data.airlines?.length || 0;
  const poi_count = data.pois?.length || 0;
  
  // Count unique data blocks
  let unique_data_blocks = 0;
  if (flights_count > 0) unique_data_blocks++;
  if (airlines_count > 0) unique_data_blocks++;
  if (poi_count > 0) unique_data_blocks++;
  if (data.distance) unique_data_blocks++;
  if (data.averageDuration && data.averageDuration !== 'Data not available') unique_data_blocks++;
  if (data.routeType) unique_data_blocks++;
  if (data.route?.flights_per_day) unique_data_blocks++;

  return evaluatePageQuality({
    flights_count,
    airlines_count,
    poi_count,
    unique_data_blocks,
    distance_available: !!data.distance,
    duration_available: !!(data.averageDuration && data.averageDuration !== 'Data not available'),
    has_route_data: !!data.route,
  });
}

/**
 * Evaluate airport page quality (Rules 1, 6)
 * Converts AirportPageData to PageQualityInput and evaluates
 */
export function evaluateAirportPageQuality(data: AirportPageData): PageQualityCheck {
  const flights_count = data.flights?.length || 0;
  const routes_count = data.routesFrom?.length || 0;
  const poi_count = data.pois?.length || 0;
  
  // Extract airline count from flights
  const airlines_count = data.flights 
    ? new Set(data.flights.map((f: any) => f.airline_iata).filter(Boolean)).size
    : 0;
  
  // Count unique data blocks
  let unique_data_blocks = 0;
  if (flights_count > 0) unique_data_blocks++;
  if (airlines_count > 0) unique_data_blocks++;
  if (routes_count > 0) unique_data_blocks++;
  if (poi_count > 0) unique_data_blocks++;
  if (data.airport?.destinations_count) unique_data_blocks++;
  if (data.terminals && data.terminals.length > 0) unique_data_blocks++;
  if (data.airport?.departure_count) unique_data_blocks++;
  if (data.airport?.arrival_count) unique_data_blocks++;

  return evaluatePageQuality({
    flights_count,
    airlines_count,
    poi_count,
    unique_data_blocks,
    routes_count,
    terminals_count: data.terminals?.length || 0,
    has_airport_data: !!data.airport,
  });
}

/**
 * Check if intro text meets Rule 3 requirements
 * Intro must reference at least TWO route/airport-specific data points
 */
export function validateIntroText(
  introText: string,
  dataPoints: { [key: string]: any }
): { isValid: boolean; referencedDataPoints: string[] } {
  const referencedDataPoints: string[] = [];
  
  // Check which data points are referenced in the intro
  if (dataPoints.distance && introText.includes(dataPoints.distance)) {
    referencedDataPoints.push('distance');
  }
  if (dataPoints.duration && introText.includes(dataPoints.duration)) {
    referencedDataPoints.push('duration');
  }
  if (dataPoints.airlineCount && introText.includes(String(dataPoints.airlineCount))) {
    referencedDataPoints.push('airline_count');
  }
  if (dataPoints.frequency && introText.includes(dataPoints.frequency)) {
    referencedDataPoints.push('frequency');
  }
  if (dataPoints.destinations && introText.includes(String(dataPoints.destinations))) {
    referencedDataPoints.push('destinations');
  }
  if (dataPoints.terminals && introText.includes(String(dataPoints.terminals))) {
    referencedDataPoints.push('terminals');
  }

  // Rule 3: Need at least 2 data points referenced
  return {
    isValid: referencedDataPoints.length >= 2,
    referencedDataPoints,
  };
}

/**
 * Content hash store for duplicate detection (Rule 4)
 * In production, use Redis or similar
 */
const contentHashes = new Map<string, Set<string>>();

/**
 * Check for duplicate content (Rule 4)
 */
export function checkContentDuplicate(pageType: string, contentHash: string): boolean {
  if (!contentHashes.has(pageType)) {
    contentHashes.set(pageType, new Set());
  }

  const hashes = contentHashes.get(pageType)!;
  
  if (hashes.has(contentHash)) {
    return true; // Duplicate found
  }
  
  hashes.add(contentHash);
  return false; // Not a duplicate
}
