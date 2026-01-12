/**
 * Script to print one example URL for each page type
 * Run with: npx tsx scripts/print-sample-urls.ts
 */

import { getDatabase } from '../lib/mongodb';
import { getAllAirports, getAllAirlines } from '../lib/queries';
import { formatRouteSlug } from '../lib/seo';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function printSampleUrls() {
  try {
    console.log('========================================');
    console.log('SAMPLE URL FOR EACH PAGE TYPE');
    console.log('========================================\n');

    // Core pages
    console.log('=== CORE PAGES ===');
    console.log(`Home: ${BASE_URL}/`);
    console.log(`Flights Listing: ${BASE_URL}/flights`);
    console.log(`Airports Listing: ${BASE_URL}/airports`);
    console.log(`Airlines Listing: ${BASE_URL}/airlines\n`);

    // Trust pages
    console.log('=== TRUST & AUTHORITY PAGES ===');
    console.log(`Manifesto: ${BASE_URL}/manifesto`);
    console.log(`How We Help: ${BASE_URL}/how-we-help`);
    console.log(`Editorial Policy: ${BASE_URL}/editorial-policy`);
    console.log(`Corrections: ${BASE_URL}/corrections\n`);

    // Get one airport
    const airports = await getAllAirports();
    if (airports.length > 0) {
      const airport = airports[0];
      const iata = airport.iata_from.toLowerCase();
      console.log('=== AIRPORT PAGES ===');
      console.log(`Airport Detail: ${BASE_URL}/airports/${iata}`);
      console.log(`Airport Departures: ${BASE_URL}/airports/${iata}/departures`);
      console.log(`Airport Arrivals: ${BASE_URL}/airports/${iata}/arrivals\n`);
    }

    // Get one route
    const db = await getDatabase();
    const routesCollection = db.collection('routes');
    const route = await routesCollection.findOne({ has_flight_data: true });
    if (route) {
      const routeSlug = formatRouteSlug(route.origin_iata, route.destination_iata);
      console.log('=== FLIGHT ROUTE PAGES ===');
      console.log(`Flight Route: ${BASE_URL}/flights/${routeSlug}`);
      console.log(`Flights From: ${BASE_URL}/flights/from-${route.origin_iata.toLowerCase()}`);
      console.log(`Flights To: ${BASE_URL}/flights/to-${route.destination_iata.toLowerCase()}\n`);
    }

    // Get one airline
    const airlines = await getAllAirlines();
    if (airlines.length > 0) {
      const airline = airlines[0];
      const code = (airline.iata || airline.code || '').toLowerCase();
      if (code) {
        console.log('=== AIRLINE PAGES ===');
        console.log(`Airline Detail: ${BASE_URL}/airlines/${code}`);
        
        // Try to find a route for this airline
        const airlineRoute = await routesCollection.findOne({
          $or: [
            { airline_iata: code.toUpperCase() },
            { airlines: code.toUpperCase() }
          ]
        });
        
        if (airlineRoute) {
          const routeSlug = formatRouteSlug(airlineRoute.origin_iata, airlineRoute.destination_iata);
          console.log(`Airline From Airport: ${BASE_URL}/airlines/${code}/from-${airlineRoute.origin_iata.toLowerCase()}`);
          console.log(`Airline Route: ${BASE_URL}/airlines/${code}/${routeSlug}`);
        } else {
          // Use the route we found earlier
          if (route) {
            const routeSlug = formatRouteSlug(route.origin_iata, route.destination_iata);
            console.log(`Airline From Airport: ${BASE_URL}/airlines/${code}/from-${route.origin_iata.toLowerCase()}`);
            console.log(`Airline Route: ${BASE_URL}/airlines/${code}/${routeSlug}`);
          }
        }
      }
    }

    console.log('\n========================================');
    console.log('Done!');
    console.log('========================================\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

printSampleUrls().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

