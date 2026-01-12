import { getAirportSummary, getRoute, getFlightsByRoute, getDepartures, getArrivals, getAirline, getAirlineRoutes } from '../lib/queries';

async function testPages() {
  try {
    console.log('Testing page data queries...\n');
    
    // Test airport page data
    console.log('1. Testing Airport Page (DEL)...');
    const airport = await getAirportSummary('DEL');
    if (airport) {
      console.log(`   ✅ Airport: ${airport.iata_from}`);
      console.log(`      Destinations: ${airport.destinations_count}`);
      console.log(`      Departures: ${airport.departure_count}`);
      console.log(`      Arrivals: ${airport.arrival_count}`);
    }
    
    // Test departures
    console.log('\n2. Testing Departures (DEL)...');
    const departures = await getDepartures('DEL', 5);
    console.log(`   ✅ Found ${departures.length} departures`);
    if (departures.length > 0) {
      console.log(`      Sample: ${departures[0].flight_number} to ${departures[0].destination_iata}`);
    }
    
    // Test arrivals
    console.log('\n3. Testing Arrivals (DEL)...');
    const arrivals = await getArrivals('DEL', 5);
    console.log(`   ✅ Found ${arrivals.length} arrivals`);
    if (arrivals.length > 0) {
      console.log(`      Sample: ${arrivals[0].flight_number} from ${arrivals[0].origin_iata}`);
    }
    
    // Test route page
    console.log('\n4. Testing Route Page (DEL-BOM)...');
    const route = await getRoute('DEL', 'BOM');
    if (route) {
      console.log(`   ✅ Route: ${route.origin_iata} → ${route.destination_iata}`);
      console.log(`      City: ${route.destination_city}`);
      console.log(`      Flights/day: ${route.flights_per_day}`);
      
      const flights = await getFlightsByRoute('DEL', 'BOM');
      console.log(`      Flights found: ${flights.length}`);
      if (flights.length > 0) {
        console.log(`      Sample: ${flights[0].flight_number} by ${flights[0].airline_name}`);
      }
    }
    
    // Test airline page
    console.log('\n5. Testing Airline Page (6E - IndiGo)...');
    const airline = await getAirline('6E');
    if (airline) {
      console.log(`   ✅ Airline: ${airline.name} (${airline.iata})`);
      const routes = await getAirlineRoutes('6E');
      console.log(`      Routes: ${routes.length}`);
      if (routes.length > 0) {
        console.log(`      Sample route: ${routes[0].origin_iata} → ${routes[0].destination_iata}`);
      }
    } else {
      console.log('   ⚠️  Airline 6E not found, trying IW...');
      const airline2 = await getAirline('IW');
      if (airline2) {
        console.log(`   ✅ Airline: ${airline2.name} (${airline2.iata})`);
        const routes = await getAirlineRoutes('IW');
        console.log(`      Routes: ${routes.length}`);
      }
    }
    
    console.log('\n✅ All page data queries successful!');
    console.log('\n📝 Test URLs to visit:');
    console.log('   http://localhost:3000');
    console.log('   http://localhost:3000/airports/DEL');
    console.log('   http://localhost:3000/airports/DEL/departures');
    console.log('   http://localhost:3000/airports/DEL/arrivals');
    console.log('   http://localhost:3000/flights/del-bom');
    console.log('   http://localhost:3000/flights/from-DEL');
    console.log('   http://localhost:3000/airlines/IW');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testPages();

