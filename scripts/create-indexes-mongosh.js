/**
 * MongoDB Index Creation Script (mongosh version)
 * Use this if you prefer to run directly in mongosh
 * 
 * Usage:
 *   mongosh "your-connection-string" < scripts/create-indexes-mongosh.js
 *   OR
 *   mongosh
 *   use flights
 *   load('scripts/create-indexes-mongosh.js')
 */

// Switch to flights database
db = db.getSiblingDB('flights');

print('🚀 Starting index creation...\n');

// ============================================
// AIRPORTS COLLECTION INDEXES
// ============================================
print('📊 Creating indexes for "airports" collection...');
db.airports.createIndex({ iata_from: 1 }, { unique: true, name: 'idx_iata_from' });
db.airports.createIndex({ country: 1 }, { name: 'idx_country' });
db.airports.createIndex({ departure_count: -1, arrival_count: -1 }, { name: 'idx_active_airports' });
db.airports.createIndex({ country: 1, departure_count: -1 }, { name: 'idx_country_departures' });
db.airports.createIndex({ city: 1 }, { name: 'idx_city' });
db.airports.createIndex({ country: 1, city: 1 }, { name: 'idx_country_city' });
print('  ✅ Created 6 indexes for airports\n');

// ============================================
// AIRPORTFINAL COLLECTION INDEXES
// ============================================
print('📊 Creating indexes for "airportfinal" collection...');
db.airportfinal.createIndex({ iata: 1 }, { unique: true, name: 'idx_iata' });
db.airportfinal.createIndex({ country: 1 }, { name: 'idx_country' });
db.airportfinal.createIndex({ iata: 1, country: 1 }, { name: 'idx_iata_country' });
db.airportfinal.createIndex({ city: 1 }, { name: 'idx_city' });
print('  ✅ Created 4 indexes for airportfinal\n');

// ============================================
// ROUTES COLLECTION INDEXES
// ============================================
print('📊 Creating indexes for "routes" collection...');
db.routes.createIndex({ origin_iata: 1, destination_iata: 1 }, { unique: true, name: 'idx_route_unique' });
db.routes.createIndex({ origin_iata: 1 }, { name: 'idx_origin' });
db.routes.createIndex({ destination_iata: 1 }, { name: 'idx_destination' });
db.routes.createIndex({ has_flight_data: 1 }, { name: 'idx_has_flight_data' });
db.routes.createIndex({ origin_iata: 1, has_flight_data: 1 }, { name: 'idx_origin_active' });
db.routes.createIndex({ destination_iata: 1, has_flight_data: 1 }, { name: 'idx_destination_active' });
db.routes.createIndex({ destination_city: 1 }, { name: 'idx_destination_city' });
print('  ✅ Created 7 indexes for routes\n');

// ============================================
// AIRLINES COLLECTION INDEXES
// ============================================
print('📊 Creating indexes for "airlines" collection...');
db.airlines.createIndex({ code: 1 }, { unique: true, name: 'idx_code' });
db.airlines.createIndex({ iata: 1 }, { name: 'idx_iata' });
db.airlines.createIndex({ country: 1 }, { name: 'idx_country' });
db.airlines.createIndex({ name: 1 }, { name: 'idx_name' });
db.airlines.createIndex({ code: 1, iata: 1 }, { name: 'idx_code_iata' });
print('  ✅ Created 5 indexes for airlines\n');

// ============================================
// DEPARTURES COLLECTION INDEXES
// ============================================
print('📊 Creating indexes for "departures" collection...');
db.departures.createIndex({ origin_iata: 1 }, { name: 'idx_origin' });
db.departures.createIndex({ airline_iata: 1 }, { name: 'idx_airline' });
db.departures.createIndex({ destination_iata: 1 }, { name: 'idx_destination' });
db.departures.createIndex({ origin_iata: 1, airline_iata: 1 }, { name: 'idx_origin_airline' });
db.departures.createIndex({ origin_iata: 1, destination_iata: 1 }, { name: 'idx_route' });
db.departures.createIndex({ airline_iata: 1, origin_iata: 1, destination_iata: 1 }, { name: 'idx_airline_route' });
db.departures.createIndex({ departure_time: 1 }, { name: 'idx_departure_time' });
db.departures.createIndex({ origin_iata: 1, departure_time: 1 }, { name: 'idx_origin_departure_time' });
print('  ✅ Created 8 indexes for departures\n');

// ============================================
// ARRIVALS COLLECTION INDEXES
// ============================================
print('📊 Creating indexes for "arrivals" collection...');
db.arrivals.createIndex({ origin_iata: 1 }, { name: 'idx_origin' });
db.arrivals.createIndex({ airline_iata: 1 }, { name: 'idx_airline' });
db.arrivals.createIndex({ destination_iata: 1 }, { name: 'idx_destination' });
db.arrivals.createIndex({ origin_iata: 1, airline_iata: 1 }, { name: 'idx_origin_airline' });
db.arrivals.createIndex({ arrival_time: 1 }, { name: 'idx_arrival_time' });
db.arrivals.createIndex({ origin_iata: 1, arrival_time: 1 }, { name: 'idx_origin_arrival_time' });
print('  ✅ Created 6 indexes for arrivals\n');

// ============================================
// DEEP_ROUTES COLLECTION INDEXES
// ============================================
print('📊 Creating indexes for "deep_routes" collection...');
db.deep_routes.createIndex({ origin_iata: 1, destination_iata: 1 }, { unique: true, name: 'idx_route_unique' });
print('  ✅ Created 1 index for deep_routes\n');

// ============================================
// DESTINATIONS COLLECTION INDEXES
// ============================================
print('📊 Creating indexes for "destinations" collection...');
db.destinations.createIndex({ destination_iata: 1 }, { unique: true, name: 'idx_destination_iata' });
print('  ✅ Created 1 index for destinations\n');

// ============================================
// TERMINALS COLLECTION INDEXES (if exists)
// ============================================
print('📊 Creating indexes for "terminals" collection (if exists)...');
try {
  const collections = db.getCollectionNames();
  if (collections.includes('terminals')) {
    db.terminals.createIndex({ airport_iata: 1 }, { name: 'idx_airport_iata' });
    db.terminals.createIndex({ airport_iata: 1, airline_iata: 1 }, { name: 'idx_airport_airline' });
    print('  ✅ Created 2 indexes for terminals\n');
  } else {
    print('  ⚠ Collection "terminals" does not exist, skipping...\n');
  }
} catch (error) {
  print('  ⚠ Could not create indexes for "terminals" collection\n');
}

print('✅ All indexes created successfully!\n');
print('📈 Expected performance improvements:');
print('  • Airport lookups: ~10-100x faster');
print('  • Route queries: ~50-500x faster');
print('  • Flight queries: ~20-200x faster');
print('  • Country-wise queries: ~5-50x faster\n');

