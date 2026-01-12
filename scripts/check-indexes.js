/**
 * MongoDB Index Verification Script
 * Check which indexes exist and their usage statistics
 * 
 * Usage:
 *   node scripts/check-indexes.js
 */

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://triposia:40JeMwmuN75ZxRCL@flights.urpjin.mongodb.net/flights?retryWrites=true&w=majority';
const dbName = 'flights';

async function checkIndexes() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(dbName);
    const collections = ['airports', 'airportfinal', 'routes', 'airlines', 'departures', 'arrivals', 'deep_routes', 'destinations', 'terminals'];
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        const stats = await collection.stats();
        
        console.log(`📊 ${collectionName.toUpperCase()} Collection`);
        console.log(`   Documents: ${stats.count.toLocaleString()}`);
        console.log(`   Indexes: ${indexes.length}`);
        
        if (indexes.length > 0) {
          indexes.forEach((index, idx) => {
            const keys = Object.keys(index.key).map(k => `${k}:${index.key[k]}`).join(', ');
            const unique = index.unique ? ' (unique)' : '';
            const name = index.name || 'unnamed';
            console.log(`   ${idx + 1}. ${name}: { ${keys} }${unique}`);
          });
        } else {
          console.log('   ⚠️  No indexes found!');
        }
        console.log('');
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`📊 ${collectionName.toUpperCase()} Collection`);
          console.log('   ⚠️  Collection does not exist\n');
        } else {
          console.error(`   ❌ Error checking ${collectionName}:`, error.message);
        }
      }
    }
    
    console.log('✅ Index check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  checkIndexes()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkIndexes };

