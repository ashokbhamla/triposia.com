/**
 * Fix Duplicate Keys Script
 * Finds and handles duplicate keys before creating unique indexes
 * 
 * Usage:
 *   node scripts/fix-duplicates.js
 */

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://triposia:40JeMwmuN75ZxRCL@flights.urpjin.mongodb.net/flights?retryWrites=true&w=majority';
const dbName = 'flights';

async function fixDuplicates() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(dbName);
    
    // ============================================
    // Check for duplicates in airports collection
    // ============================================
    console.log('🔍 Checking for duplicates in "airports" collection...');
    const airportsCollection = db.collection('airports');
    
    const airportDuplicates = await airportsCollection.aggregate([
      { $group: { _id: '$iata_from', count: { $sum: 1 }, docs: { $push: '$$ROOT' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (airportDuplicates.length > 0) {
      console.log(`⚠️  Found ${airportDuplicates.length} duplicate iata_from values:\n`);
      
      for (const dup of airportDuplicates) {
        console.log(`   ${dup._id}: ${dup.count} documents`);
        // Keep the one with highest departure_count or arrival_count
        const sorted = dup.docs.sort((a, b) => {
          const aScore = (a.departure_count || 0) + (a.arrival_count || 0);
          const bScore = (b.departure_count || 0) + (b.arrival_count || 0);
          return bScore - aScore;
        });
        
        // Keep the first (best) one, delete the rest
        const toKeep = sorted[0];
        const toDelete = sorted.slice(1);
        
        console.log(`      Keeping: _id=${toKeep._id} (departures: ${toKeep.departure_count || 0}, arrivals: ${toKeep.arrival_count || 0})`);
        
        for (const doc of toDelete) {
          console.log(`      Deleting: _id=${doc._id} (departures: ${doc.departure_count || 0}, arrivals: ${doc.arrival_count || 0})`);
          await airportsCollection.deleteOne({ _id: doc._id });
        }
      }
      
      console.log('\n✅ Duplicates removed from airports collection\n');
    } else {
      console.log('✅ No duplicates found in airports collection\n');
    }
    
    // ============================================
    // Check for duplicates in routes collection
    // ============================================
    console.log('🔍 Checking for duplicates in "routes" collection...');
    const routesCollection = db.collection('routes');
    
    const routeDuplicates = await routesCollection.aggregate([
      { 
        $group: { 
          _id: { origin: '$origin_iata', dest: '$destination_iata' }, 
          count: { $sum: 1 }, 
          docs: { $push: '$$ROOT' } 
        } 
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (routeDuplicates.length > 0) {
      console.log(`⚠️  Found ${routeDuplicates.length} duplicate routes:\n`);
      
      for (const dup of routeDuplicates) {
        const routeKey = `${dup._id.origin}-${dup._id.dest}`;
        console.log(`   ${routeKey}: ${dup.count} documents`);
        
        // Keep the one with has_flight_data = true, or the first one
        const sorted = dup.docs.sort((a, b) => {
          if (a.has_flight_data && !b.has_flight_data) return -1;
          if (!a.has_flight_data && b.has_flight_data) return 1;
          return 0;
        });
        
        const toKeep = sorted[0];
        const toDelete = sorted.slice(1);
        
        console.log(`      Keeping: _id=${toKeep._id} (has_flight_data: ${toKeep.has_flight_data})`);
        
        for (const doc of toDelete) {
          console.log(`      Deleting: _id=${doc._id} (has_flight_data: ${doc.has_flight_data})`);
          await routesCollection.deleteOne({ _id: doc._id });
        }
      }
      
      console.log('\n✅ Duplicates removed from routes collection\n');
    } else {
      console.log('✅ No duplicates found in routes collection\n');
    }
    
    // ============================================
    // Check for duplicates in airlines collection
    // ============================================
    console.log('🔍 Checking for duplicates in "airlines" collection...');
    const airlinesCollection = db.collection('airlines');
    
    const airlineDuplicates = await airlinesCollection.aggregate([
      { $group: { _id: '$code', count: { $sum: 1 }, docs: { $push: '$$ROOT' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (airlineDuplicates.length > 0) {
      console.log(`⚠️  Found ${airlineDuplicates.length} duplicate airline codes:\n`);
      
      for (const dup of airlineDuplicates) {
        console.log(`   ${dup._id}: ${dup.count} documents`);
        // Keep the first one (usually the most complete)
        const toKeep = dup.docs[0];
        const toDelete = dup.docs.slice(1);
        
        console.log(`      Keeping: _id=${toKeep._id}`);
        
        for (const doc of toDelete) {
          console.log(`      Deleting: _id=${doc._id}`);
          await airlinesCollection.deleteOne({ _id: doc._id });
        }
      }
      
      console.log('\n✅ Duplicates removed from airlines collection\n');
    } else {
      console.log('✅ No duplicates found in airlines collection\n');
    }
    
    // ============================================
    // Check for duplicates in airportfinal collection
    // ============================================
    console.log('🔍 Checking for duplicates in "airportfinal" collection...');
    const airportFinalCollection = db.collection('airportfinal');
    
    const airportFinalDuplicates = await airportFinalCollection.aggregate([
      { $group: { _id: '$iata', count: { $sum: 1 }, docs: { $push: '$$ROOT' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (airportFinalDuplicates.length > 0) {
      console.log(`⚠️  Found ${airportFinalDuplicates.length} duplicate iata values:\n`);
      
      for (const dup of airportFinalDuplicates) {
        console.log(`   ${dup._id}: ${dup.count} documents`);
        // Keep the first one
        const toKeep = dup.docs[0];
        const toDelete = dup.docs.slice(1);
        
        console.log(`      Keeping: _id=${toKeep._id}`);
        
        for (const doc of toDelete) {
          console.log(`      Deleting: _id=${doc._id}`);
          await airportFinalCollection.deleteOne({ _id: doc._id });
        }
      }
      
      console.log('\n✅ Duplicates removed from airportfinal collection\n');
    } else {
      console.log('✅ No duplicates found in airportfinal collection\n');
    }
    
    console.log('✅ Duplicate cleanup completed!');
    console.log('\n💡 You can now run: npm run create-indexes');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  fixDuplicates()
    .then(() => {
      console.log('\n✨ Duplicate cleanup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Duplicate cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { fixDuplicates };

