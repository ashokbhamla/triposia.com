import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
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

  const departuresCollection = db.collection<any>('departures');
  const airlineAirportsMap = new Map<string, Set<string>>();
  
  for (const airline of airlines) {
    const airlineCode = airline.iata || airline.code;
    if (!airlineCode) continue;
    
    const code = airline.iata?.toLowerCase() || airline.code?.toLowerCase();
    airlineAirportsMap.set(code, new Set());
    
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

  const allUrls: string[] = [];

  for (const airline of airlines) {
    const code = airline.iata?.toLowerCase() || airline.code?.toLowerCase();
    if (!code) continue;

    const uniqueAirports = airlineAirportsMap.get(code);
    if (!uniqueAirports || uniqueAirports.size === 0) continue;

    for (const airportIata of uniqueAirports) {
      const airport = airports.find(
        (a: any) => a.iata_from === airportIata || a.iata === airportIata
      );
      
      if (airport && (airport.departure_count > 0 || airport.arrival_count > 0)) {
        allUrls.push(`  <url>
    <loc>${baseUrl}/airlines/${code}/${airportIata.toLowerCase()}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
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

