import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { formatRouteSlug } from '@/lib/seo';
import { getEntityRole, getSitemapPriority } from '@/lib/entityRoles';
import { COMPANY_INFO } from '@/lib/company';
export const dynamic = 'force-dynamic';

export const revalidate = 0;

const URLS_PER_PART = 10000;
const PART = 1;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || COMPANY_INFO.website;
  const lastMod = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const skip = (PART - 1) * URLS_PER_PART;

  const db = await getDatabase();
  const routesCollection = db.collection<any>('routes');
  
  const routes = await routesCollection
    .find({ has_flight_data: true })
    .sort({ flights_per_day: -1 })
    .skip(skip)
    .limit(URLS_PER_PART)
    .toArray();

  const urls: string[] = [];

  for (const route of routes) {
    if (!route.origin_iata || !route.destination_iata) continue;
    if (!route.has_flight_data) continue;
    
    const flightsPerDay = route.flights_per_day;
    if (!flightsPerDay || flightsPerDay === '0 flights' || flightsPerDay === '0-0 flights') {
      continue;
    }

    let qualityScore = 0;
    if (route.has_flight_data) qualityScore++;
    if (route.flights_per_day) qualityScore++;
    if (route.average_duration || route.typical_duration) qualityScore++;
    if (route.origin_iata && route.destination_iata) qualityScore++;
    
    if (qualityScore < 2) continue;

    const role = getEntityRole('route');
    const priority = getSitemapPriority(role, qualityScore);
    
    if (role !== 'hub' && qualityScore < 2) continue;

    const routeSlug = formatRouteSlug(route.origin_iata, route.destination_iata);
    urls.push(`  <url>
    <loc>${baseUrl}/flights/${routeSlug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`);
  }

  if (urls.length === 0) {
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
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

