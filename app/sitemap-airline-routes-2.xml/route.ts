import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { formatRouteSlug } from '@/lib/seo';
import { COMPANY_INFO } from '@/lib/company';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const URLS_PER_PART = 10000;
const PART = 2;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || COMPANY_INFO.website;
  const lastMod = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const db = await getDatabase();
  const urls: string[] = [];

  const airlinesCollection = db.collection<any>('airlines');
  const airlines = await airlinesCollection.find({}).limit(10000).toArray();

  const routesCollection = db.collection<any>('routes');
  const routes = await routesCollection
    .find({ has_flight_data: true })
    .sort({ flights_per_day: -1 })
    .limit(50000)
    .toArray();

  const departuresCollection = db.collection<any>('departures');
  const airlineRoutesMap = new Map<string, Set<string>>();
  
  for (const airline of airlines) {
    const airlineCode = airline.iata || airline.code;
    if (!airlineCode) continue;
    
    const code = airline.iata?.toLowerCase() || airline.code?.toLowerCase();
    airlineRoutesMap.set(code, new Set());
    
    const airlineFlights = await departuresCollection
      .find({ airline_iata: airlineCode.toUpperCase() })
      .limit(1000)
      .toArray();
    
    const uniqueRoutes = new Set<string>();
    airlineFlights.forEach((flight: any) => {
      if (flight.origin_iata && flight.destination_iata) {
        const routeKey = `${flight.origin_iata}-${flight.destination_iata}`;
        uniqueRoutes.add(routeKey);
      }
    });
    
    airlineRoutesMap.set(code, uniqueRoutes);
  }

  const allUrls: string[] = [];
  
  for (const airline of airlines) {
    const code = airline.iata?.toLowerCase() || airline.code?.toLowerCase();
    if (!code) continue;

    const uniqueRoutes = airlineRoutesMap.get(code);
    if (!uniqueRoutes || uniqueRoutes.size === 0) continue;

    for (const routeKey of uniqueRoutes) {
      const [originIata, destinationIata] = routeKey.split('-');
      if (!originIata || !destinationIata) continue;
      
      const route = routes.find(
        (r: any) => 
          r.origin_iata === originIata.toUpperCase() && 
          r.destination_iata === destinationIata.toUpperCase()
      );
      
      if (route && route.has_flight_data) {
        const routeSlug = formatRouteSlug(originIata, destinationIata);
        allUrls.push(`  <url>
    <loc>${baseUrl}/airlines/${code}/${routeSlug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }
  }

  const startIndex = (PART - 1) * URLS_PER_PART;
  const endIndex = PART * URLS_PER_PART;
  const partUrls = allUrls.slice(startIndex, endIndex);

  if (partUrls.length === 0) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/airlines</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  if (partUrls.length === 0) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${partUrls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

