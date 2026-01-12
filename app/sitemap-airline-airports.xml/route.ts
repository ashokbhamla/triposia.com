import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
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

  // Get airports with activity
  const airportsCollection = db.collection<any>('airports');
  const airports = await airportsCollection
    .find({
      $or: [
        { departure_count: { $gt: 0 } },
        { arrival_count: { $gt: 0 } },
      ],
    })
    .limit(10000)
    .toArray();

  // Get departures to find airline-airport combinations
  const departuresCollection = db.collection<any>('departures');
  
  // Create a map of airline -> airports
  const airlineAirportsMap = new Map<string, Set<string>>();
  
  for (const airline of airlines) {
    const airlineCode = airline.iata || airline.code;
    if (!airlineCode) continue;
    
    const code = airline.iata?.toLowerCase() || airline.code?.toLowerCase();
    airlineAirportsMap.set(code, new Set());
    
    // Find unique airports for this airline from departures (as origin)
    const airlineFlights = await departuresCollection
      .find({ airline_iata: airlineCode.toUpperCase() })
      .limit(2000)
      .toArray();
    
    const uniqueAirports = new Set<string>();
    airlineFlights.forEach((flight: any) => {
      if (flight.origin_iata) {
        uniqueAirports.add(flight.origin_iata.toUpperCase());
      }
      if (flight.destination_iata) {
        uniqueAirports.add(flight.destination_iata.toUpperCase());
      }
    });
    
    airlineAirportsMap.set(code, uniqueAirports);
  }

  // Generate airline-airport pages
  for (const airline of airlines) {
    const code = airline.iata?.toLowerCase() || airline.code?.toLowerCase();
    if (!code) continue;

    const uniqueAirports = airlineAirportsMap.get(code);
    if (!uniqueAirports || uniqueAirports.size === 0) continue;

    // Match with airports that have activity
    for (const airportIata of uniqueAirports) {
      const airport = airports.find(
        (a: any) => a.iata_from === airportIata || a.iata === airportIata
      );
      
      if (airport && (airport.departure_count > 0 || airport.arrival_count > 0)) {
        urls.push(`  <url>
    <loc>${baseUrl}/airlines/${code}/${airportIata.toLowerCase()}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
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

