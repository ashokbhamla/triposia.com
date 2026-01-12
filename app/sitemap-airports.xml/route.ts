import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { shouldIndexAirport } from '@/lib/indexing';
import { evaluateAirportPageQuality } from '@/lib/pageQuality';
import { getEntityRole, getSitemapPriority } from '@/lib/entityRoles';
import { COMPANY_INFO } from '@/lib/company';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Revalidate daily

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || COMPANY_INFO.website;
  // Use a date within the last 15 days (7 days ago as default)
  const lastMod = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const db = await getDatabase();
  const airportsCollection = db.collection<any>('airports');
  
  // Get airports with significant activity
  const airports = await airportsCollection
    .find({
      $or: [
        { departure_count: { $gt: 0 } },
        { arrival_count: { $gt: 0 } },
      ],
    })
    .sort({ departure_count: -1 })
    .limit(10000) // Increased limit for separate sitemap
    .toArray();

  const urls: string[] = [];

  for (const airport of airports) {
    const iata = airport.iata_from?.toLowerCase();
    if (!iata) continue;

    // Quick indexing check
    const indexingCheck = shouldIndexAirport(airport, []);
    if (!indexingCheck.shouldIndex) continue;

    // Quality check
    const qualityCheck = evaluateAirportPageQuality({
      airport,
      flights: [],
      routesFrom: [],
      pois: [],
      terminals: airport.terminals,
    });
    if (!qualityCheck.indexable) continue;

    const role = getEntityRole('airport');
    const priority = getSitemapPriority(role);

    urls.push(`  <url>
    <loc>${baseUrl}/airports/${iata}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`);
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

