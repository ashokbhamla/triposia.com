/**
 * Script to analyze database structure and connections
 * Run with: npx tsx scripts/analyze-db-structure.ts
 */

import { getDatabase } from '../lib/mongodb';

async function analyzeDatabase() {
  try {
    const db = await getDatabase();
    
    console.log('========================================');
    console.log('DATABASE STRUCTURE ANALYSIS');
    console.log('========================================\n');

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name).join(', '));
    console.log('');

    // Analyze each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      
      // Get sample documents
      const samples = await collection.find({}).limit(5).toArray();
      
      if (samples.length > 0) {
        console.log(`=== ${collectionName.toUpperCase()} ===`);
        console.log(`Sample count: ${samples.length}`);
        
        // Get all unique keys from samples
        const allKeys = new Set<string>();
        samples.forEach((doc: any) => {
          Object.keys(doc).forEach(key => allKeys.add(key));
        });
        
        console.log('Fields:', Array.from(allKeys).sort().join(', '));
        console.log('');
        
        // Show sample structure
        if (samples[0]) {
          console.log('Sample document structure:');
          console.log(JSON.stringify(samples[0], null, 2).substring(0, 500));
          console.log('...\n');
        }
        
        // Get document count
        const count = await collection.countDocuments();
        console.log(`Total documents: ${count}`);
        console.log('');
      }
    }

    // Analyze relationships
    console.log('========================================');
    console.log('RELATIONSHIP ANALYSIS');
    console.log('========================================\n');

    // Check routes collection
    const routesCollection = db.collection('routes');
    const routeSample = await routesCollection.findOne({});
    if (routeSample) {
      console.log('Routes collection structure:');
      console.log('- Links airports via origin_iata and destination_iata');
      console.log('- Fields:', Object.keys(routeSample).join(', '));
      console.log('');
    }

    // Check departures/arrivals/flights collections
    const departuresCollection = db.collection('departures');
    const departureSample = await departuresCollection.findOne({});
    if (departureSample) {
      console.log('Departures collection structure:');
      console.log('- Links airlines via airline_iata');
      console.log('- Links routes via origin_iata and destination_iata');
      console.log('- Fields:', Object.keys(departureSample).join(', '));
      console.log('');
    }

    // Check airlines collection
    const airlinesCollection = db.collection('airlines');
    const airlineSample = await airlinesCollection.findOne({});
    if (airlineSample) {
      console.log('Airlines collection structure:');
      console.log('- Identified by iata code');
      console.log('- Fields:', Object.keys(airlineSample).join(', '));
      console.log('');
    }

    // Check airports collection
    const airportsCollection = db.collection('airports');
    const airportSample = await airportsCollection.findOne({});
    if (airportSample) {
      console.log('Airports collection structure:');
      console.log('- Identified by iata_from');
      console.log('- Fields:', Object.keys(airportSample).join(', '));
      console.log('');
    }

    // Analyze data connections
    console.log('========================================');
    console.log('DATA CONNECTIONS');
    console.log('========================================\n');

    // Example: Get a route and show all related data
    if (routeSample) {
      const origin = (routeSample as any).origin_iata;
      const destination = (routeSample as any).destination_iata;
      
      console.log(`Example route: ${origin} → ${destination}`);
      
      // Get flights for this route
      const routeFlights = await departuresCollection
        .find({
          origin_iata: origin,
          destination_iata: destination,
        })
        .limit(3)
        .toArray();
      
      console.log(`- Found ${routeFlights.length} flight(s) for this route`);
      
      if (routeFlights.length > 0) {
        const airlineCodes = new Set(routeFlights.map((f: any) => f.airline_iata));
        console.log(`- Airlines operating: ${Array.from(airlineCodes).join(', ')}`);
        
        // Get airline details
        for (const airlineCode of Array.from(airlineCodes).slice(0, 2)) {
          const airline = await airlinesCollection.findOne({ iata: airlineCode });
          if (airline) {
            console.log(`  - ${airlineCode}: ${(airline as any).name || 'N/A'}`);
          }
        }
      }
    }

    console.log('\n========================================');
    console.log('ANALYSIS COMPLETE');
    console.log('========================================\n');

  } catch (error) {
    console.error('Error analyzing database:', error);
    process.exit(1);
  }
}

analyzeDatabase().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

