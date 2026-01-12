# MongoDB Indexing Guide

This guide explains how to optimize your MongoDB database with indexes for faster query performance.

## Quick Start

### Option 1: Using Node.js Script (Recommended)

```bash
# Set your MongoDB connection string
export MONGODB_URI="your-connection-string"

# Run the index creation script
npm run create-indexes

# OR directly with node
node scripts/create-indexes.js
```

### Option 2: Using mongosh (MongoDB Shell)

```bash
# Run the mongosh script
mongosh "your-connection-string" < scripts/create-indexes-mongosh.js

# OR connect first, then load
mongosh "your-connection-string"
use flights
load('scripts/create-indexes-mongosh.js')
```

### Option 3: Manual Commands (Copy & Paste)

If you prefer to run commands manually, see the [Manual Index Creation](#manual-index-creation) section below.

## Indexes Created

### 1. Airports Collection (6 indexes)
- `iata_from` (unique) - Primary airport lookup
- `country` - Country-wise queries
- `departure_count, arrival_count` - Active airports filter
- `country, departure_count` - Country sorting
- `city` - City-based queries
- `country, city` - City-country pairs

### 2. Airportfinal Collection (4 indexes)
- `iata` (unique) - Primary lookup
- `country` - Country queries
- `iata, country` - Batch lookups
- `city` - City queries

### 3. Routes Collection (7 indexes)
- `origin_iata, destination_iata` (unique) - Primary route lookup
- `origin_iata` - Routes from airport
- `destination_iata` - Routes to airport
- `has_flight_data` - Active routes filter
- `origin_iata, has_flight_data` - Active routes from airport
- `destination_iata, has_flight_data` - Active routes to airport
- `destination_city` - City-based route queries

### 4. Airlines Collection (5 indexes)
- `code` (unique) - Primary airline lookup
- `iata` - Alternative lookup
- `country` - Country filtering
- `name` - Name search
- `code, iata` - Flexible lookups

### 5. Departures Collection (8 indexes)
- `origin_iata` - Flights from airport
- `airline_iata` - Airline flights
- `destination_iata` - Destination queries
- `origin_iata, airline_iata` - Airline flights from airport
- `origin_iata, destination_iata` - Route flights
- `airline_iata, origin_iata, destination_iata` - Airline route flights
- `departure_time` - Time sorting
- `origin_iata, departure_time` - Sorted departures

### 6. Arrivals Collection (6 indexes)
- `origin_iata` - Arrivals to airport
- `airline_iata` - Airline arrivals
- `destination_iata` - Destination queries
- `origin_iata, airline_iata` - Airline arrivals to airport
- `arrival_time` - Time sorting
- `origin_iata, arrival_time` - Sorted arrivals

### 7. Deep Routes Collection (1 index)
- `origin_iata, destination_iata` (unique) - Primary route lookup

### 8. Destinations Collection (1 index)
- `destination_iata` (unique) - Primary lookup

### 9. Terminals Collection (2 indexes, if exists)
- `airport_iata` - Airport terminal lookup
- `airport_iata, airline_iata` - Airline terminal lookup

## Expected Performance Improvements

After creating these indexes, you should see:

- **Airport lookups**: 10-100x faster
- **Route queries**: 50-500x faster
- **Flight queries**: 20-200x faster
- **Country-wise queries**: 5-50x faster
- **Complex compound queries**: 100-1000x faster

## Manual Index Creation

If you prefer to create indexes manually, here are the commands:

### Connect to MongoDB

```bash
mongosh "your-connection-string"
use flights
```

### Airports Collection

```javascript
db.airports.createIndex({ iata_from: 1 }, { unique: true });
db.airports.createIndex({ country: 1 });
db.airports.createIndex({ departure_count: -1, arrival_count: -1 });
db.airports.createIndex({ country: 1, departure_count: -1 });
db.airports.createIndex({ city: 1 });
db.airports.createIndex({ country: 1, city: 1 });
```

### Routes Collection

```javascript
db.routes.createIndex({ origin_iata: 1, destination_iata: 1 }, { unique: true });
db.routes.createIndex({ origin_iata: 1 });
db.routes.createIndex({ destination_iata: 1 });
db.routes.createIndex({ has_flight_data: 1 });
db.routes.createIndex({ origin_iata: 1, has_flight_data: 1 });
db.routes.createIndex({ destination_iata: 1, has_flight_data: 1 });
db.routes.createIndex({ destination_city: 1 });
```

### Airlines Collection

```javascript
db.airlines.createIndex({ code: 1 }, { unique: true });
db.airlines.createIndex({ iata: 1 });
db.airlines.createIndex({ country: 1 });
db.airlines.createIndex({ name: 1 });
db.airlines.createIndex({ code: 1, iata: 1 });
```

### Departures Collection

```javascript
db.departures.createIndex({ origin_iata: 1 });
db.departures.createIndex({ airline_iata: 1 });
db.departures.createIndex({ destination_iata: 1 });
db.departures.createIndex({ origin_iata: 1, airline_iata: 1 });
db.departures.createIndex({ origin_iata: 1, destination_iata: 1 });
db.departures.createIndex({ airline_iata: 1, origin_iata: 1, destination_iata: 1 });
db.departures.createIndex({ departure_time: 1 });
db.departures.createIndex({ origin_iata: 1, departure_time: 1 });
```

### Arrivals Collection

```javascript
db.arrivals.createIndex({ origin_iata: 1 });
db.arrivals.createIndex({ airline_iata: 1 });
db.arrivals.createIndex({ destination_iata: 1 });
db.arrivals.createIndex({ origin_iata: 1, airline_iata: 1 });
db.arrivals.createIndex({ arrival_time: 1 });
db.arrivals.createIndex({ origin_iata: 1, arrival_time: 1 });
```

## Verifying Indexes

### List all indexes for a collection

```javascript
db.airports.getIndexes();
db.routes.getIndexes();
db.airlines.getIndexes();
```

### Check index usage statistics

```javascript
db.airports.aggregate([{ $indexStats: {} }]);
db.routes.aggregate([{ $indexStats: {} }]);
```

### Check index size

```javascript
db.airports.stats().indexSizes;
db.routes.stats().indexSizes;
```

## Monitoring Index Performance

### Explain query execution

```javascript
// See which indexes are used
db.airports.find({ iata_from: "DEL" }).explain("executionStats");
db.routes.find({ origin_iata: "DEL", has_flight_data: true }).explain("executionStats");
```

### Check for missing indexes

MongoDB will log slow queries. Check your logs for queries taking > 100ms that don't use indexes.

## Maintenance

### Rebuild indexes (if needed)

```javascript
// Rebuild all indexes for a collection
db.airports.reIndex();
```

### Drop unused indexes

```javascript
// Only drop if you're sure they're not used
db.collection.dropIndex("index_name");
```

## Best Practices

1. **Create indexes after data insertion** - Indexes are created faster on existing data
2. **Monitor index usage** - Remove indexes that aren't being used
3. **Balance read vs write performance** - More indexes = faster reads, slower writes
4. **Use compound indexes** - Match the order of fields in your queries
5. **Index selectivity** - Index fields with high cardinality (many unique values)

## Troubleshooting

### Index creation fails with "duplicate key"

This means you have duplicate values in a field marked as unique. Fix the data first:

```javascript
// Find duplicates
db.airports.aggregate([
  { $group: { _id: "$iata_from", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]);
```

### Index creation is slow

For large collections, indexes can take time. Use `background: true` option:

```javascript
db.collection.createIndex({ field: 1 }, { background: true });
```

### Out of memory errors

If you have very large collections, create indexes one at a time during off-peak hours.

## Support

For issues or questions, check:
- MongoDB Index Documentation: https://docs.mongodb.com/manual/indexes/
- MongoDB Performance Best Practices: https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/

