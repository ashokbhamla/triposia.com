import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { formatRouteSlug } from '@/lib/seo';
import { shouldIndexRoute } from '@/lib/indexing';
import { evaluateRoutePageQuality } from '@/lib/pageQuality';
import { getEntityRole, getSitemapPriority, shouldIncludeInSitemap } from '@/lib/entityRoles';
import { COMPANY_INFO } from '@/lib/company';

// Make dynamic to prevent build timeouts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || COMPANY_INFO.website;
  // Use a date within the last 15 days (7 days ago as default)
  const lastMod = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const db = await getDatabase();
  const routesCollection = db.collection<any>('routes');
  
  // Get routes with flight data
  const routes = await routesCollection
    .find({ has_flight_data: true })
    .sort({ flights_per_day: -1 })
    .limit(50000) // Increased limit for separate sitemap
    .toArray();

  const urls: string[] = [];

  for (const route of routes) {
    if (!route.origin_iata || !route.destination_iata) continue;
    
    // Basic validation for sitemap - routes with has_flight_data are valid
    if (!route.has_flight_data) continue;
    
    // Ensure flights_per_day indicates real activity
    const flightsPerDay = route.flights_per_day;
    if (!flightsPerDay || flightsPerDay === '0 flights' || flightsPerDay === '0-0 flights') {
      continue;
    }

    // For sitemap, we use simplified quality check
    // Count available data points from route data
    let qualityScore = 0;
    if (route.has_flight_data) qualityScore++;
    if (route.flights_per_day) qualityScore++;
    if (route.average_duration || route.typical_duration) qualityScore++;
    if (route.origin_iata && route.destination_iata) qualityScore++;
    
    // Include routes with at least 2 data points (more lenient for sitemap)
    if (qualityScore < 2) continue;

    const role = getEntityRole('route');
    const priority = getSitemapPriority(role, qualityScore);
    
    // For sitemap, be more lenient - include routes with basic data
    // Hubs and routes with qualityScore >= 2 are included
    if (role !== 'hub' && qualityScore < 2) continue;

    const routeSlug = formatRouteSlug(route.origin_iata, route.destination_iata);
    urls.push(`  <url>
    <loc>${baseUrl}/flights/${routeSlug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`);
  }

  // Ensure at least one URL exists (required by sitemap protocol)
  if (urls.length === 0) {
    // Return a minimal valid sitemap with the main flights page
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/flights</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

