/**
 * Intro Text Validation
 * 
 * STRICT RULE: Do NOT render an intro paragraph unless it references
 * at least TWO real data points (numbers, terminals, airlines, distance, frequency).
 */

export interface IntroDataPoints {
  flights_count?: number;
  airlines_count?: number;
  routes_count?: number;
  terminals_count?: number;
  distance?: string | number;
  duration?: string;
  frequency?: string;
  departure_count?: number;
  arrival_count?: number;
  destinations_count?: number;
}

/**
 * Validate that intro text references at least 2 data points
 * 
 * @param introText The intro text to validate
 * @param dataPoints Available data points that should be referenced
 * @returns Validation result with referenced data points
 */
export function validateIntroText(
  introText: string,
  dataPoints: IntroDataPoints
): { isValid: boolean; referencedDataPoints: string[] } {
  const referencedDataPoints: string[] = [];
  
  if (!introText || introText.trim().length === 0) {
    return { isValid: false, referencedDataPoints: [] };
  }

  // Check which data points are referenced in the intro
  if (dataPoints.flights_count !== undefined && introText.includes(String(dataPoints.flights_count))) {
    referencedDataPoints.push('flights_count');
  }
  if (dataPoints.airlines_count !== undefined && introText.includes(String(dataPoints.airlines_count))) {
    referencedDataPoints.push('airlines_count');
  }
  if (dataPoints.routes_count !== undefined && introText.includes(String(dataPoints.routes_count))) {
    referencedDataPoints.push('routes_count');
  }
  if (dataPoints.terminals_count !== undefined && introText.includes(String(dataPoints.terminals_count))) {
    referencedDataPoints.push('terminals_count');
  }
  if (dataPoints.distance && introText.includes(String(dataPoints.distance))) {
    referencedDataPoints.push('distance');
  }
  if (dataPoints.duration && introText.includes(String(dataPoints.duration))) {
    referencedDataPoints.push('duration');
  }
  if (dataPoints.frequency && introText.includes(String(dataPoints.frequency))) {
    referencedDataPoints.push('frequency');
  }
  if (dataPoints.departure_count !== undefined && introText.includes(String(dataPoints.departure_count))) {
    referencedDataPoints.push('departure_count');
  }
  if (dataPoints.arrival_count !== undefined && introText.includes(String(dataPoints.arrival_count))) {
    referencedDataPoints.push('arrival_count');
  }
  if (dataPoints.destinations_count !== undefined && introText.includes(String(dataPoints.destinations_count))) {
    referencedDataPoints.push('destinations_count');
  }

  // Check for airline names or codes (if airlines_count is provided)
  if (dataPoints.airlines_count !== undefined && dataPoints.airlines_count > 0) {
    // If text mentions "airline" or "airlines" in context of the count, count it
    const airlineMentions = (introText.match(/\bairline(s)?\b/gi) || []).length;
    if (airlineMentions > 0) {
      referencedDataPoints.push('airlines');
    }
  }

  // STRICT RULE: Need at least 2 data points referenced
  return {
    isValid: referencedDataPoints.length >= 2,
    referencedDataPoints,
  };
}

/**
 * Generate intro text that references at least 2 data points
 * Returns null if insufficient data points available
 */
export function generateValidatedIntroText(
  dataPoints: IntroDataPoints,
  template: (points: IntroDataPoints) => string
): string | null {
  const introText = template(dataPoints);
  const validation = validateIntroText(introText, dataPoints);
  
  if (!validation.isValid) {
    return null; // Do not render intro if validation fails
  }
  
  return introText;
}

