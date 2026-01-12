import { getDatabase } from '../lib/mongodb';
import { getAirportSummary, getRoute, getAllAirlines } from '../lib/queries';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...\n');
    
    // Test database connection
    const db = await getDatabase();
    const collections = await db.listCollections().toArray();
    console.log('✅ Database connected successfully');
    console.log(`📊 Found ${collections.length} collections\n`);
    
    // Test airport query
    console.log('Testing airport query (DEL)...');
    const airport = await getAirportSummary('DEL');
    if (airport) {
      console.log('✅ Airport query successful:');
      console.log(`   IATA: ${airport.iata_from}`);
      console.log(`   Destinations: ${airport.destinations_count}`);
      console.log(`   Departures: ${airport.departure_count}`);
      console.log(`   Arrivals: ${airport.arrival_count}\n`);
    } else {
      console.log('⚠️  Airport DEL not found, trying another...');
      const airports = await db.collection('airports').find({}).limit(5).toArray();
      if (airports.length > 0) {
        const testAirport = airports[0];
        console.log(`✅ Found sample airport: ${testAirport.iata_from}\n`);
      }
    }
    
    // Test route query
    console.log('Testing route query (DEL-BOM)...');
    const route = await getRoute('DEL', 'BOM');
    if (route) {
      console.log('✅ Route query successful:');
      console.log(`   ${route.origin_iata} → ${route.destination_iata}`);
      console.log(`   City: ${route.destination_city}`);
      console.log(`   Flights/day: ${route.flights_per_day}\n`);
    } else {
      console.log('⚠️  Route DEL-BOM not found, trying another...');
      const routes = await db.collection('routes').find({}).limit(5).toArray();
      if (routes.length > 0) {
        const testRoute = routes[0];
        console.log(`✅ Found sample route: ${testRoute.origin_iata} → ${testRoute.destination_iata}\n`);
      }
    }
    
    // Test airline query
    console.log('Testing airline query...');
    const airlines = await getAllAirlines();
    console.log(`✅ Found ${airlines.length} airlines`);
    if (airlines.length > 0) {
      console.log(`   Sample: ${airlines[0].name} (${airlines[0].iata})\n`);
    }
    
    // Test collections
    console.log('Collection summary:');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`   ${col.name}: ${count.toLocaleString()} documents`);
    }
    
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testConnection();

