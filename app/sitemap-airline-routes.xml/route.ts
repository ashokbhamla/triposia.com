import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { formatRouteSlug } from '@/lib/seo';
import { COMPANY_INFO } from '@/lib/company';

// Make dynamic to prevent build timeouts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || COMPANY_INFO.website;
  // Use a date within the last 15 days (7 days ago as default)
  const lastMod = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const db = await getDatabase();
  const urls: string[] = [];

  // Get all airlines
  const airlinesCollection = db.collection<any>('airlines');
  const airlines = await airlinesCollection
    .find({})
    .limit(10000)
    .toArray();

  // Get routes with flight data
  const routesCollection = db.collection<any>('routes');
  const routes = await routesCollection
    .find({ has_flight_data: true })
    .sort({ flights_per_day: -1 })
    .limit(50000)
    .toArray();

  // Get departures to find airline-route combinations
  const departuresCollection = db.collection<any>('departures');
  
  // Create a map of airline -> routes
  const airlineRoutesMap = new Map<string, Set<string>>();
  
  for (const airline of airlines) {
    const airlineCode = airline.iata || airline.code;
    if (!airlineCode) continue;
    
    const code = airline.iata?.toLowerCase() || airline.code?.toLowerCase();
    airlineRoutesMap.set(code, new Set());
    
    // Find unique routes for this airline from departures
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

  // Generate airline-route pages
  for (const airline of airlines) {
    const code = airline.iata?.toLowerCase() || airline.code?.toLowerCase();
    if (!code) continue;

    const uniqueRoutes = airlineRoutesMap.get(code);
    if (!uniqueRoutes || uniqueRoutes.size === 0) continue;

    // Match with routes that have flight data
    for (const routeKey of uniqueRoutes) {
      const [originIata, destinationIata] = routeKey.split('-');
      if (!originIata || !destinationIata) continue;
      
      // Check if this route exists in our routes collection
      const route = routes.find(
        (r: any) => 
          r.origin_iata === originIata.toUpperCase() && 
          r.destination_iata === destinationIata.toUpperCase()
      );
      
      if (route && route.has_flight_data) {
        const routeSlug = formatRouteSlug(originIata, destinationIata);
        urls.push(`  <url>
    <loc>${baseUrl}/airlines/${code}/${routeSlug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }
  }

  // Ensure at least one URL exists
  if (urls.length === 0) {
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

