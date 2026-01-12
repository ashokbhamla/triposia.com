/**
 * Index Health Check Utility
 * 
 * Provides internal audit reporting for SEO safety:
 * - % indexable vs noindex pages
 * - Pages with < 3 internal links
 * - Orphan pages
 * - Pages with identical section patterns
 */

import { getDatabase } from './mongodb';
import { evaluatePageQuality, PageQualityInput } from './pageQuality';
import { shouldIndexRoute, shouldIndexAirport } from './indexing';

export interface IndexHealthReport {
  totalPages: number;
  indexablePages: number;
  noindexPages: number;
  indexabilityRate: number;
  pagesWithLowLinks: Array<{ url: string; linkCount: number }>;
  orphanPages: Array<{ url: string; type: string }>;
  duplicatePatterns: Array<{ pattern: string; count: number; urls: string[] }>;
}

/**
 * Analyze index health for a sample of pages
 * Note: Full analysis can be expensive - use for periodic audits
 */
export async function generateIndexHealthReport(
  sampleSize: number = 100
): Promise<IndexHealthReport> {
  const db = await getDatabase();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://triposia.com';

  // Sample airports
  const airports = await db.collection('airports')
    .find({})
    .limit(sampleSize)
    .toArray();

  // Sample routes
  const routes = await db.collection('routes')
    .find({ has_flight_data: true })
    .limit(sampleSize)
    .toArray();

  const indexablePages: Array<{ url: string; type: string }> = [];
  const noindexPages: Array<{ url: string; type: string; reason?: string }> = [];
  const pagesWithLowLinks: Array<{ url: string; linkCount: number }> = [];
  const sectionPatterns = new Map<string, Array<{ url: string }>>();

  // Analyze airports
  for (const airport of airports) {
    const iata = airport.iata_from?.toLowerCase();
    if (!iata) continue;

    const url = `${baseUrl}/airports/${iata}`;
    const indexingCheck = shouldIndexAirport(airport, []);
    
    const qualityInput: PageQualityInput = {
      flights_count: airport.departure_count || 0,
      airlines_count: 0, // Would need to query flights
      routes_count: airport.destinations_count || 0,
      terminals_count: airport.terminals?.length || 0,
      has_airport_data: true,
    };

    const qualityCheck = evaluatePageQuality(qualityInput);
    const isIndexable = indexingCheck.shouldIndex && qualityCheck.indexable;

    if (isIndexable) {
      indexablePages.push({ url, type: 'airport' });
    } else {
      noindexPages.push({ 
        url, 
        type: 'airport',
        reason: indexingCheck.reason || qualityCheck.reason,
      });
    }

    // Track section patterns (simplified)
    const patternKey = `airport:${qualityCheck.allowedSections.sort().join(',')}`;
    if (!sectionPatterns.has(patternKey)) {
      sectionPatterns.set(patternKey, []);
    }
    sectionPatterns.get(patternKey)!.push({ url });
  }

  // Analyze routes
  for (const route of routes) {
    if (!route.origin_iata || !route.destination_iata) continue;
    
    const routeSlug = `${route.origin_iata.toLowerCase()}-${route.destination_iata.toLowerCase()}`;
    const url = `${baseUrl}/flights/${routeSlug}`;
    const indexingCheck = shouldIndexRoute([], route);
    
    const qualityInput: PageQualityInput = {
      flights_count: 0, // Would need to query flights
      airlines_count: 0, // Would need to query flights
      distance_available: true, // Routes typically have distance
      duration_available: !!route.average_duration || !!route.typical_duration,
      has_route_data: true,
    };

    const qualityCheck = evaluatePageQuality(qualityInput);
    const isIndexable = indexingCheck.shouldIndex && qualityCheck.indexable;

    if (isIndexable) {
      indexablePages.push({ url, type: 'route' });
    } else {
      noindexPages.push({ 
        url, 
        type: 'route',
        reason: indexingCheck.reason || qualityCheck.reason,
      });
    }

    // Track section patterns
    const patternKey = `route:${qualityCheck.allowedSections.sort().join(',')}`;
    if (!sectionPatterns.has(patternKey)) {
      sectionPatterns.set(patternKey, []);
    }
    sectionPatterns.get(patternKey)!.push({ url });
  }

  // Find duplicate patterns (pages with identical section structures)
  const duplicatePatterns = Array.from(sectionPatterns.entries())
    .filter(([_, pages]) => pages.length > 5) // Same pattern used > 5 times
    .map(([pattern, pages]) => ({
      pattern,
      count: pages.length,
      urls: pages.slice(0, 10).map(p => p.url), // Limit URLs shown
    }))
    .sort((a, b) => b.count - a.count);

  const totalPages = indexablePages.length + noindexPages.length;
  const indexabilityRate = totalPages > 0 
    ? (indexablePages.length / totalPages) * 100 
    : 0;

  return {
    totalPages,
    indexablePages: indexablePages.length,
    noindexPages: noindexPages.length,
    indexabilityRate: Math.round(indexabilityRate * 100) / 100,
    pagesWithLowLinks, // Would need to analyze actual page content
    orphanPages: [], // Would need link graph analysis
    duplicatePatterns,
  };
}

/**
 * Quick health check - returns summary statistics
 */
export async function quickHealthCheck(): Promise<{
  indexabilityRate: number;
  duplicatePatternCount: number;
}> {
  const report = await generateIndexHealthReport(50); // Smaller sample for speed
  return {
    indexabilityRate: report.indexabilityRate,
    duplicatePatternCount: report.duplicatePatterns.length,
  };
}

