/**
 * Script to generate all URLs in the application
 * Run with: npx tsx scripts/generate-all-urls.ts
 */

import { getDatabase } from '../lib/mongodb';
import { getAllAirports, getAllAirlines } from '../lib/queries';
import { formatRouteSlug } from '../lib/seo';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://triposia.com';

async function generateAllUrls() {
  try {
    const db = await getDatabase();
    const urls: string[] = [];

    // Core pages
    urls.push(`${BASE_URL}/`);
    urls.push(`${BASE_URL}/flights`);
    urls.push(`${BASE_URL}/airports`);
    urls.push(`${BASE_URL}/airlines`);

    // Trust pages
    urls.push(`${BASE_URL}/manifesto`);
    urls.push(`${BASE_URL}/how-we-help`);
    urls.push(`${BASE_URL}/editorial-policy`);
    urls.push(`${BASE_URL}/corrections`);

    // Airports
    console.log('Fetching airports...');
    const airports = await getAllAirports();
    for (const airport of airports) {
      const iata = airport.iata_from.toLowerCase();
      urls.push(`${BASE_URL}/airports/${iata}`);
      urls.push(`${BASE_URL}/airports/${iata}/departures`);
      urls.push(`${BASE_URL}/airports/${iata}/arrivals`);
    }
    console.log(`Found ${airports.length} airports`);

    // Routes
    console.log('Fetching routes...');
    const routesCollection = db.collection('routes');
    const routes = await routesCollection
      .find({ has_flight_data: true })
      .limit(1000)
      .toArray();
    
    const processedOrigins = new Set<string>();
    const processedDestinations = new Set<string>();
    
    for (const route of routes) {
      const routeSlug = formatRouteSlug(route.origin_iata, route.destination_iata);
      urls.push(`${BASE_URL}/flights/${routeSlug}`);
      
      if (!processedOrigins.has(route.origin_iata)) {
        processedOrigins.add(route.origin_iata);
        urls.push(`${BASE_URL}/flights/from-${route.origin_iata.toLowerCase()}`);
      }
      
      if (!processedDestinations.has(route.destination_iata)) {
        processedDestinations.add(route.destination_iata);
        urls.push(`${BASE_URL}/flights/to-${route.destination_iata.toLowerCase()}`);
      }
    }
    console.log(`Found ${routes.length} routes`);

    // Airlines
    console.log('Fetching airlines...');
    const airlines = await getAllAirlines();
    for (const airline of airlines) {
      const code = (airline.iata || airline.code || '').toLowerCase();
      if (code) {
        urls.push(`${BASE_URL}/airlines/${code}`);
        
        // Get routes for this airline
        const airlineRoutes = await routesCollection
          .find({ 
            $or: [
              { airline_iata: code.toUpperCase() },
              { airlines: code.toUpperCase() }
            ]
          })
          .limit(100)
          .toArray();
        
        const airlineOrigins = new Set<string>();
        const airlineRouteSlugs = new Set<string>();
        
        for (const route of airlineRoutes) {
          if (!airlineOrigins.has(route.origin_iata)) {
            airlineOrigins.add(route.origin_iata);
            urls.push(`${BASE_URL}/airlines/${code}/from-${route.origin_iata.toLowerCase()}`);
          }
          
          const routeSlug = formatRouteSlug(route.origin_iata, route.destination_iata);
          if (!airlineRouteSlugs.has(routeSlug)) {
            airlineRouteSlugs.add(routeSlug);
            urls.push(`${BASE_URL}/airlines/${code}/${routeSlug}`);
          }
        }
      }
    }
    console.log(`Found ${airlines.length} airlines`);

    // Output all URLs
    console.log('\n========================================');
    console.log(`TOTAL URLs: ${urls.length}`);
    console.log('========================================\n');
    
    // Group by type
    console.log('\n=== CORE PAGES ===');
    urls.filter(u => ['/', '/flights', '/airports', '/airlines'].some(p => u.endsWith(p))).forEach(u => console.log(u));
    
    console.log('\n=== TRUST PAGES ===');
    urls.filter(u => u.includes('/manifesto') || u.includes('/how-we-help') || u.includes('/editorial-policy') || u.includes('/corrections')).forEach(u => console.log(u));
    
    console.log('\n=== AIRPORT PAGES ===');
    urls.filter(u => u.startsWith(`${BASE_URL}/airports/`) && !u.includes('/departures') && !u.includes('/arrivals')).slice(0, 20).forEach(u => console.log(u));
    console.log(`... and ${urls.filter(u => u.startsWith(`${BASE_URL}/airports/`) && !u.includes('/departures') && !u.includes('/arrivals')).length - 20} more`);
    
    console.log('\n=== AIRPORT DEPARTURES ===');
    urls.filter(u => u.includes('/departures')).slice(0, 10).forEach(u => console.log(u));
    console.log(`... and ${urls.filter(u => u.includes('/departures')).length - 10} more`);
    
    console.log('\n=== AIRPORT ARRIVALS ===');
    urls.filter(u => u.includes('/arrivals')).slice(0, 10).forEach(u => console.log(u));
    console.log(`... and ${urls.filter(u => u.includes('/arrivals')).length - 10} more`);
    
    console.log('\n=== FLIGHT ROUTES ===');
    urls.filter(u => u.startsWith(`${BASE_URL}/flights/`) && !u.includes('/from-') && !u.includes('/to-')).slice(0, 20).forEach(u => console.log(u));
    console.log(`... and ${urls.filter(u => u.startsWith(`${BASE_URL}/flights/`) && !u.includes('/from-') && !u.includes('/to-')).length - 20} more`);
    
    console.log('\n=== FLIGHTS FROM ===');
    urls.filter(u => u.includes('/flights/from-')).slice(0, 10).forEach(u => console.log(u));
    console.log(`... and ${urls.filter(u => u.includes('/flights/from-')).length - 10} more`);
    
    console.log('\n=== FLIGHTS TO ===');
    urls.filter(u => u.includes('/flights/to-')).slice(0, 10).forEach(u => console.log(u));
    console.log(`... and ${urls.filter(u => u.includes('/flights/to-')).length - 10} more`);
    
    console.log('\n=== AIRLINE PAGES ===');
    urls.filter(u => u.match(/\/airlines\/[a-z0-9]+$/) && !u.includes('/from-') && !u.includes('/')).slice(0, 20).forEach(u => console.log(u));
    
    console.log('\n=== AIRLINE FROM ROUTES ===');
    urls.filter(u => u.includes('/airlines/') && u.includes('/from-')).slice(0, 10).forEach(u => console.log(u));
    console.log(`... and ${urls.filter(u => u.includes('/airlines/') && u.includes('/from-')).length - 10} more`);
    
    console.log('\n=== AIRLINE SPECIFIC ROUTES ===');
    urls.filter(u => {
      const match = u.match(/\/airlines\/([a-z0-9]+)\/([a-z]{3}-[a-z]{3})$/);
      return match !== null;
    }).slice(0, 10).forEach(u => console.log(u));
    console.log(`... and ${urls.filter(u => {
      const match = u.match(/\/airlines\/([a-z0-9]+)\/([a-z]{3}-[a-z]{3})$/);
      return match !== null;
    }).length - 10} more`);

    // Write all URLs to file
    const fs = require('fs');
    fs.writeFileSync('all-urls.txt', urls.join('\n'));
    console.log(`\n✅ All URLs saved to all-urls.txt (${urls.length} total)`);

  } catch (error) {
    console.error('Error generating URLs:', error);
    process.exit(1);
  }
}

generateAllUrls().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

